import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import styled from "styled-components";
import { AudioService } from "../../services/audioService";
import { getSettings } from "../../utils/settingsStorage";
import { createTTSStream } from "../../utils/audioPlayer";
import { Button, Badge, Icon, TextArea } from "../../components/ui";
import "../../styles/theme.css";

const PopupContainer = styled.div.attrs({ className: 'popup' })`
  background: var(--bg-surface);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Header = styled.header.attrs({ className: 'popup__header' })`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 16px;
  border-bottom: 1px solid var(--border-color);
`;

const LogoWrap = styled.div.attrs({ className: 'popup__logo-wrap' })`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoImg = styled.img.attrs({ className: 'popup__logo-img' })`
  width: 18px;
  height: 18px;
`;

const Title = styled.h1.attrs({ className: 'popup__title' })`
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.2px;
  color: var(--text-primary);
`;

const StyledTextArea = styled(TextArea).attrs({ className: 'popup__input-area' })`
  min-height: 110px;
  resize: none;
  width: calc(100% - 32px);
  margin: 6px 16px;
  flex: 1;
`;

const Actions = styled.div.attrs({ className: 'popup__actions' })`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 16px;
`;

const InitContainer = styled.div.attrs({ className: 'popup__init' })`
  padding: 24px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const InitText = styled.p.attrs({ className: 'popup__init-text' })`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
`;

function Popup() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("");
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [audioService] = useState(() => new AudioService());

  useEffect(() => {
    const loadState = async () => {
      try {
        const storage = (typeof browser !== 'undefined' ? browser : (window as any).chrome).storage.local;
        const result = await storage.get(["onboardingCompleted", "lastInput"]);
        if (result.onboardingCompleted !== undefined) setOnboardingCompleted(result.onboardingCompleted);
        if (result.lastInput) setText(result.lastInput);
      } catch (err) {
        console.error("Popup: Failed to load state", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const storage = (typeof browser !== 'undefined' ? browser : (window as any).chrome).storage.local;
    storage.set({ lastInput: newText });
  };

  const handleSpeak = async () => {
    if (!text.trim()) return;
    setIsSpeaking(true);
    setStatus("Reading...");
    try {
      const settings = await getSettings();
      if (!settings.azureKey || !settings.azureRegion) {
        setStatus("Error: Set credentials in Settings");
        setIsSpeaking(false);
        return;
      }
      const credentials = { azureKey: settings.azureKey, azureRegion: settings.azureRegion };
      const voiceSettings = { voice: settings.voice, rate: settings.rate, pitch: settings.pitch };
      const response = await createTTSStream(text.trim(), voiceSettings, credentials);
      await audioService.playStreamingResponse(response, settings.rate || 1);
      setStatus("");
      setIsSpeaking(false);
    } catch (error: any) {
      console.error("Popup speak error:", error);
      setStatus("Error: " + (error.message || "Playback failed"));
      setIsSpeaking(false);
    }
  };

  const handleStop = async () => {
    try { await audioService.stopAudio(); } catch (e) {}
    setIsSpeaking(false);
    setStatus("");
  };

  const openOptions = () => {
    const runtime = (typeof browser !== 'undefined' ? browser : (window as any).chrome).runtime;
    const tabs = (typeof browser !== 'undefined' ? browser : (window as any).chrome).tabs;
    tabs.create({ url: runtime.getURL("/options.html") });
  };

  if (isLoading) return null;

  if (!onboardingCompleted) {
    return (
      <PopupContainer>
        <InitContainer>
          <InitText>Initialization Required</InitText>
          <Button onClick={openOptions} icon="settings">Setup</Button>
        </InitContainer>
      </PopupContainer>
    );
  }

  return (
    <PopupContainer>
      <Header>
        <LogoWrap>
          <LogoImg src="/assets/icons/icon-48.png" alt="" />
          <Title>Narravo</Title>
        </LogoWrap>
        <Button
          variant="ghost"
          size="sm"
          icon="settings"
          onClick={openOptions}
          title="Settings"
          aria-label="Settings"
        />
      </Header>

      <StyledTextArea
        placeholder="Paste content..."
        value={text}
        onChange={handleTextChange}
        disabled={isSpeaking}
      />

      <Actions>
        {!isSpeaking ? (
          <Button
            onClick={handleSpeak}
            disabled={!text.trim()}
            icon="play"
            fullWidth
          >
            Read Aloud
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={handleStop}
            icon="stop"
            fullWidth
          >
            Stop
          </Button>
        )}
        {status && (
          <Badge variant="primary">{status}</Badge>
        )}
      </Actions>
    </PopupContainer>
  );
}

const container = document.getElementById("root");
if (container && !container.hasAttribute('data-rendered')) {
  container.setAttribute('data-rendered', 'true');
  const root = ReactDOM.createRoot(container);
  root.render(<Popup />);
}
