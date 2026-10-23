# Piano di Implementazione Revisionato: Ricerca Online Multi-Query & Master Prompt Tassonomia

Questo piano aggiornato recepisce interamente il feedback dell'utente:
1. **Ricerca Online Mirata con termini di Tassonomia**: La ricerca web gratuita non cerca solo genericamente il nome, ma esegue query mirate per scoprire lo stile (minimalista, razionalista, pop, critico, futurista...), la natura dell'entità (azienda manifatturiera, studio di architettura, brand di arredo, università, fotografo, artista), le pubblicazioni di settore (Domus, Dezeen, Fuorisalone, Wallpaper) e la sede.
2. **Master Prompt Completo**: Il prompt per Gemini riprende integralmente tutti i criteri, regole anti-allucinazione e l'intera tassonomia curata definita nel prompt master dei lotti, garantendo che ogni profilo riceva tutti i campi e le classificazioni approfondite.

---

## 1. Architettura della Ricerca Web Multi-Query Gratuita (Server-Side)

Creeremo un modulo autonomo `src/services/freeWebSearch.ts` (eseguito dal server Express) che estrae informazioni online prima di interrogare Gemini:

### A. Estrazione Bio & Dati Pubblici Instagram
- Richiesta HTTP con intestazioni browser standard a `https://www.instagram.com/${username}/`.
- Estrazione dei metadati OpenGraph (`og:description`, `og:title`, tag `description`) per ottenere bio pubblica, follower, post e categoria Instagram dichiarata.

### B. Query di Ricerca Mirate su Motore Aperto (DuckDuckGo Open HTML / News & Blogs)
Per raccogliere il massimo numero di elementi utili alla tassonomia, il server esegue ricerche mirate:
- **Query 1 (Identità & Tipologia Entità)**:
  `"${cleanName || username}" ("studio" OR "design" OR "architettura" OR "azienda" OR "brand" OR "manifattura" OR "university")`
  -> Permette di distinguere subito se si tratta di studio creativo, azienda di mobili/luci/maniglie, università, fotografo o artista.
- **Query 2 (Stile, Linguaggio & Rassegna Stampa)**:
  `"${cleanName || username}" ("minimalista" OR "razionalista" OR "brutalista" OR "futurismo" OR "bauhaus" OR "pop" OR "critico" OR "dezeen" OR "domus" OR "wallpaper")`
  -> Rintraccia articoli, mostre, interviste, menzioni su blog e riviste di settore e linguaggi estetici.

### C. Scraping Istantaneo del Sito Ufficiale
- Se viene trovato un link a un sito ufficiale (nella bio o nei risultati di ricerca):
  - Viene scaricata la homepage con timeout breve (3.5 secondi).
  - Vengono estratti `<title>`, `<meta name="description">`, intestazioni `<h1>`/`<h2>` e il testo dei paragrafi "About / Chi siamo / Philosophy".

### D. Gestione Timeout & Integrazione Dati Parziali
- Timeout perimetrato con `AbortController` (3.5s per richiesta, max 6s complessivi per la ricerca).
- Se una fonte web non risponde o è protetta, il server **non fallisce**: assembla tutti i dati parziali recuperati, imposta `isPartialWebData: true` e aggiunge l'indicazione:
  *"Dati web parziali integrati con conoscenza enciclopedica"* nel report e nella descrizione del profilo.

---

## 2. Master Prompt Tassonomico Completo per Gemini

I dati web raccolti confluiscono nel prompt strutturato per `gemini-3.1-flash-lite`, contenente **tutti gli elementi e le regole del prompt originale**:

```text
Sei un analista senior ed esperto internazionale di design contemporaneo, branding, architettura, arti visive e manifattura.
Analizza il seguente profilo Instagram:
- Username: {username}
- URL Profilo: {profileUrl}
- Nome noto: {displayName}
- Note fornite: {notes}

=== DATI RACCOLTI DAL WEB IN TEMPO REALE ===
- Bio & Dati Instagram: {instagramBio}
- Risultati ricerca web, blog & notizie: {webSnippets}
- Contenuto sito ufficiale: {websiteText}
- Stato raccolta web: {Complete | Partial}
===========================================

REGOLE CRITICHE CONTRO LE ALLUCINAZIONI:
1. Nella lista NON ci sono solo studi creativi: ci sono aziende manifatturiere (arredo, illuminazione, maniglie, superfici), università, fotografi, illustratori, artisti contemporanei, content creator, amici o persone private.
2. Se un profilo è chiaramente una persona privata, conoscente o amico senza attività professionale pubblica nota, imposta tassativamente "macroEntity": "privato" e "isPrivatePerson": true, lasciando i campi specialistici vuoti ("") o array vuoti ([]). Non inventare agenzie per persone comuni.
3. Se non trovi informazioni certe, preferisci stringa vuota o array vuoto piuttosto che inventare.
4. Se i dati web raccolti sono parziali, segnala nella descrizione che l'analisi integra dati web parziali con la conoscenza analitica.

Restituisci SOLO ED ESCLUSIVAMENTE un singolo oggetto JSON valido con questa struttura esatta:
{
  "displayName": "Nome reale completo dello studio, brand, istituzione o professionista",
  "macroEntity": "Uno tra: 'studio', 'azienda', 'universita', 'fotografia', 'illustrazione', 'artisti', 'creator', 'amici', 'privato', 'altro'",
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
}
```

---

## 3. Aggiornamenti dell'Interfaccia Utente

1. **AutoAnalysisQueueModal**:
   - Visualizzazione dei passaggi in tempo reale:
     - 🔍 *Ricerca online: bio pubblica, notizie e sito ufficiale...*
     - 🤖 *Classificazione stili & tassonomia con Gemini...*
   - Nel log viene evidenziato se la ricerca web ha trovato articoli o il sito ufficiale.
2. **Dettaglio Profilo (StudioDetailModal) & Schede (StudioCard)**:
   - Se l'analisi include fonti web o è stata eseguita con integrazione parziale, viene mostrato un badge informativo (es. *"Dati arricchiti dal web live"* o *"Dati web parziali + AI"*).
   - Viene visualizzato e reso cliccabile il sito web scoperto online.

---

## 4. Fasi di Sviluppo e Verifica

1. **Implementazione di `src/services/freeWebSearch.ts`**:
   - Funzioni `fetchInstagramPublicMeta(username)`
   - Funzione `searchWebForDesignProfile(nameOrUsername)` con query mirate su tipologie e stili
   - Funzione `fetchOfficialWebsiteSnippet(url)`
   - Funzione aggregatrice `gatherProfileOnlineDossier(profile)` con timeout resiliente.
2. **Aggiornamento di `server.ts`**:
   - Integrazione di `gatherProfileOnlineDossier` prima della chiamata a Gemini.
   - Sostituzione del prompt con il Master Prompt Tassonomico completo.
   - Mappatura precisa dei risultati e ritorno di `isPartialWebData` e `webSources`.
3. **Collaudo dal vivo con profili reali**:
   - Verifica di uno studio di design (es. studio grafico/architettura).
   - Verifica di un'azienda di arredamento/illuminazione.
   - Verifica di un fotografo/illustratore.
   - Verifica di una persona privata.
4. **Verifica build**:
   - `compile_applet` e `lint_applet` con zero errori.
