"use client"

import { useTransition } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { sendTestOrderEmails } from '@/lib/actions/email'

type SendTestEmailButtonProps = {
  recipient: string
  orderNumber?: string
}

export function SendTestEmailButton({ recipient, orderNumber }: SendTestEmailButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendTestOrderEmails(orderNumber)
      if (result.success) {
        toast.success(`Both test emails sent to ${result.sentTo}`)
      } else {
        toast.error(result.error || 'Failed to send test emails', { duration: 15000 })
      }
    })
  }

  return (
    <Button onClick={handleSend} disabled={isPending}>
      <Send className="h-4 w-4" />
      {isPending ? 'Sending…' : `Send both to ${recipient}`}
    </Button>
  )
}
