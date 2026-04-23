import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import styled from "styled-components";
import { Modal, Button, Icon } from "../../components/ui";
import { GeneralSettings } from "./components/tabs/GeneralSettings";
import { AboutContent } from "./components/tabs/AboutContent";
import { HelpContent } from "./components/tabs/HelpContent";
import { SponsorContent } from "./components/tabs/SponsorContent";
import { getSettings, saveSettings } from "../../utils/settingsStorage";
import { defaultSettings } from "../../types/storage";
import { SimpleTTS } from "../../services/ttsService";
import "../../styles/theme.css";

const Page = styled.div.attrs({ className: 'options' })`
  min-height: 100vh;
  background: var(--bg-window);
`;

const Container = styled.div.attrs({ className: 'options__container' })`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 640px) {
    padding: 24px 16px;
  }
`;

const Header = styled.header.attrs({ className: 'options__header' })`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 40px;

  @media (max-width: 640px) {
    margin-bottom: 28px;
  }
`;

const HeaderText = styled.div``;

const Title = styled.h1.attrs({ className: 'options__title' })`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p.attrs({ className: 'options__subtitle' })`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
`;

const HeaderActions = styled.div.attrs({ className: 'options__header-actions' })`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
`;

function Settings() {
  const [voicesError, setVoicesError] = useState("");
  const [settings, setSettings] = useState({ ...defaultSettings });
  const [groupedVoices, setGroupedVoices] = useState<Record<string, any[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const isUserChange = useRef(false);

  useEffect(() => {
    getSettings().then(async (savedSettings) => {
      setSettings(savedSettings);

      if (savedSettings.azureKey && savedSettings.azureRegion) {
        await fetchVoices(savedSettings);
      }
    });
  }, []);

  // Auto-save settings when user makes changes (debounced 500ms)
  useEffect(() => {
    if (!isUserChange.current) return;
    const timer = setTimeout(() => {
      saveSettings(settings).catch(err => console.error('Auto-save failed:', err));
    }, 500);
    return () => clearTimeout(timer);
  }, [settings]);

  const fetchVoices = async (currentSettings: any) => {
    try {
      const ttsService = new SimpleTTS(
        currentSettings.azureKey,
        currentSettings.azureRegion,
      );
      const voicesList = await ttsService.getVoicesList();
      setGroupedVoices(voicesList);
      setVoicesError("");
    } catch (error) {
      console.error("Failed to load voices:", error);
      setVoicesError("Failed to load voices. Please check your API settings.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    isUserChange.current = true;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === "checkbox" ? checked : value;

    setSettings((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveSettings(settings);

      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      alert("Error saving settings");
      console.error(error);
    }
  };

  return (
    <Page>
      <Container>
        <Header>
          <HeaderText>
            <Title>Settings</Title>
            <Subtitle>Configure your voice and API preferences</Subtitle>
          </HeaderText>
          <HeaderActions>
            <Button
              variant="ghost"
              size="sm"
              icon="info"
              onClick={() => setAboutOpen(true)}
              title="About"
              aria-label="About"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="help"
              onClick={() => setHelpOpen(true)}
              title="Help"
              aria-label="Help"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="heart"
              onClick={() => setSponsorOpen(true)}
              title="Support"
              aria-label="Support"
            />
          </HeaderActions>
        </Header>

        <GeneralSettings
          settings={settings}
          onChange={handleChange}
          onSave={handleSave}
          groupedVoices={groupedVoices}
          voicesError={voicesError}
          isSaving={isSaving}
        />
      </Container>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About">
        <AboutContent />
      </Modal>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help">
        <HelpContent />
      </Modal>

      <Modal open={sponsorOpen} onClose={() => setSponsorOpen(false)} title="Support">
        <SponsorContent />
      </Modal>
    </Page>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Settings />);
