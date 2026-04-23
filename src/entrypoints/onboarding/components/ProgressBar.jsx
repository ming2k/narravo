import React from 'react';
import styled from 'styled-components';

const Bar = styled.div.attrs({ className: 'onboarding__progress' })`
  width: 100%;
  height: 4px;
  background: var(--border-color);
  margin-bottom: 32px;
  border-radius: 2px;
  overflow: hidden;
`;

const Progress = styled.div.attrs({ className: 'onboarding__progress-bar' })`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: var(--system-blue);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

export function ProgressBar({ percentage }) {
  return (
    <Bar>
      <Progress $percentage={percentage} />
    </Bar>
  );
}
