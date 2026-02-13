import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '@/components/Modal'

describe('Modal Component', () => {
    it('renders modal when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={() => {}} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )
        
        expect(screen.getByText('Test Modal')).toBeInTheDocument()
        expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
        render(
            <Modal isOpen={false} onClose={() => {}} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )
        
        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    })

    it('calls onClose when cancel button is clicked', () => {
        const onClose = vi.fn()
        render(
            <Modal isOpen={true} onClose={onClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )
        
        fireEvent.click(screen.getByText('Cancel'))
        expect(onClose).toHaveBeenCalled()
    })

    it('calls onConfirm when confirm button is clicked', () => {
        const onConfirm = vi.fn()
        render(
            <Modal 
                isOpen={true} 
                onClose={() => {}} 
                title="Test Modal" 
                confirmLabel="Confirm"
                onConfirm={onConfirm}
            >
                <p>Modal content</p>
            </Modal>
        )
        
        fireEvent.click(screen.getByText('Confirm'))
        expect(onConfirm).toHaveBeenCalled()
    })

    it('does not call onClose when clicking inside modal content', () => {
        const onClose = vi.fn()
        render(
            <Modal isOpen={true} onClose={onClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )
        
        fireEvent.click(screen.getByText('Modal content'))
        expect(onClose).not.toHaveBeenCalled()
    })

    it('renders with danger variant correctly', () => {
        const onConfirm = vi.fn()
        render(
            <Modal 
                isOpen={true} 
                onClose={() => {}} 
                title="Delete Confirmation"
                confirmLabel="Delete"
                onConfirm={onConfirm}
                confirmVariant="danger"
            >
                <p>Are you sure?</p>
            </Modal>
        )
        
        const deleteButton = screen.getByText('Delete')
        expect(deleteButton).toBeInTheDocument()
    })
})
