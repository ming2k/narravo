import React from 'react';
import styled, { css } from 'styled-components';
import { Icon, IconName } from './Icon';

type AlertVariant = 'info' | 'success' | 'error' | 'warning';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: React.ReactNode;
  title?: string;
}

const variantConfig: Record<AlertVariant, { icon: IconName; bg: string; border: string; color: string }> = {
  info: {
    icon: 'lightbulb',
    bg: 'var(--system-blue-light)',
    border: 'var(--system-blue)',
    color: 'var(--system-blue)',
  },
  success: {
    icon: 'check',
    bg: 'var(--system-green-light)',
    border: 'var(--system-green)',
    color: 'var(--system-green)',
  },
  error: {
    icon: 'error',
    bg: 'var(--system-red-light)',
    border: 'var(--system-red)',
    color: 'var(--system-red)',
  },
  warning: {
    icon: 'lightbulb',
    bg: 'var(--system-amber-light)',
    border: 'var(--system-amber)',
    color: 'var(--system-amber)',
  },
};

const StyledAlert = styled.div.attrs<any>((props) => ({
  className: `ui-alert ui-alert--${props.$variant}`
}))<{ $variant: AlertVariant }>`
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid ${props => variantConfig[props.$variant].border}20;
  background: ${props => variantConfig[props.$variant].bg};
  color: ${props => variantConfig[props.$variant].color};
`;

const IconWrapper = styled.div.attrs({ className: 'ui-alert__icon' })`
  flex-shrink: 0;
  margin-top: 1px;
`;

const Content = styled.div.attrs({ className: 'ui-alert__content' })`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div.attrs({ className: 'ui-alert__title' })`
  font-weight: 600;
  margin-bottom: 2px;
`;

export const Alert: React.FC<AlertProps> = ({ variant = 'info', children, title, ...props }) => {
  const config = variantConfig[variant];
  return (
    <StyledAlert $variant={variant} {...props}>
      <IconWrapper>
        <Icon name={config.icon} size={16} />
      </IconWrapper>
      <Content>
        {title && <Title>{title}</Title>}
        {children}
      </Content>
    </StyledAlert>
  );
};
