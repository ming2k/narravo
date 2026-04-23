import React from 'react';
import styled from 'styled-components';
import { Alert } from '../../../../components/ui';
import { SectionTitle } from '../common';

const Grid = styled.div.attrs({ className: 'options-tab-about' })`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const Column = styled.div``;

const ColumnTitle = styled.h3.attrs({ className: 'options-tab-about__col-title' })`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
`;

const FeatureBlock = styled.div.attrs({ className: 'options-tab-about__block' })`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BlockTitle = styled.h4.attrs({ className: 'options-tab-about__block-title' })`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
`;

const Text = styled.p.attrs({ className: 'options-tab-about__text' })`
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 10px 0;
  font-size: 14px;
`;

const List = styled.ul.attrs({ className: 'options-tab-about__list' })`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ListItem = styled.li.attrs({ className: 'options-tab-about__list-item' })`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--system-blue);
    margin-top: 7px;
    flex-shrink: 0;
  }
`;

const Link = styled.a.attrs({ className: 'options-tab-about__link' })`
  color: var(--system-blue);
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const StepItem = styled.div.attrs({ className: 'options-tab-about__step' })`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepTitle = styled.h4.attrs({ className: 'options-tab-about__step-title' })`
  font-size: 14px;
  font-weight: 600;
  color: var(--system-blue);
  margin: 0 0 8px 0;
`;

const StepContent = styled.div.attrs({ className: 'options-tab-about__step-content' })`
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

const ImageContainer = styled.div.attrs({ className: 'options-tab-about__image-wrap' })`
  margin: 10px 0 0 0;
  padding: 10px;
  background: var(--bg-sunken);
  border-radius: var(--radius-md);
`;

const Image = styled.img.attrs({ className: 'options-tab-about__image' })`
  width: 100%;
  border-radius: var(--radius-sm);
  display: block;
`;

export function About() {
  return (
    <div>
      <SectionTitle>About & Help</SectionTitle>

      <Grid>
        <Column>
          <ColumnTitle>About</ColumnTitle>

          <FeatureBlock>
            <BlockTitle>Open Source</BlockTitle>
            <Text>
              Narravo is free and open-source. Available on <Link href="https://github.com/ming2k/narravo" target="_blank" rel="noopener noreferrer">GitHub</Link>.
            </Text>
            <List>
              <ListItem>Community-driven development</ListItem>
              <ListItem>Transparent codebase</ListItem>
              <ListItem>Contributions welcome</ListItem>
            </List>
          </FeatureBlock>

          <FeatureBlock>
            <BlockTitle>Privacy</BlockTitle>
            <Text>No data collection or tracking. Direct browser-to-Azure communication. Settings stored locally only.</Text>
          </FeatureBlock>

          <FeatureBlock>
            <BlockTitle>Features</BlockTitle>
            <List>
              <ListItem>Convert selected text to speech</ListItem>
              <ListItem>Multiple languages and voices</ListItem>
              <ListItem>Adjustable speed and pitch</ListItem>
              <ListItem>Context menu integration</ListItem>
              <ListItem>Keyboard shortcuts</ListItem>
            </List>
          </FeatureBlock>
        </Column>

        <Column>
          <ColumnTitle>Setup Guide</ColumnTitle>

          <StepItem>
            <StepTitle>1. Get Azure Speech Service</StepTitle>
            <StepContent>
              <p>Go to <a href="https://ai.azure.com" target="_blank" rel="noopener noreferrer">Azure AI Foundry</a>, sign in, and create a <strong>Speech</strong> resource.</p>
            </StepContent>
          </StepItem>

          <StepItem>
            <StepTitle>2. Locate Your Credentials</StepTitle>
            <StepContent>
              <ImageContainer>
                <Image
                  src="/assets/where-are-key-and-region.png"
                  alt="Azure AI Foundry Overview showing API Key and Region"
                />
              </ImageContainer>
              <Alert variant="info" style={{ marginTop: 10 }}>
                <strong>API Key</strong> is under <em>Endpoints and keys</em>. <strong>Region</strong> is the <em>Location</em> value in <em>Resource details</em>.
              </Alert>
            </StepContent>
          </StepItem>

          <StepItem>
            <StepTitle>3. Configure & Use</StepTitle>
            <StepContent>
              <ul>
                <li>Go to Settings and enter your Key and Region</li>
                <li>Click Save to validate</li>
                <li>Select text on any page and use the context menu</li>
              </ul>
            </StepContent>
          </StepItem>
        </Column>
      </Grid>
    </div>
  );
}
