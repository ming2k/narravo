import React from 'react';
import styled from 'styled-components';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const StyledSelect = styled.select.attrs({ className: 'ui-select' })<{ $error?: boolean }>`
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 32px 8px 12px;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid ${props => props.$error ? 'var(--system-red)' : 'var(--border-color)'};
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;

  &:focus {
    border-color: ${props => props.$error ? 'var(--system-red)' : 'var(--border-focus)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--bg-sunken);
  }
`;

export const Select: React.FC<SelectProps> = ({ error, children, ...props }) => {
  return (
    <StyledSelect $error={error} {...props}>
      {children}
    </StyledSelect>
  );
};
