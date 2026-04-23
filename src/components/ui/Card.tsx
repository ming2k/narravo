import React from 'react';
import styled, { css } from 'styled-components';

type CardElevation = 'none' | 'low' | 'medium' | 'high';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const elevationStyles: Record<CardElevation, ReturnType<typeof css>> = {
  none: css`
    box-shadow: var(--shadow-none);
    border: 1px solid var(--border-color);
  `,
  low: css`
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
  `,
  medium: css`
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  `,
  high: css`
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
  `,
};

const paddingStyles = {
  none: '0',
  sm: '16px',
  md: '20px',
  lg: '28px',
};

const StyledCard = styled.div.attrs<any>((props) => ({
  className: `ui-card ui-card--elevation-${props.$elevation} ui-card--padding-${props.$padding}`
}))<{ $elevation: CardElevation; $padding: string }>`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: ${props => props.$padding};
  transition: box-shadow var(--transition-base);
  ${props => elevationStyles[props.$elevation]}
`;

export const Card: React.FC<CardProps> = ({
  elevation = 'medium',
  padding = 'md',
  children,
  ...props
}) => {
  return (
    <StyledCard
      $elevation={elevation}
      $padding={paddingStyles[padding]}
      {...props}
    >
      {children}
    </StyledCard>
  );
};
