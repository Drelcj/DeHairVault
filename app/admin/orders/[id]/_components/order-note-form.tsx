'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// Appends a timestamped note to the order's admin notes log without changing its status
export function OrderNoteForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!note.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_note: note }),
      })
      const result = await res.json().catch(() => null)
      if (!res.ok) throw new Error(result?.error || `Failed to save note (${res.status})`)
      toast.success('Note added')
      setNote('')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <Textarea
        placeholder="Add an internal note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-sm border-border"
      />
      <Button onClick={handleSave} disabled={isSaving || !note.trim()} variant="outline" className="border-border">
        {isSaving ? 'Saving...' : 'Add Note'}
      </Button>
    </div>
  )
}
