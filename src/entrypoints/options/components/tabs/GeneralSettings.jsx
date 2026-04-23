import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Button, Input, Select, Slider, Badge, Alert, Icon } from '../../../../components/ui';
import { FormGroup, Label } from '../common';
import { SimpleTTS } from '../../../../services/ttsService';
import { AudioService } from '../../../../services/audioService';


const Grid = styled.div.attrs({ className: 'options-tab-general' })`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
  margin-bottom: 32px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 24px;
  }
`;

const Column = styled.div``;

const ColumnTitle = styled.h3.attrs({ className: 'options-tab-general__col-title' })`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--text-primary);
`;

const ValidateRow = styled.div.attrs({ className: 'options-tab-general__validate-row' })`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const StatusRow = styled.div.attrs({ className: 'options-tab-general__status' })`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  min-height: 20px;
  color: ${props => props.$error ? 'var(--system-red)' : 'var(--system-green)'};
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const BottomSection = styled.div.attrs({ className: 'options-tab-general__bottom' })`
  margin-bottom: 32px;
`;

const SectionHeader = styled.h3.attrs({ className: 'options-tab-general__section-header' })`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
`;

const Toolbar = styled.div.attrs({ className: 'options-tab-general__toolbar' })`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input.attrs({ className: 'options-tab-general__search' })`
  && {
    appearance: none;
    -webkit-appearance: none;
    box-sizing: border-box;
    flex: 1;
    min-width: 120px;
    padding: 7px 32px 7px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 13px;
    line-height: 21px;
    font-family: inherit;
    outline: none;
    transition: border-color var(--transition-fast);
  }

  &&:focus {
    border-color: var(--border-focus);
  }

  &&::placeholder {
    color: var(--text-placeholder);
  }


`;

const FilterSelect = styled(Select).attrs({ className: 'options-tab-general__filter' })`
  width: auto;
  min-width: 90px;
  font-size: 13px;
  line-height: 21px;
  padding: 7px 28px 7px 10px;
  background-position: right 8px center;
`;

const SliderStack = styled.div.attrs({ className: 'options-tab-general__slider-stack' })`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Actions = styled.div.attrs({ className: 'options-tab-general__actions' })`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
`;

const SearchWrapper = styled.div.attrs({ className: 'options-tab-general__search-wrapper' })`
  position: relative;
  flex: 1;
  min-width: 120px;
`;

const ClearButton = styled.button.attrs({ className: 'options-tab-general__search-clear' })`
  all: unset;
  position: absolute;
  right: 8px;
  top: 0;
  bottom: 0;
  margin: auto 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  z-index: 2;
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  transition: opacity var(--transition-fast), color var(--transition-fast);

  &:hover { color: var(--text-primary); }
`;

const FilterGroup = styled.div.attrs({ className: 'options-tab-general__filter-group' })`
  display: flex;
  gap: 4px;
`;

const FilterPill = styled.button.attrs({ className: 'options-tab-general__filter-pill' })`
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: ${props => props.$active ? 'var(--bg-primary)' : 'transparent'};
  color: ${props => props.$active ? 'var(--text-inverse)' : 'var(--text-primary)'};
  font-size: 13px;
  line-height: 1.5;
  font-family: inherit;
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--text-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CurrentVoiceCard = styled.div.attrs({ className: 'options-tab-general__current-voice' })`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 16px;

  .voice-name {
    font-weight: 600;
  }

  .voice-meta {
    color: var(--text-secondary);
    font-size: 13px;
  }
`;

const ConfirmRow = styled.div.attrs({ className: 'options-tab-general__confirm-row' })`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
`;

export function GeneralSettings({ settings, onChange, onSave, groupedVoices, voicesError, isSaving }) {
  const [isValidating, setIsValidating] = useState(false);
  const [validateStatus, setValidateStatus] = useState({ text: '', error: false });
  const [saveStatus, setSaveStatus] = useState({ text: '', error: false });
  const [testStatus, setTestStatus] = useState({ text: '', error: false });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioService] = useState(() => new AudioService());
  const [pendingVoice, setPendingVoice] = useState(settings.voice);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterMultilingual, setFilterMultilingual] = useState('all');
  const [filterLocale, setFilterLocale] = useState('all');

  // Validation state: Voice Selection is only available after credentials are validated
  const [isValidated, setIsValidated] = useState(false);
  const [localVoices, setLocalVoices] = useState({});

  useEffect(() => {
    return () => {
      audioService.stopAudio().catch(() => {});
    };
  }, [audioService]);

  // Mark as validated when voices are loaded from storage on initial load
  useEffect(() => {
    if (Object.keys(groupedVoices).length > 0) {
      setIsValidated(true);
      setLocalVoices(groupedVoices);
    }
  }, [groupedVoices]);

  // Reset validation when credentials change
  useEffect(() => {
    setIsValidated(false);
  }, [settings.azureKey, settings.azureRegion]);

  // Sync pendingVoice when settings.voice changes from outside
  useEffect(() => {
    setPendingVoice(settings.voice);
  }, [settings.voice]);

  const activeVoices = useMemo(() => {
    return Object.keys(localVoices).length > 0 ? localVoices : groupedVoices;
  }, [localVoices, groupedVoices]);

  const allVoices = useMemo(() => {
    if (!activeVoices || Object.keys(activeVoices).length === 0) return [];
    return Object.values(activeVoices)
      .flat()
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [activeVoices]);



  const hasActiveFilters = searchTerm || filterGender !== 'all' || filterMultilingual !== 'all' || filterLocale !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterGender('all');
    setFilterMultilingual('all');
    setFilterLocale('all');
  };

  const filteredVoices = useMemo(() => {
    let voices = allVoices;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      voices = voices.filter(v =>
        v.label.toLowerCase().includes(term) ||
        v.value.toLowerCase().includes(term) ||
        v.locale.toLowerCase().includes(term)
      );
    }

    if (filterGender !== 'all') {
      voices = voices.filter(v => v.gender === filterGender);
    }

    if (filterMultilingual === 'yes') {
      voices = voices.filter(v => v.isMultilingual);
    } else if (filterMultilingual === 'no') {
      voices = voices.filter(v => !v.isMultilingual);
    }

    if (filterLocale !== 'all') {
      voices = voices.filter(v => v.locale === filterLocale);
    }

    return voices;
  }, [allVoices, searchTerm, filterGender, filterMultilingual, filterLocale]);

  const handleValidate = async () => {
    if (!settings.azureKey || !settings.azureRegion) {
      setValidateStatus({ text: 'Please fill in both fields', error: true });
      return;
    }

    try {
      setIsValidating(true);
      setValidateStatus({ text: 'Validating...', error: false });

      const ttsService = new SimpleTTS(settings.azureKey, settings.azureRegion);
      const voices = await ttsService.getVoicesList();

      setLocalVoices(voices);
      setIsValidated(true);
      setValidateStatus({ text: 'Credentials validated', error: false });
    } catch (error) {
      console.error('Validation failed:', error);
      setLocalVoices({});
      setIsValidated(false);
      setValidateStatus({ text: 'Invalid credentials', error: true });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus({ text: '', error: false });

    if (!settings.azureKey || !settings.azureRegion) {
      setSaveStatus({ text: 'Please fill in both fields', error: true });
      return;
    }

    try {
      await onSave();
      setSaveStatus({ text: 'Saved successfully', error: false });
      setTimeout(() => setSaveStatus({ text: '', error: false }), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus({ text: 'Save failed', error: true });
    }
  };

  const handleConfirmVoice = () => {
    if (pendingVoice && pendingVoice !== settings.voice) {
      onChange({ target: { name: 'voice', value: pendingVoice } });
    }
  };

  const handleTestVoice = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setTestStatus({ text: '', error: false });

    if (!settings.azureKey || !settings.azureRegion) {
      setTestStatus({ text: 'Please configure Azure credentials', error: true });
      setIsPlaying(false);
      return;
    }

    try {
      const ttsService = new SimpleTTS(settings.azureKey, settings.azureRegion);
      const response = await ttsService.createStreamingResponse(
        'Hello! This is a test of your selected voice settings.',
        { voice: settings.voice, rate: settings.rate, pitch: settings.pitch }
      );
      await audioService.playStreamingResponse(response, settings.rate || 1);
    } catch (err) {
      console.error('Test voice failed:', err);
      setTestStatus({ text: err.message || 'Voice test failed', error: true });
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying, audioService, settings]);

  if (voicesError) {
    return (
      <div>
        <Alert variant="error">{voicesError}</Alert>
      </div>
    );
  }

  return (
    <div>
      <Grid>
        <Column>
          <ColumnTitle>Azure Speech Service</ColumnTitle>

          <FormGroup>
            <Label htmlFor="azureKey">Speech Key</Label>
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
            <Label htmlFor="azureRegion">Region</Label>
            <Input
              id="azureRegion"
              name="azureRegion"
              value={settings.azureRegion}
              onChange={onChange}
              placeholder="e.g., eastus, japanwest"
            />
          </FormGroup>

          <ValidateRow>
            <Button
              onClick={handleValidate}
              loading={isValidating}
              disabled={isValidating || !settings.azureKey || !settings.azureRegion}
            >
              Validate
            </Button>
            <StatusRow $error={validateStatus.error} $visible={!!validateStatus.text}>
              {validateStatus.text && <Icon name={validateStatus.error ? 'error' : 'check'} size={14} />}
              {validateStatus.text}
            </StatusRow>
          </ValidateRow>
        </Column>

        <Column style={{ opacity: isValidated ? 1 : 0.45, transition: 'opacity 0.2s ease' }}>
          <ColumnTitle>Voice Selection</ColumnTitle>

          {(() => {
            const current = allVoices.find(v => v.value === settings.voice);
            return (
              <CurrentVoiceCard>
                <Icon name="mic" size={16} />
                <div>
                  <span className="voice-name">{current ? current.label : settings.voice || 'Not selected'}</span>
                  {current && (
                    <span className="voice-meta"> — {current.locale}{current.isMultilingual ? ' [ML]' : ''}</span>
                  )}
                </div>
              </CurrentVoiceCard>
            );
          })()}

          <Toolbar>
            <SearchWrapper>
              <SearchInput
                type="text"
                placeholder="Search voices..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={!isValidated}
              />
              <ClearButton
                $visible={!!searchTerm}
                onClick={() => setSearchTerm('')}
                disabled={!isValidated}
                title="Clear search"
              >
                <Icon name="x" size={14} />
              </ClearButton>
            </SearchWrapper>
            <FilterGroup>
              {['all', 'Male', 'Female'].map(g => (
                <FilterPill
                  key={g}
                  $active={filterGender === g}
                  onClick={() => setFilterGender(g)}
                  disabled={!isValidated}
                >
                  {g === 'all' ? 'All' : g}
                </FilterPill>
              ))}
            </FilterGroup>
            <FilterPill
              $active={filterMultilingual === 'yes'}
              onClick={() => setFilterMultilingual(filterMultilingual === 'yes' ? 'all' : 'yes')}
              disabled={!isValidated}
              title="Multilingual voices"
            >
              ML
            </FilterPill>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} disabled={!isValidated}>
                Reset
              </Button>
            )}
            <Badge variant="default">{filteredVoices.length}/{allVoices.length}</Badge>
          </Toolbar>

          <Select
            id="voice"
            name="voice"
            value={pendingVoice}
            onChange={e => setPendingVoice(e.target.value)}
            disabled={!isValidated}
          >
            {filteredVoices.length === 0 ? (
              <option value="">{isValidated ? 'No voices match filters' : 'Validate credentials first'}</option>
            ) : (
              filteredVoices.map(voice => (
                <option key={voice.value} value={voice.value}>
                  {voice.label} ({voice.locale}){voice.isMultilingual ? ' [ML]' : ''}
                </option>
              ))
            )}
          </Select>

          <ConfirmRow>
            <Button
              size="sm"
              disabled={!isValidated || pendingVoice === settings.voice}
              onClick={handleConfirmVoice}
            >
              Confirm Voice
            </Button>
          </ConfirmRow>
        </Column>
      </Grid>

      <BottomSection>
        <SectionHeader>Playback</SectionHeader>
        <SliderStack>
          <Slider
            label="Speed"
            name="rate"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.rate}
            onChange={onChange}
            valueDisplay={`${Number(settings.rate).toFixed(1)}x`}
          />
          <Slider
            label="Pitch"
            name="pitch"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.pitch}
            onChange={onChange}
            valueDisplay={`${Number(settings.pitch).toFixed(1)}x`}
          />
        </SliderStack>
      </BottomSection>

      <Actions>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusRow $error={testStatus.error} $visible={!!testStatus.text}>
            {testStatus.text && <Icon name={testStatus.error ? 'error' : 'check'} size={14} />}
            {testStatus.text}
          </StatusRow>
          <Button
            variant="secondary"
            onClick={handleTestVoice}
            disabled={isPlaying || filteredVoices.length === 0}
            loading={isPlaying}
            icon={isPlaying ? undefined : 'play'}
          >
            {isPlaying ? 'Playing...' : 'Test'}
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusRow $error={saveStatus.error} $visible={!!saveStatus.text}>
            {saveStatus.text && <Icon name={saveStatus.error ? 'error' : 'check'} size={14} />}
            {saveStatus.text}
          </StatusRow>
          <Button
            onClick={handleSave}
            loading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Actions>
    </div>
  );
}
