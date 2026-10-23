/**
 * Utility per la copia affidabile negli appunti (Clipboard) compatibile con
 * browser moderni, contesti iframe (Google AI Studio Preview), finestre secondarie
 * e dispositivi mobili.
 *
 * Utilizza una strategia a più livelli:
 * 1. navigator.clipboard.writeText (Modern API)
 * 2. document.execCommand('copy') con fallback invisibile su <textarea>
 */

export interface CopyStatus {
  success: boolean;
  message?: string;
}

/**
 * Copia una stringa di testo negli appunti di sistema in modo sicuro e affidabile.
 * Restituisce true se l'operazione ha avuto successo effettivo, false altrimenti.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof text !== "string" || text.length === 0) {
    return false;
  }

  // 1. Prova prima l'API moderna se disponibile e sicura
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Se fallisce per permessi iframe, mancato focus o sandbox, procedi con fallback
      console.warn("navigator.clipboard.writeText non consentito o fallito, passo al fallback execCommand:", err);
    }
  }

  // 2. Fallback universale: document.execCommand('copy') con textarea temporanea
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Configurazione invisibile senza spostare la pagina o lo scroll
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0.01";
      textArea.style.zIndex = "-9999";
      textArea.setAttribute("readonly", "");

      document.body.appendChild(textArea);

      // Focus e selezione testo completa
      textArea.focus({ preventScroll: true });
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        return true;
      }
    } catch (execErr) {
      console.error("Fallback document.execCommand('copy') fallito:", execErr);
    }
  }

  return false;
}
