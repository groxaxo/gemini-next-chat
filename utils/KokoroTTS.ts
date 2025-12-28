interface KokoroTTSOptions {
  input: string
  voice?: string
  responseFormat?: 'mp3' | 'wav' | 'opus' | 'flac' | 'pcm'
  speed?: number
}

interface KokoroTTSResponse {
  arrayBuffer: () => Promise<ArrayBuffer>
}

class KokoroTTS {
  private apiUrl: string
  private defaultVoice: string

  constructor(apiUrl: string, defaultVoice = 'af_bella') {
    this.apiUrl = apiUrl.replace(/\/$/, '') // Remove trailing slash
    this.defaultVoice = defaultVoice
  }

  async create(options: KokoroTTSOptions): Promise<KokoroTTSResponse | null> {
    const { input, voice = this.defaultVoice, responseFormat = 'mp3', speed = 1.0 } = options

    try {
      const response = await fetch(`${this.apiUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'kokoro',
          input,
          voice,
          response_format: responseFormat,
          speed,
        }),
      })

      if (!response.ok) {
        console.error('Kokoro TTS API error:', response.statusText)
        return null
      }

      return {
        arrayBuffer: () => response.arrayBuffer(),
      }
    } catch (error) {
      console.error('Kokoro TTS error:', error)
      return null
    }
  }

  // Get available voices from the API
  async getVoices(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/voices`)
      if (!response.ok) {
        console.error('Failed to fetch Kokoro voices')
        return this.getDefaultVoices()
      }
      const data = await response.json()
      return data.voices || this.getDefaultVoices()
    } catch (error) {
      console.error('Error fetching Kokoro voices:', error)
      return this.getDefaultVoices()
    }
  }

  // Fallback voices based on Kokoro documentation
  private getDefaultVoices(): string[] {
    return [
      'af_bella',
      'af_sarah',
      'am_adam',
      'am_michael',
      'bf_emma',
      'bf_isabella',
      'bm_george',
      'bm_lewis',
    ]
  }
}

export default KokoroTTS
