import styled from 'styled-components';

export const Title = styled.h1.attrs({ className: 'onboarding__title' })`
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
`;

export const Description = styled.p.attrs({ className: 'onboarding__desc' })`
  text-align: center;
  margin: 0 0 28px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
`;

export const ErrorMessage = styled.div.attrs({ className: 'onboarding__error' })`
  color: var(--system-red);
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
  padding: 10px 14px;
  background: var(--system-red-light);
  border-radius: var(--radius-md);
`;

export const StepContainer = styled.div.attrs({ className: 'onboarding__step' })`
  animation: fadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const InputGroup = styled.div.attrs({ className: 'onboarding__input-group' })`
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--text-primary);
  }

  input {
    width: 100%;
  }
`;
