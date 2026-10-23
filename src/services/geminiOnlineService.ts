import { AIStudioAnalysis } from '../types';

export interface AnalyzeProfileResult {
  success: boolean;
  aiAnalysis?: AIStudioAnalysis;
  isRateLimit?: boolean;
  error?: string;
  webSources?: string[];
  isPartialWebData?: boolean;
}

/**
 * Checks server health and Gemini API availability
 */
export async function checkGeminiStatus(): Promise<{ available: boolean; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) return { available: false, hasApiKey: false };
    const data = await res.json();
    return { available: data.status === 'ok', hasApiKey: !!data.hasApiKey };
  } catch {
    return { available: false, hasApiKey: false };
  }
}

/**
 * Calls the server endpoint to analyze a single profile using Gemini 3.8 Flash
 */
export async function analyzeProfileOnline(profile: {
  username: string;
  profileUrl?: string;
  displayName?: string;
  notes?: string;
}): Promise<AnalyzeProfileResult> {
  try {
    const response = await fetch('/api/gemini/analyze-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: profile.username,
        profileUrl: profile.profileUrl,
        displayName: profile.displayName,
        notes: profile.notes,
      }),
    });

    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        isRateLimit: true,
        error: data.message || 'Limite di frequenza superato (Rate Limit 429). In pausa per raffreddamento...',
      };
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || `Errore server (${response.status})`,
      };
    }

    const data = await response.json();
    if (!data.success || !data.aiAnalysis) {
      return {
        success: false,
        error: data.error || 'Risposta del server incompleta o non valida',
      };
    }

    return {
      success: true,
      aiAnalysis: data.aiAnalysis as AIStudioAnalysis,
      webSources: data.webSources,
      isPartialWebData: data.isPartialWebData,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Errore di connessione con il server locale',
    };
  }
}
