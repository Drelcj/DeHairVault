'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const allowedStatuses = VALID_TRANSITIONS[currentStatus] || []

  const handleUpdate = async () => {
    if (!newStatus || newStatus === currentStatus) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_number: trackingNumber, tracking_url: trackingUrl, admin_notes: adminNotes }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
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
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    >
                      <option value={currentStatus}>{currentStatus}</option>
                      {allowedStatuses.map(s => (
                        <option key={s} value={s}>{ORDER_STATUSES.find(st => st.value === s)?.label || s}</option>
                      ))}
                    </select>
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
                    <Label className="text-xs font-medium">Admin Notes</Label>
                    <Textarea
                      placeholder="Internal notes..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="text-sm border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
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
