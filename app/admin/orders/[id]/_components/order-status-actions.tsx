'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VALID_TRANSITIONS } from '@/lib/admin/order-transitions'

interface OrderStatusActionsProps {
  orderId: string
  currentStatus: string
}

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
]

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const allowedStatuses = VALID_TRANSITIONS[currentStatus] || []

  const handleUpdate = async () => {
    if (!newStatus || newStatus === currentStatus) {
      toast.error('Choose a new status first')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_number: trackingNumber, tracking_url: trackingUrl, admin_note: adminNote }),
      })
      const result = await res.json().catch(() => null)
      if (!res.ok) throw new Error(result?.error || `Failed to update status (${res.status})`)
      toast.success(`Order moved to ${newStatus}`)
      setIsOpen(false)
      setAdminNote('')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="px-4 md:px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium">Status</h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium mb-4">{currentStatus}</div>
          {allowedStatuses.length > 0 && (
            <>
              {!isOpen ? (
                <Button onClick={() => setIsOpen(true)} variant="outline" className="border-border">Update Status</Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium mb-1.5">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-full border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={currentStatus}>{currentStatus}</SelectItem>
                        {allowedStatuses.map(s => (
                          <SelectItem key={s} value={s}>{ORDER_STATUSES.find(st => st.value === s)?.label || s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newStatus === 'SHIPPED' && (
                    <>
                      <div>
                        <Label className="text-xs font-medium">Tracking Number</Label>
                        <Input
                          placeholder="e.g., DHL123456789"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="h-9 text-sm border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Tracking URL</Label>
                        <Input
                          placeholder="https://..."
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          className="h-9 text-sm border-border"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="text-xs font-medium">Admin Note (optional, added to the notes log)</Label>
                    <Textarea
                      placeholder="Internal note..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="text-sm border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={() => setIsOpen(false)} variant="outline" className="border-border">Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
