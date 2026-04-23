import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Overlay = styled.div.attrs({ className: 'ui-modal__overlay' })`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.15s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Dialog = styled.div.attrs({ className: 'ui-modal__dialog' })`
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  max-width: 560px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const Header = styled.div.attrs({ className: 'ui-modal__header' })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
  position: sticky;
  top: 0;
  background: var(--bg-surface);
  z-index: 1;
`;

const Title = styled.h2.attrs({ className: 'ui-modal__title' })`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
`;

const CloseButton = styled.button.attrs({ className: 'ui-modal__close' })`
  appearance: none;
  -webkit-appearance: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-placeholder);
  transition: color var(--transition-fast), background-color var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-surface-hover);
  }
`;

const Body = styled.div.attrs({ className: 'ui-modal__body' })`
  padding: 20px 24px 24px;
`;

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </CloseButton>
        </Header>
        <Body>{children}</Body>
      </Dialog>
    </Overlay>
  );
};
