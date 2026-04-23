import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Button, Select, Slider, Badge, Alert } from '../../../../components/ui';
import { SectionTitle, SectionDescription, SectionDivider } from '../common';
import { AudioService } from '../../../../services/audioService';
import { testVoice } from '../../../../utils/audioPlayer';

const Section = styled.div.attrs({ className: 'options-tab-audio__section' })`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.h3.attrs({ className: 'options-tab-audio__section-header' })`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin: 0 0 16px 0;
`;

const VoiceSelect = styled(Select).attrs({ className: 'options-tab-audio__voice-select' })`
  font-size: 14px;
`;

const Toolbar = styled.div.attrs({ className: 'options-tab-audio__toolbar' })`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input.attrs({ className: 'options-tab-audio__search' })`
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  flex: 1;
  min-width: 140px;
  padding: 7px 12px 7px 32px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition-fast);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10px center;

  &:focus {
    border-color: var(--border-focus);
  }

  &::placeholder {
    color: var(--text-placeholder);
  }
`;

const FilterSelect = styled(Select).attrs({ className: 'options-tab-audio__filter' })`
  width: auto;
  min-width: 100px;
  font-size: 13px;
  padding: 7px 28px 7px 10px;
  background-position: right 8px center;
`;

const SliderStack = styled.div.attrs({ className: 'options-tab-audio__slider-stack' })`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Actions = styled.div.attrs({ className: 'options-tab-audio__actions' })`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 32px;
`;

export function AudioSettings({ settings, groupedVoices, onChange, onSave, isSaving, voicesError }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioService] = useState(() => new AudioService());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterMultilingual, setFilterMultilingual] = useState('all');
  const [filterLocale, setFilterLocale] = useState('all');

  useEffect(() => {
    return () => {
      audioService.stopAudio().catch(() => {});
    };
  }, [audioService]);

  const allVoices = useMemo(() => {
    if (!groupedVoices) return [];
    return Object.values(groupedVoices)
      .flat()
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [groupedVoices]);

  const uniqueLocales = useMemo(() => {
    return [...new Set(allVoices.map(v => v.locale))].sort();
  }, [allVoices]);

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

  const handleTestVoice = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await testVoice(audioService, {
        voice: settings.voice,
        rate: settings.rate,
        pitch: settings.pitch
      });
    } catch (err) {
      console.error('Test voice failed:', err);
      alert('Voice test failed. Check your API settings.');
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying, audioService, settings]);

  if (voicesError) {
    return (
      <div>
        <SectionTitle>Audio Settings</SectionTitle>
        <Alert variant="error">{voicesError}</Alert>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>Audio Settings</SectionTitle>
      <SectionDescription>
        Configure voice and playback settings.
      </SectionDescription>

      <Section>
        <SectionHeader>Voice Selection</SectionHeader>

        <Toolbar>
          <SearchInput
            type="text"
            placeholder="Search voices..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <FilterSelect value={filterGender} onChange={e => setFilterGender(e.target.value)}>
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </FilterSelect>
          <FilterSelect value={filterMultilingual} onChange={e => setFilterMultilingual(e.target.value)}>
            <option value="all">All Types</option>
            <option value="yes">Multilingual</option>
            <option value="no">Standard</option>
          </FilterSelect>
          <FilterSelect value={filterLocale} onChange={e => setFilterLocale(e.target.value)}>
            <option value="all">All Locales</option>
            {uniqueLocales.map(locale => (
              <option key={locale} value={locale}>{locale}</option>
            ))}
          </FilterSelect>
          <Badge variant="default">{filteredVoices.length} / {allVoices.length}</Badge>
        </Toolbar>

        <VoiceSelect
          id="voice"
          name="voice"
          value={settings.voice}
          onChange={onChange}
        >
          {filteredVoices.length === 0 ? (
            <option value="">No voices match filters</option>
          ) : (
            filteredVoices.map(voice => (
              <option key={voice.value} value={voice.value}>
                {voice.label} ({voice.locale}){voice.isMultilingual ? ' [ML]' : ''}
              </option>
            ))
          )}
        </VoiceSelect>
      </Section>

      <SectionDivider />

      <Section>
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
      </Section>

      <Actions>
        <Button
          variant="secondary"
          onClick={handleTestVoice}
          disabled={isPlaying || filteredVoices.length === 0}
          icon={isPlaying ? 'spinner' : 'play'}
        >
          {isPlaying ? 'Playing...' : 'Test'}
        </Button>
        <Button onClick={onSave} loading={isSaving}>
          {isSaving ? 'Saved' : 'Save'}
        </Button>
      </Actions>
    </div>
  );
}
