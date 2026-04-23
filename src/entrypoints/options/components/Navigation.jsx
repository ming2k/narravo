import React from 'react';
import styled from 'styled-components';

const Nav = styled.nav.attrs({ className: 'options-nav' })`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    gap: 0;
    padding-bottom: 2px;
  }
`;

const TabButton = styled.button.attrs((props) => ({
  className: `options-nav__tab${props.$active ? ' options-nav__tab--active' : ''}`
}))`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  background: ${props => props.$active ? 'var(--bg-surface)' : 'transparent'};
  border: none;
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  position: relative;
  justify-content: flex-start;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${props => props.$active ? '20px' : '0'};
    background: var(--system-blue);
    border-radius: 0 2px 2px 0;
    transition: height var(--transition-fast);
  }

  &:hover {
    background: ${props => props.$active ? 'var(--bg-surface)' : 'var(--bg-surface-hover)'};
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    white-space: nowrap;
    border-radius: 0;
    border-bottom: 2px solid ${props => props.$active ? 'var(--system-blue)' : 'transparent'};

    &::before {
      display: none;
    }
  }
`;

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'about', label: 'About' },
  { id: 'sponsor', label: 'Sponsor' }
];

export function Navigation({ activeTab, onTabChange }) {
  return (
    <Nav>
      {tabs.map(tab => (
        <TabButton
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
    </Nav>
  );
}
