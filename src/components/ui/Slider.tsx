import React from 'react';
import styled from 'styled-components';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  valueDisplay?: string;
}

const SliderContainer = styled.div.attrs({ className: 'ui-slider' })`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const LabelRow = styled.div.attrs({ className: 'ui-slider__header' })`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.label.attrs({ className: 'ui-slider__label' })`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const ValueDisplay = styled.span.attrs({ className: 'ui-slider__value' })`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  min-width: 48px;
  text-align: right;
`;

const SliderRow = styled.div.attrs({ className: 'ui-slider__track' })`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledSlider = styled.input.attrs({ className: 'ui-slider__input' })`
  -webkit-appearance: none;
  flex: 1;
  width: 100%;
  height: 4px;
  background: var(--border-strong);
  border-radius: 2px;
  outline: none;
  border: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--bg-surface);
    border: 2px solid var(--system-blue);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: var(--shadow-md);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--bg-surface);
    border: 2px solid var(--system-blue);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Slider: React.FC<SliderProps> = ({ label, valueDisplay, ...props }) => {
  return (
    <SliderContainer>
      {(label || valueDisplay) && (
        <LabelRow>
          {label && <Label>{label}</Label>}
          {valueDisplay && <ValueDisplay>{valueDisplay}</ValueDisplay>}
        </LabelRow>
      )}
      <SliderRow>
        <StyledSlider type="range" {...props} />
      </SliderRow>
    </SliderContainer>
  );
};
