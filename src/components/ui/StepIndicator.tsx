import React from 'react';
import styled from 'styled-components';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const Container = styled.div.attrs({ className: 'ui-step-indicator' })`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
`;

const StepItem = styled.div.attrs<any>((props) => ({
  className: `ui-step-indicator__step${props.$active ? ' ui-step-indicator__step--active' : ''}${props.$completed ? ' ui-step-indicator__step--completed' : ''}`
}))<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StepDot = styled.div.attrs<any>((props) => ({
  className: `ui-step-indicator__dot${props.$active ? ' ui-step-indicator__dot--active' : ''}${props.$completed ? ' ui-step-indicator__dot--completed' : ''}`
}))<{ $active: boolean; $completed: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: all var(--transition-base);
  background: ${props =>
    props.$completed ? 'var(--system-green)' :
    props.$active ? 'var(--system-blue)' : 'var(--bg-secondary)'};
  color: ${props =>
    props.$completed || props.$active ? '#FFFFFF' : 'var(--text-tertiary)'};
  border: 2px solid ${props =>
    props.$completed ? 'var(--system-green)' :
    props.$active ? 'var(--system-blue)' : 'var(--border-color)'};
`;

const StepLabel = styled.span.attrs<any>((props) => ({
  className: `ui-step-indicator__label${props.$active ? ' ui-step-indicator__label--active' : ''}${props.$completed ? ' ui-step-indicator__label--completed' : ''}`
}))<{ $active: boolean; $completed: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${props =>
    props.$active ? 'var(--text-primary)' :
    props.$completed ? 'var(--text-secondary)' : 'var(--text-tertiary)'};
  transition: color var(--transition-base);

  @media (max-width: 480px) {
    display: none;
  }
`;

const Connector = styled.div.attrs<any>((props) => ({
  className: `ui-step-indicator__connector${props.$completed ? ' ui-step-indicator__connector--completed' : ''}`
}))<{ $completed: boolean }>`
  width: 32px;
  height: 2px;
  border-radius: 1px;
  background: ${props => props.$completed ? 'var(--system-green)' : 'var(--border-color)'};
  transition: background var(--transition-base);
`;

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <Container>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={step}>
            <StepItem $active={isActive} $completed={isCompleted}>
              <StepDot $active={isActive} $completed={isCompleted}>
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </StepDot>
              <StepLabel $active={isActive} $completed={isCompleted}>{step}</StepLabel>
            </StepItem>
            {index < steps.length - 1 && (
              <Connector $completed={isCompleted} />
            )}
          </React.Fragment>
        );
      })}
    </Container>
  );
};
