import React from 'react';
import styled from 'styled-components';
import { Card, Icon } from '../../../../components/ui';
import { Title, Description } from '../StyledComponents';

const SuccessIcon = styled.div.attrs({ className: 'onboarding-complete__icon' })`
  width: 72px;
  height: 72px;
  background: var(--system-green);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  box-shadow: 0 0 0 8px var(--system-green-light);
  animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @keyframes scaleIn {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const NextSteps = styled(Card).attrs({ className: 'onboarding-complete__next-steps' })`
  text-align: left;
  margin-top: 28px;
`;

const StepHeader = styled.h3.attrs({ className: 'onboarding-complete__step-header' })`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
`;

const List = styled.ul.attrs({ className: 'onboarding-complete__list' })`
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 8px;
  line-height: 1.6;
`;

export const CompletionStep = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <SuccessIcon>
        <Icon name="check" size={32} />
      </SuccessIcon>
      <Title>You&apos;re All Set!</Title>
      <Description>
        Narravo is now configured and ready to bring your text to life.
      </Description>

      <NextSteps elevation="low" padding="md">
        <StepHeader>Quick Start Guide</StepHeader>
        <List>
          <li>Click the extension icon in the toolbar to open the quick-read window.</li>
          <li>Select any text on a webpage and use the right-click menu to read it.</li>
          <li>Use <b>Alt + Shift + L</b> to read selected text instantly.</li>
          <li>Access full settings anytime to change voices, speed, or pitch.</li>
        </List>
      </NextSteps>
    </div>
  );
};
