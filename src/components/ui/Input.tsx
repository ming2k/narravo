import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Icon } from './Icon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  showPasswordToggle?: boolean;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const InputWrapper = styled.div.attrs({ className: 'ui-input__wrapper' })`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  &:hover .ui-input__visibility-toggle,
  &:focus-within .ui-input__visibility-toggle {
    opacity: 1;
    pointer-events: auto;
  }
`;

const Affix = styled.span.attrs({ className: 'ui-input__affix' })`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-placeholder);
  z-index: 1;

  &:first-of-type { left: 10px; }
  &:last-of-type { right: 10px; }
`;

const VisibilityToggle = styled.button.attrs({ className: 'ui-input__visibility-toggle' })`
  all: unset;
  position: absolute;
  right: 6px;
  top: 0;
  bottom: 0;
  margin: auto 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-primary);
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast), color var(--transition-fast), background-color var(--transition-fast);

  &:hover {
    background-color: var(--bg-tertiary);
  }

  &:active {
    transform: scale(1);
  }
`;

const baseInputStyles = css<{ $error?: boolean }>`
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 12px;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid ${props => props.$error ? 'var(--system-red)' : 'var(--border-color)'};
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--transition-fast);

  &::placeholder {
    color: var(--text-placeholder);
  }

  &:focus {
    border-color: ${props => props.$error ? 'var(--system-red)' : 'var(--border-focus)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--bg-sunken);
  }
`;

const StyledInput = styled.input.attrs({ className: 'ui-input' })<{ $error?: boolean; $hasPrefix?: boolean; $hasSuffix?: boolean; $hasToggle?: boolean }>`
  ${baseInputStyles}
  padding-left: ${props => props.$hasPrefix ? '36px' : '12px'};
  padding-right: ${props => {
    if (props.$hasToggle) return '42px';
    if (props.$hasSuffix) return '36px';
    return '12px';
  }};
`;

const StyledTextArea = styled.textarea.attrs({ className: 'ui-textarea' })<{ $error?: boolean }>`
  ${baseInputStyles}
  resize: vertical;
  min-height: 80px;
`;

export const Input: React.FC<InputProps> = ({
  error,
  prefix,
  suffix,
  showPasswordToggle,
  type: initialType,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = initialType === 'password';
  const type = isPassword && showPasswordToggle
    ? (isVisible ? 'text' : 'password')
    : initialType;

  return (
    <InputWrapper className={className}>
      {prefix && <Affix style={{ left: 10 }}>{prefix}</Affix>}
      <StyledInput
        type={type}
        $error={error}
        $hasPrefix={!!prefix}
        $hasSuffix={!!suffix && !showPasswordToggle}
        $hasToggle={isPassword && showPasswordToggle}
        {...props}
      />
      {isPassword && showPasswordToggle && (
        <VisibilityToggle
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setIsVisible(v => !v)}
          tabIndex={-1}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          <Icon name={isVisible ? 'eyeOff' : 'eye'} size={16} />
        </VisibilityToggle>
      )}
      {suffix && !showPasswordToggle && <Affix style={{ right: 10 }}>{suffix}</Affix>}
    </InputWrapper>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({ error, className, ...props }) => {
  return <StyledTextArea $error={error} className={className} {...props} />;
};
