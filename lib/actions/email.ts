'use server'

import { z } from 'zod'
import { getSessionUser } from '@/lib/auth/session'
import { createServiceClient } from '@/lib/supabase/server'
import { buildOrderEmailData, sampleOrderEmailData, type OrderEmailData, type OrderWithItems } from '@/lib/email/order-email-data'
import {
  renderNewOrderAlertEmail,
  renderOrderConfirmationEmail,
  renderOrderShippedEmail,
  type ShipmentTracking,
} from '@/lib/email/order-email-templates'
import { ORDERS_ADDRESS, sendEmail } from '@/lib/email/resend'

const orderNumberSchema = z.string().trim().regex(/^DHV-\d{4}-\d{6}$/, 'Order number must look like DHV-2026-123456')

export interface OrderEmailPreviews {
  success: boolean
  error?: string
  recipient?: string
  confirmation?: { subject: string; html: string }
  alert?: { subject: string; html: string }
  shipped?: { subject: string; html: string }
}

export interface TestEmailResult {
  success: boolean
  error?: string
  sentTo?: string
}

// Admin's own address: test emails only ever go to whoever is signed in
async function getAdminEmail(): Promise<string | null> {
  const session = await getSessionUser()
  const role = session?.profile?.role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return null
  return session?.profile?.email || session?.user?.email || null
}

// Shown in the sample shipped email, and for a real order that has no tracking saved yet
const SAMPLE_TRACKING: ShipmentTracking = { number: 'DHL1234567890', url: 'https://www.dhl.com/gb-en/home/tracking.html' }

// Sample data by default; a real order's data (and its saved tracking) when an order number is given
async function loadEmailData(
  orderNumber?: string
): Promise<{ data?: OrderEmailData; tracking?: ShipmentTracking; error?: string }> {
  if (!orderNumber) return { data: sampleOrderEmailData(), tracking: SAMPLE_TRACKING }

  const parsed = orderNumberSchema.safeParse(orderNumber)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: order, error } = await createServiceClient()
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('order_number', parsed.data)
    .maybeSingle()

  if (error) {
    console.error('[EmailTest] Error loading order:', error)
    return { error: 'Could not load that order' }
  }
  if (!order) return { error: `Order ${parsed.data} not found` }

  const hasTracking = Boolean(order.tracking_number || order.tracking_url)
  return {
    data: buildOrderEmailData(order as OrderWithItems),
    tracking: hasTracking ? { number: order.tracking_number, url: order.tracking_url } : SAMPLE_TRACKING,
  }
}

// Render the order emails without sending anything
export async function getOrderEmailPreviews(orderNumber?: string): Promise<OrderEmailPreviews> {
  const recipient = await getAdminEmail()
  if (!recipient) return { success: false, error: 'Admin access required' }

  const { data, tracking, error } = await loadEmailData(orderNumber)
  if (!data) return { success: false, error }

  const confirmation = renderOrderConfirmationEmail(data)
  const alert = renderNewOrderAlertEmail(data)
  const shipped = renderOrderShippedEmail(data, tracking ?? SAMPLE_TRACKING)
  return {
    success: true,
    recipient,
    confirmation: { subject: confirmation.subject, html: confirmation.html },
    alert: { subject: alert.subject, html: alert.html },
    shipped: { subject: shipped.subject, html: shipped.html },
  }
}

// Send the order emails to the signed-in admin only — never to the customer or the team
export async function sendTestOrderEmails(orderNumber?: string): Promise<TestEmailResult> {
  const recipient = await getAdminEmail()
  if (!recipient) return { success: false, error: 'Admin access required' }

  const { data, tracking, error } = await loadEmailData(orderNumber)
  if (!data) return { success: false, error }

  const confirmation = renderOrderConfirmationEmail(data)
  const alert = renderNewOrderAlertEmail(data)
  const shipped = renderOrderShippedEmail(data, tracking ?? SAMPLE_TRACKING)

  const [confirmationResult, alertResult, shippedResult] = await Promise.all([
    sendEmail({ ...confirmation, subject: `[TEST] ${confirmation.subject}`, to: recipient, replyTo: ORDERS_ADDRESS }),
    sendEmail({ ...alert, subject: `[TEST] ${alert.subject}`, to: recipient }),
    sendEmail({ ...shipped, subject: `[TEST] ${shipped.subject}`, to: recipient, replyTo: ORDERS_ADDRESS }),
  ])

  const failures = [
    confirmationResult.ok ? null : `Customer confirmation: ${confirmationResult.error}`,
    alertResult.ok ? null : `Team alert: ${alertResult.error}`,
    shippedResult.ok ? null : `Shipped: ${shippedResult.error}`,
  ].filter(Boolean)

  if (failures.length > 0) {
    console.error('[EmailTest] Test send failed:', failures)
    return { success: false, error: failures.join(' | ') }
  }
  return { success: true, sentTo: recipient }
}
