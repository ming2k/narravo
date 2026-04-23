import React from 'react';
import styled from 'styled-components';
import { Alert } from '../../../../components/ui';

const StepItem = styled.div.attrs({ className: 'options-tab-help__step' })`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepTitle = styled.h4.attrs({ className: 'options-tab-help__step-title' })`
  font-size: 14px;
  font-weight: 600;
  color: var(--system-blue);
  margin: 0 0 8px 0;
`;

const StepContent = styled.div.attrs({ className: 'options-tab-help__step-content' })`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;

  ul {
    margin: 6px 0;
    padding-left: 18px;
  }

  li {
    margin: 3px 0;
  }

  a {
    color: var(--system-blue);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ImageContainer = styled.div.attrs({ className: 'options-tab-help__image-wrap' })`
  margin: 10px 0 0 0;
  padding: 10px;
  background: var(--bg-sunken);
  border-radius: var(--radius-md);
`;

const Image = styled.img.attrs({ className: 'options-tab-help__image' })`
  width: 100%;
  border-radius: var(--radius-sm);
  display: block;
`;

export function HelpContent() {
  return (
    <div>
      <StepItem>
        <StepTitle>1. Create a Speech Resource on Azure AI Foundry</StepTitle>
        <StepContent>
          <p>
            Go to <a href="https://ai.azure.com" target="_blank" rel="noopener noreferrer">Azure AI Foundry</a>, sign in with your Microsoft account, and create a <strong>Speech</strong> resource (or use an existing one). If you don&apos;t have an Azure subscription yet, you can start with the <a href="https://azure.microsoft.com/en-us/free/" target="_blank" rel="noopener noreferrer">free tier</a>.
          </p>
        </StepContent>
      </StepItem>

      <StepItem>
        <StepTitle>2. Locate Your Credentials</StepTitle>
        <StepContent>
          <p>Open your Speech resource and go to the <strong>Overview</strong> page. You&apos;ll find everything you need on this screen:</p>
          <ImageContainer>
            <Image
              src="/assets/where-are-key-and-region.png"
              alt="Azure AI Foundry Overview showing API Key and Region location"
            />
          </ImageContainer>
          <Alert variant="info" style={{ marginTop: 10 }}>
            <strong>API Key</strong> is under <em>Endpoints and keys</em>. <strong>Region</strong> is the <em>Location</em> value in <em>Resource details</em> (e.g. <code>eastus2</code>).
          </Alert>
        </StepContent>
      </StepItem>

      <StepItem>
        <StepTitle>3. Configure & Use</StepTitle>
        <StepContent>
          <ul>
            <li>Paste your <strong>API Key</strong> and <strong>Region</strong> into Narravo</li>
            <li>Click Save — Narravo will validate the credentials automatically</li>
            <li>Select text on any webpage and right-click <em>Read selected text</em>, or use the keyboard shortcut</li>
          </ul>
        </StepContent>
      </StepItem>
    </div>
  );
}
