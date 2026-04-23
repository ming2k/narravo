import React, { useState } from "react";
import styled from "styled-components";
import { StepIndicator } from "../../components/ui";
import { RenderSteps } from "./components/RenderSteps";
import { NavigationButtons } from "./components/NavigationButtons";
import { SimpleTTS } from "../../services/ttsService";

const TOTAL_STEPS = 3;
const STEP_LABELS = ['Welcome', 'Configure', 'Complete'];

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

export function OnboardingPopup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [azureKey, setAzureKey] = useState("");
  const [azureRegion, setAzureRegion] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === "azureKey") {
      setAzureKey(value);
    } else if (field === "azureRegion") {
      setAzureRegion(value);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const isValid = await validateCredentials(azureKey, azureRegion);
      if (!isValid) return;

      try {
        await browser.storage.local.set({
          settings: {
            azureKey,
            azureRegion,
            voice: 'en-US-AvaMultilingualNeural',
            rate: 1.0,
            pitch: 1.0,
            showKey: false
          },
          onboardingCompleted: true
        });
        setCurrentStep(3);
      } catch (err) {
        console.error('Failed to save settings:', err);
        setError('Failed to save settings. Please try again.');
      }
      return;
    }

    if (currentStep === 3) {
      window.close();
    }
  };

  return (
    <Container>
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
    </Container>
  );
}
