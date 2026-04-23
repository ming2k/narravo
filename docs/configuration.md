# Configuration Guide

The extension requires Azure Speech Service credentials to function. This guide covers how to set them up for development and production.

## Environment Variables

WXT uses Vite under the hood, so environment variables must be prefixed with `VITE_`.

1. Copy `.env.example` to `.env`.
2. Fill in your Azure credentials:
   ```env
   VITE_AZURE_SPEECH_KEY=your_key_here
   VITE_AZURE_REGION=westus
   ```

## Azure Setup

1. **Create a Resource**: Go to the [Azure Portal](https://portal.azure.com) and create a "Speech" resource.
2. **Get Keys**: Once created, navigate to **Keys and Endpoint**.
3. **Region**: Use the region short name (e.g., `eastus`, `westus2`).

## Storage Schema

The extension stores its state in `browser.storage.local`.

### Settings Object
```typescript
interface Settings {
  azureKey: string;
  azureRegion: string;
  voice: string;
  rate: number;
  pitch: number;
  showKey: boolean;
}
```

### Flags
- `onboardingCompleted`: Boolean flag to determine if the user should see the setup page.
- `lastInput`: Persists the last text entered in the popup.
