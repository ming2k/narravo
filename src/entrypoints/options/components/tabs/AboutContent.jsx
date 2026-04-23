import React from 'react';
import styled from 'styled-components';

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

export function AboutContent() {
  return (
    <div>
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
    </div>
  );
}
