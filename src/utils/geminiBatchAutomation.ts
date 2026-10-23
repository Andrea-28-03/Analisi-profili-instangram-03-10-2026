import { downloadTextData, downloadMultipleFilesSequentially } from "./exportUtils";

/**
 * Generates the Windows Batch Launcher (.bat)
 * Robust: never crashes silently, includes pause, guides the user cleanly.
 */
export function generateBatchScriptContent(): string {
  return `@echo off
chcp 65001 > nul
title Curator - Assistente Batch Gemini
color 0F

cls
echo ===============================================================================
echo     CURATOR - ASSISTENTE ANALISI BATCH GEMINI
echo ===============================================================================
echo.
echo Questo assistente ti permette di gestire l'analisi dei tuoi profili Instagram.
echo.
echo -------------------------------------------------------------------------------
echo [AVVISO IMPORTANTE SUL BROWSER WEB]
echo L'interfaccia web di Google (gemini.google.com) adotta la protezione anti-bot
echo "BotGuard": i browser automatizzati da script vengono bloccati con l'errore
echo "Questo browser o app potrebbe non essere sicuro" al momento del login.
echo Inoltre Google vieta nei suoi termini di servizio l'automazione del sito web.
echo -------------------------------------------------------------------------------
echo.
echo LE DUE MODALITA CONSIGLIATE E 100%% FUNZIONANTI:
echo.
echo [MODALITA 1] GEMINI WEB CHAT (Manuale Veloce - 2 Minuti):
echo   1. Apri https://gemini.google.com sul tuo browser normale dove sei gia loggato.
echo   2. Su Curator seleziona lotti grandi (50-75 profili) o "Tutti in un colpo solo".
echo   3. Clicca "Copia Prompt con Profili Inclusi" e incollalo (Ctrl+V) nella chat di Gemini!
echo      (Non serve neanche fare l'upload del file: i profili sono gia nel testo del prompt).
echo   4. Gemini fa la ricerca e risponde con il JSON.
echo   5. Copia il JSON, torna su Curator e premi "Importa JSON". Fatto!
echo.
echo [MODALITA 2] AUTOMAZIONE VERA VIA API (Zero Browser / In Background):
echo   Se vuoi un'automazione vera senza mani, usa le API ufficiali di Google:
echo   - Richiede una chiave gratuita da: https://aistudio.google.com/app/apikey
echo   - Puoi usare lo script Python "curator_gemini_api.py" oppure Node "gemini_api_runner.js".
echo.
echo ===============================================================================
echo Premi un tasto per verificare se sul tuo PC e presente Python o Node.js...
echo ===============================================================================
pause > nul
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Rilevato Python!
    echo Per avviare lo script API ufficiale Python:
    echo   pip install google-genai
    echo   python curator_gemini_api.py
    echo.
)

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Rilevato Node.js!
    echo Per avviare il runner API Node:
    echo   node gemini_api_runner.js
    echo.
)

echo ===============================================================================
echo Finestra di supporto Curator. Premi un tasto per chiudere.
echo ===============================================================================
pause > nul
`;
}

/**
 * Generates the Playwright Node.js macro script
 */
export function generateMacroRunnerJsContent(masterPrompt: string): string {
  return `/**
 * Curator - Gemini Batch Macro Runner
 * Automatizza l'apertura del browser, crea una nuova chat per ciascun lotto,
 * invia il prompt + profili, attende la risposta con Web Search, estrae il JSON
 * e salva sia i file singoli che il file unificato finale.
 */

const fs = require('fs');
const path = require('path');

// Prova a caricare playwright
let playwright;
try {
  playwright = require('playwright');
} catch (e) {
  console.error('[ERRORE] Modulo playwright non trovato. Esegui: npm install playwright');
  process.exit(1);
}

const MASTER_PROMPT = ${JSON.stringify(masterPrompt)};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=================================================================');
  console.log('   CURATOR - AVVIO AUTOMAZIONE MACRO PER GEMINI');
  console.log('=================================================================\\n');

  // 1. Cerca i file dei lotti nella cartella corrente
  const currentDir = process.cwd();
  const allFiles = fs.readdirSync(currentDir);
  
  let lottoFiles = allFiles
    .filter(f => f.startsWith('gemini_lotto_') && f.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\\D/g, '') || '0', 10);
      return numA - numB;
    });

  // Se non trova singoli lotti, controlla se c'è il file master unico
  if (lottoFiles.length === 0) {
    const masterFile = allFiles.find(f => f === 'gemini_tutti_i_lotti_completi.json');
    if (masterFile) {
      console.log('[INFO] Trovato file master unico: decompressione dei lotti in corso...');
      try {
        const masterContent = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
        if (Array.isArray(masterContent.lotti)) {
          masterContent.lotti.forEach((l, idx) => {
            const fname = \`gemini_lotto_\${idx + 1}_di_\${masterContent.lotti.length}.json\`;
            fs.writeFileSync(fname, JSON.stringify(l.profili || l, null, 2), 'utf8');
            lottoFiles.push(fname);
          });
          console.log(\`[OK] Estratti \${lottoFiles.length} file di lotti!\\n\`);
        }
      } catch (err) {
        console.error('[ERRORE] Lettura file master:', err.message);
      }
    }
  }

  if (lottoFiles.length === 0) {
    console.error('[ERRORE] Nessun file "gemini_lotto_*.json" trovato nella cartella!');
    console.error('Assicurati di aver scaricato i file dei lotti da Curator in questa stessa cartella.');
    process.exit(1);
  }

  console.log(\`[INFO] Trovati \${lottoFiles.length} file di lotti da elaborare:\`);
  lottoFiles.forEach((f, idx) => console.log(\`  - [\${idx + 1}/\${lottoFiles.length}] \${f}\`));
  console.log('');

  // 2. Avvio del browser con persistenza della sessione
  console.log('[INFO] Apertura del browser...');
  const userDataDir = path.join(currentDir, 'gemini_browser_session');
  
  let context;
  try {
    // Prova ad avviare Google Chrome di sistema
    context = await playwright.chromium.launchPersistentContext(userDataDir, {
      headless: false,
      channel: 'chrome',
      viewport: { width: 1280, height: 860 },
      args: ['--disable-blink-features=AutomationControlled']
    });
  } catch (e1) {
    try {
      // Prova Microsoft Edge se Chrome non è disponibile
      context = await playwright.chromium.launchPersistentContext(userDataDir, {
        headless: false,
        channel: 'msedge',
        viewport: { width: 1280, height: 860 }
      });
    } catch (e2) {
      // Fallback a Chromium integrato
      context = await playwright.chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 860 }
      });
    }
  }

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  
  console.log('[INFO] Navigazione su https://gemini.google.com/app...');
  await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('\\n-----------------------------------------------------------------');
  console.log('NOTA: Se non hai ancora effettuato l\\'accesso a Google Gemini in');
  console.log('questa finestra, effettua il login ORA nel browser.');
  console.log('La sessione verra ricordata per sempre per le volte successive.');
  console.log('-----------------------------------------------------------------\\n');

  // Attende che l'utente sia autenticato (presenza dell'area input di chat)
  console.log('[IN ATTESA] Rilevamento interfaccia di Gemini...');
  const chatInputSelector = 'div[contenteditable="true"], rich-textarea, textarea, div.ql-editor';
  
  try {
    await page.waitForSelector(chatInputSelector, { timeout: 120000 });
    console.log('[OK] Interfaccia di Gemini pronta!\\n');
  } catch (e) {
    console.error('[ERRORE] Timeout in attesa del login a Gemini. Riprova una volta effettuato il login.');
    await context.close();
    process.exit(1);
  }

  const allAggregatedResults = [];

  // 3. Loop su ciascun lotto
  for (let i = 0; i < lottoFiles.length; i++) {
    const lottoFilename = lottoFiles[i];
    const lottoIndex = i + 1;
    const outputFilename = \`gemini_risultato_lotto_\${lottoIndex}.json\`;

    console.log(\`=================================================================\`);
    console.log(\`[LOTTO \${lottoIndex}/\${lottoFiles.length}] Elaborazione: \${lottoFilename}\`);
    console.log(\`=================================================================\`);

    // Controllo se il file è già stato analizzato in una sessione precedente
    if (fs.existsSync(outputFilename)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(outputFilename, 'utf8'));
        if (Array.isArray(existingData) && existingData.length > 0) {
          console.log(\`[SKIP] Il file "\${outputFilename}" esiste gia con \${existingData.length} profili. Salto!\`);
          allAggregatedResults.push(...existingData);
          continue;
        }
      } catch (err) {
        // file corrotto, rianalizza
      }
    }

    // Lettura dati del lotto
    const lottoRaw = fs.readFileSync(lottoFilename, 'utf8');
    const lottoProfiles = JSON.parse(lottoRaw);

    // 3a. Creazione Nuova Chat per garantire zero allucinazioni e contesto pulito
    console.log('[1/4] Creazione nuova chat pulita...');
    try {
      const newChatBtn = await page.$('button[aria-label*="Nuova chat"], button[aria-label*="New chat"], a[href="/app"]');
      if (newChatBtn) {
        await newChatBtn.click();
        await sleep(1500);
      } else {
        await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded' });
        await sleep(2000);
      }
    } catch (e) {
      await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded' });
      await sleep(2000);
    }

    // 3b. Composizione del messaggio
    const fullPromptMessage = \`\${MASTER_PROMPT}

Ecco il file JSON con i profili da analizzare:
\`\`\`json
\${JSON.stringify(lottoProfiles, null, 2)}
\`\`\`
\`;

    // 3c. Incolla ed invio
    console.log(\`[2/4] Inserimento prompt per \${lottoProfiles.length} profili...\`);
    const inputElement = await page.waitForSelector(chatInputSelector, { timeout: 15000 });
    
    // Inserisce il testo tramite focus e clipboard o innerText per gestire grandi blocchi
    await inputElement.click();
    await sleep(400);

    // Usa evaluate per impostare il testo in modo istantaneo
    await page.evaluate(({ selector, text }) => {
      const el = document.querySelector(selector);
      if (el) {
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          el.value = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          el.innerText = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, { selector: chatInputSelector, text: fullPromptMessage });

    await sleep(800);

    console.log('[3/4] Invio del messaggio a Gemini...');
    // Clic pulsante invia o tasto Invio
    const sendButton = await page.$('button[aria-label*="Invia"], button[aria-label*="Send"], button.send-button, mat-icon:has-text("send")');
    if (sendButton) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // 3d. Attesa completamento della risposta con Web Search
    console.log('[4/4] In attesa della generazione di Gemini (Web search attiva)...');
    process.stdout.write('Elaborazione in corso');

    let completed = false;
    let attempts = 0;
    const maxAttempts = 150; // fino a 5 minuti per lotto

    while (!completed && attempts < maxAttempts) {
      await sleep(2000);
      attempts++;
      process.stdout.write('.');

      // Controlla se il pulsante "Interrompi" / "Stop" è sparito e se compare un blocco codice o testo finale
      const isStopButtonVisible = await page.evaluate(() => {
        const stopBtn = document.querySelector('button[aria-label*="Interrompi"], button[aria-label*="Stop"]');
        return !!stopBtn && stopBtn.offsetParent !== null;
      });

      if (!isStopButtonVisible && attempts > 4) {
        // Verifica se c'è un blocco di codice markdown JSON nella risposta
        const hasCodeBlock = await page.evaluate(() => {
          const codes = Array.from(document.querySelectorAll('pre code, .code-block, message-content'));
          return codes.some(c => c.innerText && (c.innerText.includes('aiAnalysis') || c.innerText.includes('"username"')));
        });

        if (hasCodeBlock) {
          // Attende ancora 2 secondi per sicurezza per il completamento del rendering
          await sleep(2500);
          completed = true;
        }
      }
    }
    console.log('\\n[OK] Risposta generata!');

    // 3e. Estrazione del JSON
    const extractedData = await page.evaluate(() => {
      // 1. Prova prima a cercare dentro i tag <pre> o <code>
      const codeElements = Array.from(document.querySelectorAll('pre code, pre, .code-container code'));
      for (const el of codeElements) {
        const text = el.innerText || el.textContent || '';
        if (text.includes('aiAnalysis') || text.includes('"username"')) {
          try {
            // Rimuove backtick o intestazioni markdown se presenti
            const clean = text.replace(/^\\s*\`\`\`json/i, '').replace(/^\\s*\`\`\`/i, '').replace(/\`\`\`\\s*$/i, '').trim();
            const parsed = JSON.parse(clean);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch (e) {}
        }
      }

      // 2. Se non in un tag code, cerca in tutto il testo dell'ultimo messaggio
      const messages = Array.from(document.querySelectorAll('message-content, .model-response-text'));
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        const text = lastMsg.innerText || '';
        const match = text.match(/\\[\\s*\\{[\\s\\S]*\\"username\\"[\\s\\S]*\\}\\s*\\]/);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch (e) {}
        }
      }
      return null;
    });

    if (extractedData && Array.isArray(extractedData)) {
      fs.writeFileSync(outputFilename, JSON.stringify(extractedData, null, 2), 'utf8');
      console.log(\`[SUCCESSO] Salvato: "\${outputFilename}" con \${extractedData.length} profili!\\n\`);
      allAggregatedResults.push(...extractedData);
    } else {
      console.warn(\`[ATTENZIONE] Impossibile estrarre automaticamente il JSON per il lotto \${lottoIndex}.\`);
      console.warn('Puoi copiare manualmente la risposta dal browser aperto se necessario.\\n');
    }

    // Pausa di 3 secondi tra un lotto e l'altro
    if (i < lottoFiles.length - 1) {
      console.log('Attesa di 3 secondi prima del prossimo lotto...');
      await sleep(3000);
    }
  }

  // 4. Salvataggio del file unificato finale
  const unifiedFilename = 'gemini_risultati_unificati.json';
  if (allAggregatedResults.length > 0) {
    fs.writeFileSync(unifiedFilename, JSON.stringify(allAggregatedResults, null, 2), 'utf8');
    console.log('=================================================================');
    console.log(\`[COMPLETATO] Salvato file unificato: "\${unifiedFilename}"!\`);
    console.log(\`Totale profili analizzati con successo: \${allAggregatedResults.length}\`);
    console.log('=================================================================\\n');
    console.log('PROSSIMO PASSAGGIO:');
    console.log(\`1. Apri Curator nel browser\`);
    console.log(\`2. Trascina "\${unifiedFilename}" sul pulsante "Importa Risultati Gemini"\`);
    console.log(\`3. Tutti i profili del taccuino verranno istantaneamente aggiornati!\\n\`);
  }

  console.log('L\\'automazione e terminata. Premi CTRL+C per chiudere il terminale.');
}

run().catch(err => {
  console.error('[ERRORE CRITICO NELLA MACRO]:', err);
});
`;
}

/**
 * Generates an alternative Zero-Browser API Runner
 */
export function generateApiRunnerJsContent(masterPrompt: string): string {
  return `/**
 * Curator - Gemini API Batch Runner (Zero Browser / Ultra Veloce)
 * Esegue le chiamate direttamente alle API di Gemini 2.5 Pro con Google Search Grounding.
 */

const fs = require('fs');
const https = require('https');

const MASTER_PROMPT = ${JSON.stringify(masterPrompt)};

// Inserisci la tua Gemini API Key qui oppure impostala nella variabile d'ambiente GEMINI_API_KEY
const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.log('=================================================================');
  console.log('   CURATOR - RUNNER API GEMINI PRO');
  console.log('=================================================================\\n');
  console.log('[AVVISO] Nessuna chiave API trovata!');
  console.log('Per usare questo runner ultra-veloce senza browser:');
  console.log('1. Ottieni una chiave API gratuita su: https://aistudio.google.com/app/apikey');
  console.log('2. Esegui nel terminale:');
  console.log('   set GEMINI_API_KEY=la_tua_chiave_qui');
  console.log('   node gemini_api_runner.js\\n');
  process.exit(1);
}

// Chiamata REST a Gemini 2.5 Pro con Search Grounding
async function callGemini(profilesChunk) {
  const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=\${API_KEY}\`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: \`\${MASTER_PROMPT}\\n\\nDATI DEI PROFILI:\\n\` + JSON.stringify(profilesChunk, null, 2)
          }
        ]
      }
    ],
    tools: [
      {
        googleSearch: {} // Attiva Web Search Grounding
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const resp = JSON.parse(data);
          if (resp.error) return reject(new Error(resp.error.message));
          const text = resp.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('Nessun testo nella risposta'));
          resolve(JSON.parse(text));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const allFiles = fs.readdirSync(process.cwd());
  const lottoFiles = allFiles
    .filter(f => f.startsWith('gemini_lotto_') && f.endsWith('.json'))
    .sort((a, b) => (parseInt(a.replace(/\\D/g, '') || '0') - parseInt(b.replace(/\\D/g, '') || '0')));

  if (lottoFiles.length === 0) {
    console.error('Nessun file gemini_lotto_*.json trovato!');
    process.exit(1);
  }

  const allResults = [];
  for (let i = 0; i < lottoFiles.length; i++) {
    const filename = lottoFiles[i];
    const outName = \`gemini_risultato_lotto_\${i + 1}.json\`;
    console.log(\`[LOTTO \${i + 1}/\${lottoFiles.length}] Elaborazione con Gemini 2.5 Pro...\`);
    const profiles = JSON.parse(fs.readFileSync(filename, 'utf8'));

    try {
      const results = await callGemini(profiles);
      fs.writeFileSync(outName, JSON.stringify(results, null, 2), 'utf8');
      console.log(\`  -> Salvato: \${outName} (\${results.length} profili)\`);
      allResults.push(...results);
    } catch (err) {
      console.error(\`  -> Errore: \${err.message}\`);
    }
  }

  fs.writeFileSync('gemini_risultati_unificati.json', JSON.stringify(allResults, null, 2), 'utf8');
  console.log('\\n[COMPLETATO] Creato gemini_risultati_unificati.json con tutti i profili!');
}

run();
`;
}

/**
 * Generates the README text file
 */
export function generateReadmeContent(): string {
  return `===============================================================================
       CURATOR - GUIDA ALL'AUTOMAZIONE BATCH PER GEMINI
===============================================================================

Grazie a questo pacchetto puoi analizzare automaticamente tutti i lotti dei profili
senza dover fare copia-incolla a mano per ogni lotto.

COME FUNZIONA:
Lo script apre il tuo browser (Google Chrome o Microsoft Edge), apre automaticamente
una nuova chat pulita per ciascun lotto su Gemini, invia il prompt specialistico
con la ricerca web, attende che l'AI completi l'analisi, cattura il JSON e salva
in automatico:
1. I singoli file: gemini_risultato_lotto_1.json, gemini_risultato_lotto_2.json...
2. Il file unificato finale: gemini_risultati_unificati.json pronto per Curator!

-------------------------------------------------------------------------------
GUIDA RAPIDA IN 3 PASSAGGI:
-------------------------------------------------------------------------------

1. SALVA I FILE NELLA STESSA CARTELLA
   Assicurati che in una stessa cartella (ad esempio nella cartella Download)
   siano presenti:
   - I file dei lotti scaricati da Curator: gemini_lotto_1.json, gemini_lotto_2.json...
   - Il file launcher: avvia_analisi_gemini.bat
   - Lo script: gemini_macro_runner.js

2. AVVIA L'AUTOMAZIONE CON UN DOPPIO CLIC
   Fai doppio clic su:
   ==> "avvia_analisi_gemini.bat"

   - Si aprira una finestra del browser su https://gemini.google.com/app
   - Se e la prima volta, effettua il login con il tuo account Google
     (la sessione verra salvata in una sottocartella locale per non chiedertelo piu).
   - Lo script creera una nuova chat per ogni lotto, inviera il prompt e
     salvera i file man mano.

3. IMPORTA I RISULTATI IN CURATOR
   Al termine, torna su Curator nel browser e:
   - Clicca su "Importa Risultati Gemini" nel menu in alto (oppure trascina il file).
   - Seleziona "gemini_risultati_unificati.json" (oppure seleziona tutti i file singoli).
   - Fatto! Tutti i profili verranno aggiornati con le categorie, le citta,
     le regioni, le specialita e i tag.

-------------------------------------------------------------------------------
DOMANDE FREQUENTI & RISOLUZIONE PROBLEMI:
-------------------------------------------------------------------------------
D: Serve Node.js?
R: Si, lo script del browser usa Node.js. Se non lo hai gia installato, puoi scaricarlo
   gratuitamente in 1 minuto da: https://nodejs.org (versione LTS).

D: Cosa succede se l'automazione viene interrotta?
R: Nessun problema! Lo script riconosce i file "gemini_risultato_lotto_X.json" gia
   salvati e salta direttamente al primo lotto non ancora completato.

D: Posso usare l'alternativa senza browser (via API)?
R: Si! Nel pacchetto trovi anche "gemini_api_runner.js" che usa le API dirette di
   Gemini 2.5 Pro senza aprire finestre.
===============================================================================
`;
}

/**
 * Generates the official Python script using google-genai SDK
 */
export function generatePythonRunnerContent(masterPrompt: string): string {
  return `"""
Curator - Script Ufficiale di Analisi Batch Gemini (CLI / Senza Browser)
Esegue l'analisi automatica di tutti i file "gemini_lotto_*.json" presenti nella cartella
usando l'API ufficiale di Google Gemini (Gemini 2.5 Pro) con Ricerca Web attiva.

Requisiti:
  pip install google-genai
"""

import os
import glob
import json
import re
import sys
import time

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("=" * 70)
    print("[ERRORE] Libreria google-genai non trovata!")
    print("Installa la libreria ufficiale Google con questo comando:")
    print("   pip install google-genai")
    print("=" * 70)
    sys.exit(1)

MASTER_PROMPT = ${JSON.stringify(masterPrompt)}

def get_api_key():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        print("=" * 70)
        print("   CURATOR - ANALISI BATCH VIA GEMINI API (CLI)")
        print("=" * 70)
        print("Per eseguire l'analisi serve la tua chiave API Google Gemini (gratuita).")
        print("Se non ne hai una, creala in 30 secondi su: https://aistudio.google.com/app/apikey\\n")
        key = input("Incolla qui la tua Gemini API Key e premi Invio: ").strip()
    return key

def clean_json_response(raw_text):
    text = raw_text.strip()
    # Rimuove blocchi markdown \`\`\`json ... \`\`\`
    text = re.sub(r"^\\s*\`\`\`(?:json)?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\`\`\`\\s*$", "", text)
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        # Cerca array JSON dentro la risposta
        m = re.search(r"\\[\\s*\\{[\\s\\S]*\\"username\\"[\\s\\S]*\\}\\s*\\]", text)
        if m:
            return json.loads(m.group(0))
        raise

def main():
    api_key = get_api_key()
    if not api_key:
        print("[ERRORE] Nessuna API Key fornita. Uscita.")
        return

    client = genai.Client(api_key=api_key)

    lotto_files = sorted(
        glob.glob("gemini_lotto_*.json"),
        key=lambda f: int(re.findall(r"\\d+", f)[0]) if re.findall(r"\\d+", f) else 0
    )

    if not lotto_files:
        print("[ERRORE] Nessun file 'gemini_lotto_*.json' trovato nella cartella corrente!")
        return

    print(f"\\n[OK] Trovati {len(lotto_files)} lotti da analizzare.")
    all_results = []

    for idx, filename in enumerate(lotto_files, start=1):
        out_name = f"gemini_risultato_lotto_{idx}.json"
        print(f"\\n[{idx}/{len(lotto_files)}] Elaborazione: {filename}...")

        with open(filename, "r", encoding="utf-8") as f:
            chunk_data = json.load(f)

        prompt_with_data = f"{MASTER_PROMPT}\\n\\nECCO I PROFILI DA ANALIZZARE IN QUESTO LOTTO:\\n" + json.dumps(chunk_data, indent=2, ensure_ascii=False)

        try:
            # Chiamata a Gemini 2.5 Pro con Google Search Grounding attivo
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt_with_data,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )

            result_json = clean_json_response(response.text)
            with open(out_name, "w", encoding="utf-8") as out_f:
                json.dump(result_json, out_f, indent=2, ensure_ascii=False)

            print(f"  -> [COMPLETATO] Salvato {out_name} ({len(result_json)} profili)")
            all_results.extend(result_json)
        except Exception as e:
            print(f"  -> [ERRORE] Impossibile analizzare {filename}: {e}")

        # Breve pausa per evitare rate limit
        time.sleep(2)

    # Salvataggio file unificato
    with open("gemini_risultati_unificati.json", "w", encoding="utf-8") as unif_f:
        json.dump(all_results, unif_f, indent=2, ensure_ascii=False)

    print("\\n" + "=" * 70)
    print(f"[SUCCESSO] Creato file 'gemini_risultati_unificati.json' con {len(all_results)} profili!")
    print("Ora apri Curator nel browser e clicca su 'Importa JSON' per importare tutto!")
    print("=" * 70)

if __name__ == "__main__":
    main()
`;
}

/**
 * Downloads the Windows .bat file
 */
export function downloadBatchLauncherFile() {
  const content = generateBatchScriptContent();
  downloadTextData(content, "avvia_analisi_gemini.bat");
}

/**
 * Downloads the Python runner .py file
 */
export function downloadPythonRunnerFile(masterPrompt: string) {
  const content = generatePythonRunnerContent(masterPrompt);
  downloadTextData(content, "curator_gemini_api.py");
}

/**
 * Downloads the Macro runner .js file
 */
export function downloadMacroRunnerFile(masterPrompt: string) {
  const content = generateMacroRunnerJsContent(masterPrompt);
  downloadTextData(content, "gemini_macro_runner.js");
}

/**
 * Downloads the API runner .js file
 */
export function downloadApiRunnerFile(masterPrompt: string) {
  const content = generateApiRunnerJsContent(masterPrompt);
  downloadTextData(content, "gemini_api_runner.js");
}

/**
 * Downloads the README text file
 */
export function downloadReadmeGuideFile() {
  const content = generateReadmeContent();
  downloadTextData(content, "README_GUIDA_AUTOMAZIONE.txt");
}

/**
 * Downloads the COMPLETE automation kit in sequence:
 * - All batch JSON files (gemini_lotto_1.json, gemini_lotto_2.json, ...)
 * - curator_gemini_api.py
 * - avvia_analisi_gemini.bat
 * - gemini_api_runner.js
 * - README_GUIDA_AUTOMAZIONE.txt
 */
export async function downloadCompleteAutomationBundle(
  chunks: any[][],
  masterPrompt: string,
  onProgress?: (message: string) => void
) {
  const files: Array<{ data: any; filename: string; isText?: boolean }> = [];

  // 1. All batch files
  chunks.forEach((chunk, idx) => {
    files.push({
      data: chunk,
      filename: `gemini_lotto_${idx + 1}_di_${chunks.length}.json`,
      isText: false,
    });
  });

  // 2. Also save master combined package
  files.push({
    data: {
      totaleLotti: chunks.length,
      lotti: chunks,
      prompt: masterPrompt,
    },
    filename: "gemini_tutti_i_lotti_completi.json",
    isText: false,
  });

  // 3. Batch launcher
  files.push({
    data: generateBatchScriptContent(),
    filename: "avvia_analisi_gemini.bat",
    isText: true,
  });

  // 4. Official Python API runner script
  files.push({
    data: generatePythonRunnerContent(masterPrompt),
    filename: "curator_gemini_api.py",
    isText: true,
  });

  // 5. API runner Node script
  files.push({
    data: generateApiRunnerJsContent(masterPrompt),
    filename: "gemini_api_runner.js",
    isText: true,
  });

  // 6. Guide
  files.push({
    data: generateReadmeContent(),
    filename: "README_GUIDA_AUTOMAZIONE.txt",
    isText: true,
  });

  if (onProgress) {
    onProgress(`Scaricamento di ${files.length} file del kit in corso...`);
  }

  await downloadMultipleFilesSequentially(files, 200);

  if (onProgress) {
    onProgress(`Kit di automazione scaricato con successo (${files.length} file)!`);
  }
}
