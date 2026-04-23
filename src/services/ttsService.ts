interface VoiceSettings {
  voice?: string;
  rate?: number;
  pitch?: number;
}

export class TTSService {
  private azureKey: string;
  private azureRegion: string;
  private baseUrl: string | null;

  constructor(azureKey?: string, azureRegion?: string) {
    this.azureKey = azureKey || '';
    this.azureRegion = azureRegion || '';
    this.baseUrl = azureRegion ?
      `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1` : null;
  }

  setCredentials(azureKey: string, azureRegion: string): void {
    this.azureKey = azureKey;
    this.azureRegion = azureRegion;
    this.baseUrl = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  private escapeXmlChars(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private createSSML(text: string, voice: string = "zh-CN-XiaoxiaoMultilingualNeural", rate: string = "+0.00%", pitch: string = "+0.00%"): string {
    const escapedText = this.escapeXmlChars(text);
    const voiceLang = voice.split("-").slice(0, 2).join("-");

    // Azure expects signed percentages with two decimals: +50.00%, -30.00%, etc.
    // When rate and pitch are at default values, omit the prosody tag for cleaner SSML
    // and to avoid any potential edge cases with zero-percentage values.
    const hasProsody = rate !== "+0.00%" || pitch !== "+0.00%";

    if (hasProsody) {
      return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='${voiceLang}'>
        <voice name='${voice}'>
            <prosody rate="${rate}" pitch="${pitch}">
                ${escapedText}
            </prosody>
        </voice>
    </speak>`.trim();
    }

    return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voiceLang}'>
        <voice name='${voice}'>
            ${escapedText}
        </voice>
    </speak>`.trim();
  }

  private getAudioFormat(): { audioFormat: string; mimeType: string } {
    // webm-24khz-16bit-mono-opus is excellent for low-latency streaming
    // and is highly compatible with the MediaSource API used in our AudioService.
    return {
      audioFormat: 'webm-24khz-16bit-mono-opus',
      mimeType: 'audio/webm; codecs="opus"'
    };
  }

  async createStreamingResponse(
    text: string,
    settings: VoiceSettings = {},
    signal?: AbortSignal
  ): Promise<Response> {
    if (!this.azureKey || !this.azureRegion) {
      throw new Error("Azure credentials not configured");
    }

    // Convert UI multiplier (0.5-2.0) to Azure SSML signed percentage with two decimals
    const ratePercent = (((settings.rate || 1) - 1) * 100).toFixed(2);
    const pitchPercent = (((settings.pitch || 1) - 1) * 100).toFixed(2);

    const rateStr = Number(ratePercent) >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    const pitchStr = Number(pitchPercent) >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;

    const ssml = this.createSSML(text, settings.voice, rateStr, pitchStr);
    const { audioFormat } = this.getAudioFormat();

    try {
      const requestInit: RequestInit = {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': audioFormat,
          'User-Agent': 'Narravo/1.0'
        },
        body: ssml
      };

      if (signal) {
        requestInit.signal = signal;
      }

      const response = await fetch(this.baseUrl!, requestInit);

      if (!response.ok) {
        let errorDetails = response.statusText;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorDetails = errorText;
          }
        } catch {
          // Ignore error parsing error response
        }

        if (response.status === 401) {
          throw new Error(`Invalid Azure API key or expired subscription`);
        } else if (response.status === 403) {
          throw new Error(`Access denied. Check your Azure subscription and region`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Please try again later`);
        } else {
          throw new Error(`Speech synthesis failed (${response.status}): ${errorDetails}`);
        }
      }

      return response;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw error;
      }

      if (error.message?.includes('fetch')) {
        throw new Error(`Network error: Check your internet connection`);
      }
      throw error;
    }
  }

  async getVoicesList(): Promise<Record<string, any[]>> {
    if (!this.azureKey || !this.azureRegion) {
      throw new Error("Azure credentials not configured");
    }

    const response = await fetch(
      `https://${this.azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": this.azureKey,
          "Content-Type": "application/json"
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch voices (${response.status}): ${errorText}`);
    }

    const voices = await response.json();

    const groupedVoices = voices.reduce((acc: Record<string, any[]>, voice: any) => {
      const locale = voice.Locale;
      if (!acc[locale]) {
        acc[locale] = [];
      }

      acc[locale].push({
        value: voice.ShortName,
        label: `${voice.DisplayName} (${voice.Gender})`,
        locale: voice.Locale,
        gender: voice.Gender,
        styles: voice.StyleList || [],
        isMultilingual: !!voice.SecondaryLocaleList,
      });

      return acc;
    }, {});

    return groupedVoices;
  }
}

// SimpleTTS wrapper class for backward compatibility
export class SimpleTTS {
  private ttsService: TTSService;

  constructor(azureKey?: string, azureRegion?: string) {
    this.ttsService = new TTSService(azureKey, azureRegion);
  }

  async getVoicesList(): Promise<Record<string, any[]>> {
    return this.ttsService.getVoicesList();
  }

  async createStreamingResponse(text: string, settings: VoiceSettings = {}, signal?: AbortSignal): Promise<Response> {
    return this.ttsService.createStreamingResponse(text, settings, signal);
  }
}
