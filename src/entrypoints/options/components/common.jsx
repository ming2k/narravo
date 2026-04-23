import styled from 'styled-components';

export const SectionTitle = styled.h2.attrs({ className: 'options-section__title' })`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
`;

export const SectionDescription = styled.p.attrs({ className: 'options-section__desc' })`
  color: var(--text-secondary);
  margin: 0 0 28px 0;
  font-size: 14px;
  line-height: 1.6;
`;

export const FormGroup = styled.div.attrs({ className: 'options-form__group' })`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const Label = styled.label.attrs({ className: 'options-form__label' })`
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-primary);
`;

export const ButtonRow = styled.div.attrs({ className: 'options-form__actions' })`
  display: flex;
  gap: 10px;
  margin-top: 28px;
  align-items: center;
`;

export const SectionDivider = styled.div.attrs({ className: 'options-divider' })`
  height: 1px;
  background: var(--border-color);
  margin: 32px 0;
`;
