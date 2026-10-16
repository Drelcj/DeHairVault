'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface MarkDeliveredDialogProps {
  orderId: string
  orderNumber: string
  currentStatus: string
  trackingNumber: string | null
  trackingUrl: string | null
}

// One-click Delivered for paid orders fulfilled outside the system. Skips the in-between
// statuses, so it asks first. Sends no customer email and does not touch stock.
export function MarkDeliveredDialog({ orderId, orderNumber, currentStatus, trackingNumber, trackingUrl }: MarkDeliveredDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [number, setNumber] = useState(trackingNumber ?? '')
  const [url, setUrl] = useState(trackingUrl ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleConfirm = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_delivered: true, tracking_number: number, tracking_url: url }),
      })
      const result = await res.json().catch(() => null)
      if (!res.ok) throw new Error(result?.error || `Failed to mark as delivered (${res.status})`)
      toast.success(`Order ${orderNumber} marked as delivered`)
      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to mark as delivered')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border">
          <PackageCheck className="h-4 w-4" />
          Mark as delivered
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark {orderNumber} as delivered?</DialogTitle>
          <DialogDescription>
            This moves the order from {currentStatus} straight to DELIVERED, skipping the steps in between. Use it for
            orders you have already fulfilled outside the system. The customer is not emailed and stock is not changed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="delivered-tracking-number" className="text-xs font-medium">Tracking number (optional)</Label>
            <Input
              id="delivered-tracking-number"
              placeholder="e.g., DHL123456789"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="h-9 text-sm border-border"
            />
          </div>
          <div>
            <Label htmlFor="delivered-tracking-url" className="text-xs font-medium">Tracking link (optional)</Label>
            <Input
              id="delivered-tracking-url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9 text-sm border-border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="border-border" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isSaving ? 'Saving...' : 'Yes, mark as delivered'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
