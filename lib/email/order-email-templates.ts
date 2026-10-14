// HTML + plain-text bodies for the two order emails.
// Email clients ignore stylesheets, CSS variables and oklch(), so everything here is
// table layout with inline hex styles. The palette and fonts mirror app/globals.css.

import type { OrderEmailData } from './order-email-data'
import { ORDERS_ADDRESS } from './resend'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

// Hex equivalents of the light-theme tokens in app/globals.css
const COLOR = {
  background: '#f9f4ee', // --background
  card: '#fefbf8', // --card
  foreground: '#130807', // --foreground
  primary: '#562e27', // --primary
  primaryForeground: '#fbf7f1', // --primary-foreground
  muted: '#60514f', // --muted-foreground
  border: '#e2d5cb', // --border
  gold: '#e1a035', // --gold
  accent: '#db684c', // --accent
}

// --font-serif / --font-sans, with fallbacks for clients that block web fonts
const SERIF = `'Playfair Display', Georgia, 'Times New Roman', serif`
const SANS = `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const label = `font-family:${SANS};font-size:11px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.muted};`
const body = `font-family:${SANS};font-size:15px;line-height:24px;color:${COLOR.foreground};`

function shell(title: string, preheader: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<!--[if mso]><style>td, p, a, span { font-family: Georgia, 'Times New Roman', serif !important; }</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLOR.background};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLOR.background};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.background};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td align="center" style="padding:0 0 24px 0;font-family:${SERIF};font-size:28px;line-height:36px;color:${COLOR.foreground};">Dehair <span style="font-style:italic;color:${COLOR.accent};">Vault</span></td></tr>
<tr><td style="background-color:${COLOR.card};border:1px solid ${COLOR.border};border-top:3px solid ${COLOR.gold};padding:36px 32px;">
${content}
</td></tr>
<tr><td align="center" style="padding:24px 16px 0 16px;font-family:${SANS};font-size:12px;line-height:20px;color:${COLOR.muted};">Dehair Vault &middot; Luxury Hair Extensions<br><a href="https://www.dehairvault.com" style="color:${COLOR.muted};">dehairvault.com</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function itemsTable(data: OrderEmailData): string {
  const rows = data.items
    .map(
      (item) => `<tr>
<td style="padding:14px 12px 14px 0;border-bottom:1px solid ${COLOR.border};${body}">${esc(item.name)}<br><span style="font-size:13px;line-height:20px;color:${COLOR.muted};">${
        item.details ? `${esc(item.details)} &middot; ` : ''
      }Qty ${item.quantity}</span></td>
<td align="right" valign="top" style="padding:14px 0;border-bottom:1px solid ${COLOR.border};white-space:nowrap;${body}">${esc(item.lineTotal)}</td>
</tr>`
    )
    .join('\n')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${COLOR.border};">
${rows}
<tr>
<td style="padding:16px 12px 0 0;${body}font-weight:600;">Total paid</td>
<td align="right" style="padding:16px 0 0 0;white-space:nowrap;${body}font-size:18px;font-weight:600;">${esc(data.totalPaid)}</td>
</tr>
</table>`
}

function button(href: string, text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${COLOR.primary}" style="background-color:${COLOR.primary};border-radius:6px;"><a href="${esc(href)}" style="display:inline-block;padding:13px 28px;font-family:${SANS};font-size:14px;line-height:20px;font-weight:600;letter-spacing:0.5px;color:${COLOR.primaryForeground};text-decoration:none;">${esc(text)}</a></td></tr></table>`
}

function itemsText(data: OrderEmailData): string {
  return data.items
    .map((item) => `- ${item.name}${item.details ? ` (${item.details})` : ''} x ${item.quantity}: ${item.lineTotal}`)
    .join('\n')
}

export function renderOrderConfirmationEmail(data: OrderEmailData): RenderedEmail {
  const firstName = data.customerName.trim().split(/\s+/)[0] || 'there'
  const subject = `Your Dehair Vault order ${data.orderNumber} is confirmed`

  const html = shell(
    subject,
    `Thank you. We've received your payment of ${data.totalPaid}.`,
    `<h1 style="margin:0 0 12px 0;font-family:${SERIF};font-weight:400;font-size:26px;line-height:34px;color:${COLOR.foreground};">Thank you for your order</h1>
<p style="margin:0 0 28px 0;${body}">Hi ${esc(firstName)}, we&rsquo;ve received your payment and your order is confirmed.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
<tr>
<td width="50%" valign="top" style="padding:0 12px 0 0;${label}">Order number<br><span style="${body}text-transform:none;letter-spacing:0;font-weight:600;">${esc(data.orderNumber)}</span></td>
<td width="50%" valign="top" style="${label}">Date<br><span style="${body}text-transform:none;letter-spacing:0;">${esc(data.orderDate)}</span></td>
</tr>
</table>
${itemsTable(data)}
<p style="margin:32px 0 6px 0;${label}">Shipping to</p>
<p style="margin:0 0 28px 0;${body}">${data.shippingAddress.map(esc).join('<br>')}</p>
<p style="margin:0 0 28px 0;padding:16px 18px;background-color:${COLOR.background};border-left:3px solid ${COLOR.gold};${body}">We&rsquo;ll email your tracking details as soon as your order ships.</p>
${button(data.customerOrderUrl, 'View your order')}
<p style="margin:28px 0 0 0;font-family:${SANS};font-size:13px;line-height:21px;color:${COLOR.muted};">Questions about your order? Just reply to this email or write to <a href="mailto:${ORDERS_ADDRESS}" style="color:${COLOR.primary};">${ORDERS_ADDRESS}</a>.</p>`
  )

  const text = `Thank you for your order

Hi ${firstName}, we've received your payment and your order is confirmed.

Order number: ${data.orderNumber}
Date: ${data.orderDate}

${itemsText(data)}

Total paid: ${data.totalPaid}

Shipping to:
${data.shippingAddress.join('\n')}

We'll email your tracking details as soon as your order ships.

View your order: ${data.customerOrderUrl}

Questions about your order? Just reply to this email or write to ${ORDERS_ADDRESS}.

Dehair Vault - dehairvault.com`

  return { subject, html, text }
}

export function renderNewOrderAlertEmail(data: OrderEmailData): RenderedEmail {
  const subject = `New order: ${data.orderNumber} (${data.totalPaid}, ${data.customerName})`

  const html = shell(
    subject,
    `${data.customerName} paid ${data.totalPaid}.`,
    `<h1 style="margin:0 0 24px 0;font-family:${SERIF};font-weight:400;font-size:26px;line-height:34px;color:${COLOR.foreground};">New paid order</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
<tr>
<td width="50%" valign="top" style="padding:0 0 20px 0;${label}">Order number<br><span style="${body}text-transform:none;letter-spacing:0;font-weight:600;">${esc(data.orderNumber)}</span></td>
<td width="50%" valign="top" style="padding:0 0 20px 0;${label}">Paid<br><span style="${body}text-transform:none;letter-spacing:0;">${esc(data.orderDate)}</span></td>
</tr>
<tr>
<td colspan="2" valign="top" style="${label}">Customer<br><span style="${body}text-transform:none;letter-spacing:0;font-weight:600;">${esc(data.customerName)}</span><br><a href="mailto:${esc(data.customerEmail)}" style="${body}text-transform:none;letter-spacing:0;color:${COLOR.primary};">${esc(data.customerEmail)}</a></td>
</tr>
</table>
${itemsTable(data)}
<div style="height:32px;line-height:32px;font-size:0;">&nbsp;</div>
${button(data.adminOrderUrl, 'Open order in admin')}`
  )

  const text = `New paid order: ${data.orderNumber}

Customer: ${data.customerName} <${data.customerEmail}>
Paid: ${data.orderDate}

${itemsText(data)}

Total paid: ${data.totalPaid}

Open in admin: ${data.adminOrderUrl}`

  return { subject, html, text }
}
