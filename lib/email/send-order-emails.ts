// Sends the customer confirmation + team alert when an order becomes paid,
// and the customer "has shipped" email when an admin marks it Shipped.

import { createServiceClient } from '@/lib/supabase/server'
import { buildOrderEmailData, type OrderWithItems } from './order-email-data'
import { renderNewOrderAlertEmail, renderOrderConfirmationEmail, renderOrderShippedEmail } from './order-email-templates'
import { ORDERS_ADDRESS, getTeamAlertRecipients, sendEmail, type SendResult } from './resend'

/**
 * Send both "order paid" emails, exactly once per order.
 *
 * The webhook and the success-page verify route can both confirm the same order, so the
 * caller that wins an atomic claim on orders.paid_at (NULL -> now) is the only one that sends.
 * The Resend idempotency keys are a second guard against a duplicate within 24h.
 *
 * Never throws: a failed email is logged and must not block or undo order confirmation.
 * The claim is not released on failure, so a failed send is not retried (no duplicates).
 */
export async function sendOrderPaidEmails(orderId: string): Promise<void> {
  try {
    const supabase = createServiceClient()

    const { data: claimed, error: claimError } = await supabase
      .from('orders')
      .update({ paid_at: new Date().toISOString() })
      .eq('id', orderId)
      .is('paid_at', null)
      .select('id')

    if (claimError) {
      console.error(`[OrderEmail] Could not claim order ${orderId}; emails not sent:`, claimError)
      return
    }
    if (!claimed || claimed.length === 0) {
      // Another confirmation path already claimed this order and is sending
      return
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items:order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error(`[OrderEmail] Could not load order ${orderId}; emails not sent:`, orderError)
      return
    }

    const data = buildOrderEmailData(order as OrderWithItems)

    const [confirmation, alert] = await Promise.all([
      sendEmail(
        { ...renderOrderConfirmationEmail(data), to: data.customerEmail, replyTo: ORDERS_ADDRESS },
        `order-confirmation/${orderId}`
      ),
      sendEmail({ ...renderNewOrderAlertEmail(data), to: getTeamAlertRecipients() }, `order-alert/${orderId}`),
    ])

    if (confirmation.ok) {
      console.log(`[OrderEmail] Confirmation for ${data.orderNumber} sent (${confirmation.id})`)
    } else {
      console.error(`[OrderEmail] Confirmation for ${data.orderNumber} FAILED: ${confirmation.error}`)
    }
    if (alert.ok) {
      console.log(`[OrderEmail] Team alert for ${data.orderNumber} sent (${alert.id})`)
    } else {
      console.error(`[OrderEmail] Team alert for ${data.orderNumber} FAILED: ${alert.error}`)
    }
  } catch (error) {
    console.error(`[OrderEmail] Unexpected error sending emails for order ${orderId}:`, error)
  }
}

/**
 * Send the "your order has shipped" email to the customer.
 *
 * Only call this from the request that won the atomic status move to SHIPPED: the status
 * route updates with .eq('status', <previous>), so a double save can't move it twice and
 * there is no way back into SHIPPED. The Resend idempotency key is a second guard.
 *
 * Never throws: a failed email must not undo the status change. Returns what happened so
 * the admin can be told.
 */
export async function sendOrderShippedEmail(orderId: string): Promise<SendResult> {
  try {
    const { data: order, error } = await createServiceClient()
      .from('orders')
      .select('*, order_items:order_items(*)')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      console.error(`[OrderEmail] Could not load order ${orderId}; shipped email not sent:`, error)
      return { ok: false, error: 'Could not load the order' }
    }

    const data = buildOrderEmailData(order as OrderWithItems)
    const result = await sendEmail(
      {
        ...renderOrderShippedEmail(data, { number: order.tracking_number, url: order.tracking_url }),
        to: data.customerEmail,
        replyTo: ORDERS_ADDRESS,
      },
      `order-shipped/${orderId}`
    )

    if (result.ok) {
      console.log(`[OrderEmail] Shipped email for ${data.orderNumber} sent (${result.id})`)
    } else {
      console.error(`[OrderEmail] Shipped email for ${data.orderNumber} FAILED: ${result.error}`)
    }
    return result
  } catch (error) {
    console.error(`[OrderEmail] Unexpected error sending shipped email for order ${orderId}:`, error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
