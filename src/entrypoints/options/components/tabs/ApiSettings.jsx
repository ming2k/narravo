import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Icon } from '../../../../components/ui';
import { SectionTitle, SectionDescription, FormGroup, Label } from '../common';
import { SimpleTTS } from '../../../../services/ttsService';

const Form = styled.div.attrs({ className: 'options-tab-api' })`
  max-width: 480px;
`;

const StatusRow = styled.div.attrs({ className: 'options-tab-api__status' })`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 500;
  min-height: 20px;
  color: ${props => props.$error ? 'var(--system-red)' : 'var(--system-green)'};
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const Actions = styled.div.attrs({ className: 'options-tab-api__actions' })`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

export function ApiSettings({ settings, onChange, onSave, isSaving }) {
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState({ text: '', error: false });

  const validateCredentials = async (credentials) => {
    try {
      setIsValidating(true);
      setStatus({ text: 'Validating...', error: false });

      const ttsService = new SimpleTTS(credentials.azureKey, credentials.azureRegion);
      await ttsService.getVoicesList();

      setStatus({ text: 'Credentials validated', error: false });
      return true;
    } catch (error) {
      console.error('Validation failed:', error);
      setStatus({ text: 'Invalid credentials', error: true });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setStatus({ text: '', error: false });

    if (!settings.azureKey || !settings.azureRegion) {
      setStatus({ text: 'Please fill in both fields', error: true });
      return;
    }

    const isValid = await validateCredentials(settings);

    if (isValid) {
      await onSave();
      setStatus({ text: 'Saved successfully', error: false });
      setTimeout(() => setStatus({ text: '', error: false }), 3000);
    }
  };

  return (
    <Form>
      <SectionTitle>API Settings</SectionTitle>
      <SectionDescription>
        Configure your Azure Speech Service credentials.
      </SectionDescription>

      <FormGroup>
        <Label htmlFor="azureKey">Azure Speech Key</Label>
        <Input
          id="azureKey"
          name="azureKey"
          type="password"
          showPasswordToggle
          value={settings.azureKey}
          onChange={onChange}
          placeholder="Enter your Azure Speech Service key"
          autoComplete="off"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="azureRegion">Azure Region</Label>
        <Input
          id="azureRegion"
          name="azureRegion"
          value={settings.azureRegion}
          onChange={onChange}
          placeholder="e.g., eastus, japanwest"
          style={{ maxWidth: 240 }}
        />
      </FormGroup>

      <StatusRow $error={status.error} $visible={!!status.text}>
        {status.text && <Icon name={status.error ? 'error' : 'check'} size={14} />}
        {status.text}
      </StatusRow>

      <Actions>
        <Button
          onClick={handleSave}
          loading={isSaving || isValidating}
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Actions>
    </Form>
  );
}
