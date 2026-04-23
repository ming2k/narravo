import React from 'react';
import styled, { css } from 'styled-components';
import { Icon, IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 6px 12px;
    font-size: 13px;
    gap: 4px;
  `,
  md: css`
    padding: 8px 16px;
    font-size: 14px;
    gap: 6px;
  `,
  lg: css`
    padding: 10px 20px;
    font-size: 15px;
    gap: 8px;
  `,
};

const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background-color: var(--bg-primary);
    color: var(--text-inverse);
    &:hover:not(:disabled) { background-color: var(--bg-primary-hover); }
  `,
  secondary: css`
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    &:hover:not(:disabled) { background-color: var(--bg-surface-hover); }
  `,
  danger: css`
    background-color: var(--system-red);
    color: #FFFFFF;
    &:hover:not(:disabled) { background-color: var(--system-red-hover); }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--text-secondary);
    &:hover:not(:disabled) {
      background-color: var(--bg-surface-hover);
      color: var(--text-primary);
    }
  `,
  link: css`
    background-color: transparent;
    color: var(--system-blue);
    padding: 4px 8px;
    &:hover:not(:disabled) { text-decoration: underline; }
  `,
};

const StyledButton = styled.button.attrs<any>((props) => ({
  className: `ui-button ui-button--${props.$variant} ui-button--${props.$size}${props.$fullWidth ? ' ui-button--full-width' : ''}${props.disabled ? ' ui-button--disabled' : ''}`
}))<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  appearance: none;
  -webkit-appearance: none;
  font-family: inherit;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast), opacity var(--transition-fast), box-shadow var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};

  ${props => sizeStyles[props.$size]}
  ${props => variantStyles[props.$variant]}

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SpinWrapper = styled.span.attrs({ className: 'ui-button__spinner' })`
  display: inline-flex;
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <SpinWrapper>
          <Icon name="spinner" size={size === 'sm' ? 14 : 16} />
        </SpinWrapper>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <Icon name={icon} size={size === 'sm' ? 14 : 16} />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={size === 'sm' ? 14 : 16} />
      )}
    </StyledButton>
  );
};
