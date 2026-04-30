/**
 * Gets Azure credentials from settings object or browser storage
 */
export async function getAzureCredentials(settings: any = null) {
  // First try from passed settings object
  if (settings?.azureKey && settings?.azureRegion) {
    return {
      azureKey: settings.azureKey,
      azureRegion: settings.azureRegion,
    };
  }

  // Then try from browser storage
  try {
    const { settings: storageSettings } =
      await browser.storage.local.get("settings");
    if (storageSettings?.azureKey && storageSettings?.azureRegion) {
      return {
        azureKey: storageSettings.azureKey,
        azureRegion: storageSettings.azureRegion,
      };
    }
  } catch (error) {
    console.warn("Failed to get credentials from browser storage:", error);
  }

  return {
    azureKey: "",
    azureRegion: "",
  };
}
