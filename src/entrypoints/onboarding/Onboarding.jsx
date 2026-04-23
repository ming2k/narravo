import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { StepIndicator } from "../../components/ui";
import { RenderSteps } from "./components/RenderSteps";
import { NavigationButtons } from "./components/NavigationButtons";
import { SimpleTTS } from "../../services/ttsService";
import { getAzureCredentials } from "../../utils/azureConfig";

const Container = styled.div.attrs({ className: 'onboarding' })`
  max-width: 560px;
  margin: 48px auto;
  padding: 0 20px;
`;

const CardWrapper = styled.div.attrs({ className: 'onboarding__card' })`
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-xl);

  @media (max-width: 600px) {
    padding: 24px;
    border-radius: var(--radius-lg);
  }
`;

const TOTAL_STEPS = 3;
const STEP_LABELS = ['Welcome', 'Configure', 'Complete'];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [azureKey, setAzureKey] = useState("");
  const [azureRegion, setAzureRegion] = useState("");
  const [error, setError] = useState("");
  const [existingSettings, setExistingSettings] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { settings } = await browser.storage.local.get("settings");
      const credentials = await getAzureCredentials(settings);

      if (settings) {
        setExistingSettings(settings);
      }

      setAzureKey(credentials.azureKey || "");
      setAzureRegion(credentials.azureRegion || "");
    };

    loadSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setError("");
    if (field === "azureKey") setAzureKey(value);
    if (field === "azureRegion") setAzureRegion(value);
  };

  const validateCredentials = async (key, region) => {
    if (!key || !region) {
      setError("Please enter both Azure key and region");
      return false;
    }

    if (isValidating) return false;

    setIsValidating(true);
    setError("");

    try {
      const ttsService = new SimpleTTS(key, region);
      await ttsService.getVoicesList();
      return true;
    } catch (err) {
      console.error("Validation error:", err);
      setError("Invalid Azure credentials. Please check your key and region.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const saveSettings = async () => {
    try {
      const newSettings = {
        ...(existingSettings || {}),
        voice: existingSettings?.voice || "zh-CN-XiaoxiaoMultilingualNeural",
        rate: existingSettings?.rate || 1,
        pitch: existingSettings?.pitch || 1,
        azureKey,
        azureRegion,
        showKey: false,
        onboardingCompleted: true,
      };

      await Promise.all([
        browser.storage.local.set({ settings: newSettings }),
        browser.storage.local.set({ onboardingCompleted: true }),
      ]);

      return true;
    } catch (err) {
      console.error("Settings save error:", err);
      setError("Failed to save settings. Please try again.");
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const isValid = await validateCredentials(azureKey, azureRegion);
      if (!isValid) return;

      const saved = await saveSettings();
      if (saved) {
        setCurrentStep(3);
      }
      return;
    }

    if (currentStep === 3) {
      window.close();
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Container>
      <CardWrapper>
        <StepIndicator steps={STEP_LABELS} currentStep={currentStep} />
        <RenderSteps
          currentStep={currentStep}
          azureKey={azureKey}
          azureRegion={azureRegion}
          onChange={handleInputChange}
          error={error}
        />
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={handleBack}
          onNext={handleNext}
          isLoading={isValidating}
        />
      </CardWrapper>
    </Container>
  );
}
