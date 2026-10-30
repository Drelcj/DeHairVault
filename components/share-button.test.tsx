import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { ShareButton } from './share-button'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const EXPECTED_URL = 'https://www.dehairvault.com/shop/test-wig'

function setNavigator(props: Record<string, unknown>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true })
  }
}

describe('ShareButton', () => {
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined)
    setNavigator({ clipboard: { writeText }, share: undefined, canShare: undefined })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const clickShare = () => {
    render(<ShareButton path="/shop/test-wig" title="Test Wig" />)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
  }

  it('uses the native share sheet with the canonical www URL', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    setNavigator({ share })

    clickShare()

    await waitFor(() => expect(share).toHaveBeenCalledWith({ title: 'Test Wig', url: EXPECTED_URL }))
    expect(writeText).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('ignores the user cancelling the share sheet', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    setNavigator({ share })

    clickShare()

    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(writeText).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('copies the link when native share is unavailable', async () => {
    clickShare()

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(EXPECTED_URL))
    expect(toast.success).toHaveBeenCalledWith('Link copied')
  })

  it('falls back to copying when native share fails for another reason', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('blocked', 'NotAllowedError'))
    setNavigator({ share })

    clickShare()

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(EXPECTED_URL))
    expect(toast.success).toHaveBeenCalledWith('Link copied')
  })

  it('shows an error toast when copying fails', async () => {
    writeText.mockRejectedValue(new Error('denied'))

    clickShare()

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Could not copy the link'))
  })
})
