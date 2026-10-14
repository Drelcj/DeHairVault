// Resend client + the one send helper every transactional email goes through.
// sendEmail never throws: a failed email must never break the flow that triggered it.

import { Resend } from 'resend'

export const ORDERS_ADDRESS = 'orders@dehairvault.com'
export const ORDERS_FROM = `Dehair Vault <${ORDERS_ADDRESS}>`
export const TEAM_ALERT_RECIPIENTS = [ORDERS_ADDRESS, 'onyinyechi@dehairvault.com']

// Payment webhooks await the send, so cap how long a slow Resend call can hold them up.
const SEND_TIMEOUT_MS = 8000

export interface EmailMessage {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string }

export async function sendEmail(message: EmailMessage, idempotencyKey?: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not set' }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const resend = new Resend(apiKey)
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Resend did not respond within ${SEND_TIMEOUT_MS}ms`)), SEND_TIMEOUT_MS)
    })

    const { data, error } = await Promise.race([
      resend.emails.send(
        {
          from: ORDERS_FROM,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          replyTo: message.replyTo,
        },
        idempotencyKey ? { idempotencyKey } : undefined
      ),
      timeout,
    ])

    if (error || !data) {
      return { ok: false, error: error ? `${error.name}: ${error.message}` : 'Resend returned no data' }
    }
    return { ok: true, id: data.id }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  } finally {
    clearTimeout(timer)
  }
}
