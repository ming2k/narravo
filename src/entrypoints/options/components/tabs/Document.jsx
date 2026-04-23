import React from 'react';
import styled from 'styled-components';
import { Alert } from '../../../../components/ui';
import { SectionTitle, SectionDivider } from '../common';

const StepItem = styled.div.attrs({ className: 'options-tab-docs__step' })`
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepTitle = styled.h3.attrs({ className: 'options-tab-docs__step-title' })`
  font-size: 15px;
  font-weight: 600;
  color: var(--system-blue);
  margin: 0 0 10px 0;
`;

const StepContent = styled.div.attrs({ className: 'options-tab-docs__step-content' })`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;

  ul {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
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

const ImageContainer = styled.div.attrs({ className: 'options-tab-docs__image-wrap' })`
  margin: 12px 0 0 0;
  padding: 12px;
  background: var(--bg-sunken);
  border-radius: var(--radius-md);
`;

const Image = styled.img.attrs({ className: 'options-tab-docs__image' })`
  width: 100%;
  border-radius: var(--radius-sm);
  display: block;
`;

export function Document() {
  return (
    <div>
      <SectionTitle>Setup Guide</SectionTitle>

      <StepItem>
        <StepTitle>1. Get Azure Speech Service</StepTitle>
        <StepContent>
          <p>To use Narravo, you need an Azure Speech Service key:</p>
          <ul>
            <li>Go to <a href="https://ai.azure.com" target="_blank" rel="noopener noreferrer">Azure AI Foundry</a></li>
            <li>Sign in with your Microsoft account</li>
            <li>Create or open a <strong>Speech</strong> resource</li>
          </ul>
        </StepContent>
      </StepItem>

      <SectionDivider />

      <StepItem>
        <StepTitle>2. Locate Your Credentials</StepTitle>
        <StepContent>
          <p>Find your credentials on the resource Overview page:</p>
          <ImageContainer>
            <Image
              src="/assets/where-are-key-and-region.png"
              alt="Azure AI Foundry Overview showing API Key and Region"
            />
          </ImageContainer>
          <Alert variant="info" style={{ marginTop: 12 }}>
            <strong>API Key</strong> is under <em>Endpoints and keys</em>. <strong>Region</strong> is the <em>Location</em> value in <em>Resource details</em> (e.g. <code>eastus2</code>).
          </Alert>
        </StepContent>
      </StepItem>

      <SectionDivider />

      <StepItem>
        <StepTitle>3. Configure Extension</StepTitle>
        <StepContent>
          <ul>
            <li>Go to the API tab</li>
            <li>Enter your Azure Speech Key</li>
            <li>Enter your Azure Region</li>
            <li>Click Save</li>
          </ul>
        </StepContent>
      </StepItem>

      <SectionDivider />

      <StepItem>
        <StepTitle>4. Using the Extension</StepTitle>
        <StepContent>
          <ul>
            <li>Select text on any webpage</li>
            <li>Click the extension icon or right-click menu</li>
            <li>Adjust voice settings in the Audio tab</li>
          </ul>
        </StepContent>
      </StepItem>
    </div>
  );
}
