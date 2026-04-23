import React from 'react';
import styled from 'styled-components';
import { Card, Icon } from '../../../../components/ui';
import { Title, Description } from '../StyledComponents';

const FeatureList = styled.div.attrs({ className: 'onboarding-welcome__features' })`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0 8px 0;
`;

const FeatureItem = styled(Card).attrs({ className: 'onboarding-welcome__feature' })`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  transition: transform var(--transition-fast), border-color var(--transition-fast);
  cursor: default;

  &:hover {
    transform: translateX(4px);
    border-color: var(--system-blue);
  }
`;

const IconWrapper = styled.div.attrs({ className: 'onboarding-welcome__icon' })`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--system-blue-light);
  color: var(--system-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextWrapper = styled.div.attrs({ className: 'onboarding-welcome__text' })`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FeatureTitle = styled.div.attrs({ className: 'onboarding-welcome__feature-title' })`
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
`;

const FeatureDesc = styled.div.attrs({ className: 'onboarding-welcome__feature-desc' })`
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

export const WelcomeStep = () => {
  return (
    <>
      <Title>Welcome to Narravo</Title>
      <Description>
        Experience natural, high-quality text-to-speech powered by Azure Neural TTS.
        Let&apos;s get you set up in a few simple steps.
      </Description>

      <FeatureList>
        <FeatureItem elevation="low">
          <IconWrapper>
            <Icon name="mic" size={18} />
          </IconWrapper>
          <TextWrapper>
            <FeatureTitle>Natural Voices</FeatureTitle>
            <FeatureDesc>Access dozens of human-like neural voices across multiple languages.</FeatureDesc>
          </TextWrapper>
        </FeatureItem>

        <FeatureItem elevation="low">
          <IconWrapper>
            <Icon name="zap" size={18} />
          </IconWrapper>
          <TextWrapper>
            <FeatureTitle>Fast & Reliable</FeatureTitle>
            <FeatureDesc>Low-latency streaming audio for a smooth listening experience.</FeatureDesc>
          </TextWrapper>
        </FeatureItem>

        <FeatureItem elevation="low">
          <IconWrapper>
            <Icon name="shield" size={18} />
          </IconWrapper>
          <TextWrapper>
            <FeatureTitle>Privacy Focused</FeatureTitle>
            <FeatureDesc>Your API keys are stored securely in your browser&apos;s local storage.</FeatureDesc>
          </TextWrapper>
        </FeatureItem>
      </FeatureList>
    </>
  );
};
