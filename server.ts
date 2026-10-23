import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { gatherProfileOnlineDossier } from './src/services/freeWebSearch.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gemini Client with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/gemini/status', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.1-flash-lite',
  });
});

// Single profile analysis endpoint with multi-source online research
app.post('/api/gemini/analyze-profile', async (req, res) => {
  const { username, profileUrl, displayName, notes } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // 1. Multi-source free online research (Wikidata, Wikipedia, DuckDuckGo & Website)
  console.log(`[Online Search] Avvio ricerca web per @${username} (${displayName || 'senza nome'})...`);
  const webDossier = await gatherProfileOnlineDossier({
    username,
    displayName,
    profileUrl,
    notes,
  });
  console.log(
    `[Online Search] Ricerca completata per @${username}. Fonti trovate: ${webDossier.sources.join(', ') || 'Nessuna (parziale)'}`
  );

  // 2. Build Comprehensive Master Taxonomy Prompt
  const prompt = `Sei un analista senior ed esperto internazionale di design contemporaneo, branding, architettura, arti visive e manifattura.
Analizza il seguente profilo Instagram:
- Username: ${username}
- URL Profilo: ${profileUrl || `https://instagram.com/${username}`}
- Nome visualizzato noto: ${displayName || 'Non specificato'}
- Note fornite dall'utente: ${notes || 'Nessuna'}

${webDossier.dossierText}

REGOLE CRITICHE CONTRO LE ALLUCINAZIONI:
1. Nella lista NON ci sono solo studi creativi: ci sono aziende manifatturiere (arredo, illuminazione, maniglie, superfici), università, fotografi, illustratori, artisti contemporanei, content creator, amici o persone private.
2. Se un profilo è chiaramente una persona privata, conoscente o amico senza attività professionale pubblica nota, imposta tassativamente "macroEntity": "privato" e "isPrivatePerson": true, lasciando i campi specialistici vuoti ("") o array vuoti ([]). Non inventare agenzie per persone comuni.
3. Se non trovi informazioni certe, preferisci stringa vuota o array vuoto piuttosto che inventare.
4. Se lo stato del reperimento dati è PARZIALE, integra le informazioni con la tua conoscenza analitica ed enciclopedica sul settore, specificando nella descrizione che si tratta di una sintesi basata su dati parziali integrati con conoscenza del modello.

Restituisci SOLO ED ESCLUSIVAMENTE un singolo oggetto JSON valido (nessun testo introduttivo o conclusivo) con questa struttura esatta:
{
  "displayName": "Nome reale completo dello studio, brand, istituzione o professionista",
  "macroEntity": "Uno tra: 'studio' (studi architettura, design, grafica), 'azienda' (brand arredo, luce, manifattura, store), 'universita' (scuole, accademie, musei), 'fotografia' (fotografi architettura/oggetti), 'illustrazione' (illustratori), 'artisti' (scultori, artisti contemporanei), 'creator' (content creator, media, influencer), 'amici' (amico/collega designer noto), 'privato' (persona comune senza studio), 'altro'",
  "category": "Macro categoria descrittiva (es. 'Design Grafico & Branding', 'Architettura & Spazi', 'Design del Prodotto & Industriale', 'Tipografia & Type Design', 'Istituzione / Università', 'Fotografia', 'Arte Contemporanea', 'Persona Privata / Amico')",
  "subType": "Tipologia specifica e precisa. Scegli o adatta dalle tipologie standard:
    - Per studio: 'Studio di Architettura', 'Studio Design di Prodotto', 'Studio Grafica & Branding', 'Studio Interior Design', 'Studio Tipografia / Type Design', 'Studio Motion Design & 3D', 'Atelier Artigianale & Ceramica'
    - Per azienda: 'Brand di Arredo & Mobili', 'Illuminazione & Light Design', 'Manifattura di Maniglie & Ferramenta', 'Superfici, Marmi & Materiali', 'Cucine & Elettrodomestici', 'Bagno & Wellness', 'Store / Concept Store / Retail'
    - Per universita: 'Università / Politecnico', 'Accademia di Belle Arti', 'Scuola Superiore di Design', 'Museo & Centro Ricerca'
    - Per fotografia: 'Fotografia di Architettura & Spazi', 'Fotografia di Prodotto & Still Life', 'Fotografia Editoriale & Moda', 'Fotografia Documentaria & Artistica'
    - Per illustrazione: 'Illustrazione Editoriale & Libri', 'Poster Art & Stampa Serigrafica', 'Digital Painting & Concept Art', 'Pattern Design & Tessile'
    - Per artisti: 'Arte Contemporanea & Scultura', 'Installazioni & Spatial Art', 'Pittura & Arti Visive', 'Ceramica & Pratiche Plastiche'
    - Per privato/amici: 'Persona Privata', 'Freelancer / Designer Indipendente'",
  "isPrivatePerson": false,
  "locationCity": "Città principale (es. Milano, Copenaghen, Londra, Tokyo, Berlino)",
  "locationRegion": "Regione o stato (es. Lombardia, Piemonte, Hovedstaden, Greater London, Baviera)",
  "locationCountry": "Paese in italiano (es. Italia, Danimarca, Regno Unito, Svizzera, Germania)",
  "countryCode": "Codice ISO 2 lettere (es. IT, DK, GB, CH, DE, US, FR)",
  "locationStreet": "Via o indirizzo sede se noto, altrimenti stringa vuota",
  "workMode": "Uno tra: 'in_sede', 'ibrido', 'remoto', 'showroom', 'atelier'",
  "subCategories": [
    // Scegli 2-5 sotto-categorie e stili pertinenti dalla seguente tassonomia curata:
    // STILI DI DESIGN: "Design Minimalista", "Razionalista & Modernista", "Brutalista & Materico", "Pop, Giocoso & Colorato", "Design Critico & Speculativo", "Stile Svizzero / Tipografico", "Organico, Biofilico & Scultoreo", "Hi-Tech & Futurista", "Neo-Craft & Artigianale", "Industriale & Tecnico", "Circolare & Sostenibile", "Razionalismo Storico / Novecento"
    // MOVIMENTI & STILI ARTISTICI: "Futurismo & Dinamismo", "Bauhaus & Costruttivismo", "Postmoderno & Memphis", "Astrattismo Geometrico", "Figurativo Contemporaneo", "Pop Art & Street Art", "Surrealismo & Onirico", "Concettuale & Spaziale", "Raw, Brut & Decostruttivismo", "Informale & Materico"
    // INTERNI & SPAZI: "Interni / Ufficio", "Casa & Living", "Cucina & Food Space", "Bagno & Wellness", "Maniglie & Ferramenta", "Hospitality & Hotel", "Retail & Showroom", "Exhibition & Allestimenti"
    // PRODOTTO & ARREDO: "Sedute & Divani", "Tavoli & Scrivanie", "Illuminazione & Lampade", "Oggetti & Complementi", "Materiali & Superfici", "Ceramica, Vetro & Artigianato"
    // GRAFICA & TYPE: "Brand Identity & Loghi", "Tipografia & Fonderia", "Editoria & Riviste", "Packaging & Packaging Design", "Motion Design & 3D CGI", "Digital, UI/UX & Web"
    // ARTI & FOTO: "Illustrazione Editoriale", "Fotografia di Architettura & Oggetti", "Arte Contemporanea & Scultura", "Set Design & Styling", "Poster Art & Stampa Serigrafica"
    // MUSICA & CULTURA: "Musica, Festival & Clubbing", "Scenografia & Teatri", "Musei & Fondazioni", "Video Production & Clip Musicali", "Media, Radio & Podcast"
  ],
  "visualStyle": "Sintesi di 1 frase dello stile visivo, linguaggio materico ed estetica prevalente (specifica chiaramente se minimale, razionalista, brutale, critico, pop, futurista, bauhaus, industriale, organico, ecc.)",
  "keySpecialties": ["specialità 1", "specialità 2"],
  "designTags": [
    // Includi lo stile di design o artistico prevalente (es. 'Minimalista', 'Razionalista', 'Brutale', 'Pop', 'Critico', 'Futurista', 'Bauhaus', 'Modernista', 'Material Focus', 'Industrial')
    "Graphic Design", "Minimalista"
  ],
  "description": "Sintesi fattuale in 1-2 frasi della storia, produzione o mission del profilo.",
  "website": "URL del sito web ufficiale (se presente)"
}`;

  // Helper function to query Gemini with fallback and automatic retry
  const queryGemini = async (currentAttempt = 1): Promise<any> => {
    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });
      responseText = response.text || '';
    } catch (primaryErr: any) {
      console.warn(
        `[Gemini] gemini-3.1-flash-lite fallito (tentativo ${currentAttempt}), fallback su gemini-flash-latest:`,
        primaryErr?.message
      );
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });
      responseText = fallbackResponse.text || '';
    }

    // Robust JSON extraction: matches outermost { ... } even if surrounding text exists
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      const cleanText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleanText);
    } catch (parseErr: any) {
      if (currentAttempt < 2) {
        console.warn(`[Gemini] Errore parsing JSON al tentativo ${currentAttempt}, nuovo tentativo tra 1.5s...`);
        await new Promise((r) => setTimeout(r, 1500));
        return queryGemini(currentAttempt + 1);
      }
      console.error('Testo grezzo non parsabile restituito da Gemini:', responseText);
      throw new Error(`Risposta AI non valida: ${parseErr.message}`);
    }
  };

  try {
    const parsedData = await queryGemini(1);

    // Map macroEntity to entityKind for backwards compatibility
    const macroEntity = parsedData.macroEntity || 'studio';
    let entityKind: 'studio' | 'azienda' | 'altro' = 'altro';
    if (macroEntity === 'studio') entityKind = 'studio';
    else if (macroEntity === 'azienda') entityKind = 'azienda';

    const aiAnalysis = {
      displayName: parsedData.displayName || username,
      category: parsedData.category || 'Non categorizzato',
      entityKind,
      macroEntity,
      subType: parsedData.subType || '',
      studioType: parsedData.subType || parsedData.category || '',
      locationCity: parsedData.locationCity || '',
      locationRegion: parsedData.locationRegion || '',
      locationCountry: parsedData.locationCountry || '',
      countryCode: parsedData.countryCode || '',
      locationStreet: parsedData.locationStreet || '',
      workMode: parsedData.workMode || 'in_sede',
      isPrivatePerson: !!parsedData.isPrivatePerson,
      subCategories: Array.isArray(parsedData.subCategories) ? parsedData.subCategories : [],
      visualStyle: parsedData.visualStyle || '',
      keySpecialties: Array.isArray(parsedData.keySpecialties) ? parsedData.keySpecialties : [],
      designTags: Array.isArray(parsedData.designTags) ? parsedData.designTags : [],
      description: parsedData.description || '',
      website: parsedData.website || webDossier.discoveredWebsite || '',
      webSources: webDossier.sources,
      isPartialWebData: webDossier.isPartial,
      analyzedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      aiAnalysis,
      webSources: webDossier.sources,
      isPartialWebData: webDossier.isPartial,
    });
  } catch (err: any) {
    console.error('Gemini API Error for username:', username, err);
    const errorMessage = err?.message || String(err);
    const isRateLimit =
      errorMessage.includes('429') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('ResourceExhausted');

    return res.status(isRateLimit ? 429 : 500).json({
      error: 'Gemini API Error',
      isRateLimit,
      message: isRateLimit
        ? 'Quota API temporaneamente satura. Pausa automatica prima del prossimo tentativo.'
        : errorMessage,
    });
  }
});

// Vite Middleware for Development / Static files for Production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Curator Server listening on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
