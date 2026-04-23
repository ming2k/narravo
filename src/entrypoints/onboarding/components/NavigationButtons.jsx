import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../components/ui';

const ButtonContainer = styled.div.attrs({ className: 'onboarding__actions' })`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  gap: 12px;
`;

export function NavigationButtons({ currentStep, totalSteps, onBack, onNext, isLoading }) {
  const handleNext = async () => {
    if (currentStep === totalSteps) {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          await browser.tabs.remove(tabs[0].id);
        }
      } catch (error) {
        console.error('Failed to close tab:', error);
        window.close();
      }
    } else {
      onNext();
    }
  };

  return (
    <ButtonContainer>
      <Button
        variant="secondary"
        onClick={onBack}
        disabled={currentStep === 1 || isLoading}
        style={{ visibility: currentStep > 1 ? 'visible' : 'hidden' }}
      >
        Back
      </Button>
      <Button
        onClick={handleNext}
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Validating...' : currentStep === totalSteps ? 'Get Started' : 'Next'}
      </Button>
    </ButtonContainer>
  );
}
