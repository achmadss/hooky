import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/ToastContext'
import Toast from '@/components/Toast'
import { useState } from 'react'

function TestComponent() {
    const { showToast } = useToast()
    const [message, setMessage] = useState('')

    return (
        <div>
            <button onClick={() => showToast('Success message', 'success')}>Show Success</button>
            <button onClick={() => showToast('Error message', 'error')}>Show Error</button>
            <button onClick={() => showToast('Warning message', 'warning')}>Show Warning</button>
            <button onClick={() => showToast('Info message', 'info')}>Show Info</button>
            <div data-testid="toast-message">{message}</div>
        </div>
    )
}

describe('Toast Notification System', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    it('renders success toast with correct styling', () => {
        const { getByText, getByTestId } = render(
            <ToastProvider>
                <Toast message="Success!" type="success" onClose={() => {}} />
            </ToastProvider>
        )
        
        expect(getByText('Success!')).toBeInTheDocument()
    })

    it('renders error toast with correct styling', () => {
        const { getByText } = render(
            <ToastProvider>
                <Toast message="Error!" type="error" onClose={() => {}} />
            </ToastProvider>
        )
        
        expect(getByText('Error!')).toBeInTheDocument()
    })

    it('auto-dismisses success toast after 3 seconds', async () => {
        const onClose = vi.fn()
        render(
            <ToastProvider>
                <Toast message="Auto dismiss" type="success" onClose={onClose} />
            </ToastProvider>
        )
        
        expect(onClose).not.toHaveBeenCalled()
        
        act(() => {
            vi.advanceTimersByTime(3300)
        })
        
        expect(onClose).toHaveBeenCalled()
    })

    it('auto-dismisses error toast after 5 seconds', async () => {
        const onClose = vi.fn()
        render(
            <ToastProvider>
                <Toast message="Error auto dismiss" type="error" onClose={onClose} />
            </ToastProvider>
        )
        
        act(() => {
            vi.advanceTimersByTime(5300)
        })
        
        expect(onClose).toHaveBeenCalled()
    })

    it('shows multiple toast types', () => {
        const { getByText, rerender } = render(
            <ToastProvider>
                <Toast message="Success toast" type="success" onClose={() => {}} />
            </ToastProvider>
        )
        expect(getByText('Success toast')).toBeInTheDocument()

        rerender(
            <ToastProvider>
                <Toast message="Error toast" type="error" onClose={() => {}} />
            </ToastProvider>
        )
        expect(getByText('Error toast')).toBeInTheDocument()
    })
})
