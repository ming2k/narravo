import React, { useState } from 'react';
import styled from 'styled-components';
import { Alert, Icon, Modal } from '../../../../components/ui';
import { Title, Description, InputGroup, ErrorMessage } from '../StyledComponents';
import { HelpContent } from '../../../options/components/tabs/HelpContent';

const HelpLink = styled.button.attrs({ className: 'onboarding-config__link' })`
  color: var(--system-blue);
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;

  &:hover {
    text-decoration: underline;
  }
`;

export const ConfigurationStep = ({ azureKey, azureRegion, onChange, error }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Title>Azure Configuration</Title>
      <Description>
        Narravo requires an Azure Speech Service key and region to function.
        Don&apos;t have one?{' '}
        <HelpLink onClick={() => setShowHelp(true)}>
          Get started for free <Icon name="arrowRight" size={14} />
        </HelpLink>
      </Description>

      <Modal open={showHelp} onClose={() => setShowHelp(false)} title="How to Get Azure Credentials">
        <HelpContent />
      </Modal>

      <InputGroup>
        <label htmlFor="onboarding-azure-key">Azure Subscription Key</label>
        <input
          id="onboarding-azure-key"
          type="password"
          placeholder="Enter your key"
          value={azureKey}
          onChange={(e) => onChange('azureKey', e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <label htmlFor="onboarding-azure-region">Azure Region</label>
        <input
          id="onboarding-azure-region"
          type="text"
          placeholder="e.g., eastus, westus2"
          value={azureRegion}
          onChange={(e) => onChange('azureRegion', e.target.value)}
        />
      </InputGroup>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Alert variant="info" style={{ marginTop: 16 }}>
        Your data is processed locally. We never store or transmit your API keys
        to any server except directly to Microsoft Azure APIs.
      </Alert>
    </>
  );
};
