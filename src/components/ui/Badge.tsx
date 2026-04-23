import React from 'react';
import styled, { css } from 'styled-components';

type BadgeVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
  default: css`
    background: var(--bg-secondary);
    color: var(--text-secondary);
  `,
  primary: css`
    background: var(--system-blue-light);
    color: var(--system-blue);
  `,
  success: css`
    background: var(--system-green-light);
    color: var(--system-green);
  `,
  danger: css`
    background: var(--system-red-light);
    color: var(--system-red);
  `,
  warning: css`
    background: var(--system-amber-light);
    color: var(--system-amber);
  `,
};

const StyledBadge = styled.span.attrs<any>((props) => ({
  className: `ui-badge ui-badge--${props.$variant}`
}))<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  ${props => variantStyles[props.$variant]}
`;

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, ...props }) => {
  return (
    <StyledBadge $variant={variant} {...props}>
      {children}
    </StyledBadge>
  );
};
