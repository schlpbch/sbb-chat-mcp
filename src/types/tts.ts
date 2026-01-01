export type TTSState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface TTSVoiceConfig {
  languageCode: string;
  voiceName: string;
  ssmlGender: 'NEUTRAL' | 'MALE' | 'FEMALE';
}

export interface TTSSettings {
  autoPlay: boolean;
  speechRate: number; // 0.5 - 2.0
  pitch: number; // -20 to 20
  voiceConfig: TTSVoiceConfig;
}

export interface TTSPlaybackState {
  messageId: string;
  state: TTSState;
  progress: number; // 0-100
  error?: string;
}

export interface TTSRequest {
  text: string;
  language: string;
  speechRate?: number;
  pitch?: number;
}

export interface TTSResponse {
  audioContent: string; // base64 encoded audio
  error?: string;
}
