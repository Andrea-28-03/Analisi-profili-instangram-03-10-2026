# Piano di Implementazione: Redesign Ricerca, Tassonomia a Cascata & Modifica Analisi

## 1. Obiettivo dell'Aggiornamento
Evolvere il catalogo e taccuino "Sketchbook & Crayon Naif" introducendo:
1. **Modifica manuale e completa dell'analisi AI**: possibilità di editare ogni singolo campo (nome, categoria, bio, stile, luogo, tags, modalità di lavoro, ecc.) con **suggeritore intelligente di tag** che attinge a tutti i tag già registrati nell'applicazione e supporta la creazione istantanea di nuovi tag.
2. **Nuova architettura della barra di ricerca e filtri (In alto)**:
   - Input di ricerca per nome (`Ricerca per nome`, studio, brand, username).
   - Tasti macro: `Tutti`, `Studi`, `Aziende`, `Università`, `Fotografia`, `Illustrazione`, `Artisti`, `Content Creator`, `Amici Designer` + tasto dedicato autonomo **`No privati`** (che esclude persone fisiche e amici).
   - Tendina di stato: `Tutti`, `Analizzati`, `In attesa`, `Preferiti`.
   - Filtro geografico con selettore rapido **`Città` / `Regione`** per esplorare per capoluogo o regione.
   - Filtro spazi e modalità di lavoro (`In sede`, `Ibrido`, `Da remoto`, `Showroom`, `Laboratorio / Atelier`).
3. **Sezione inferiore (Sotto tutto) - Tassonomia a Cascata Multi-Selezione**:
   - Selezione cumulativa (cliccando più filtri non si deselezionano gli altri ma si sommano in logica additiva).
   - Mega-categorie espandibili con sotto-categorie a più livelli (es. `Interni & Spazi` → `Casa` → `Cucina` → `Maniglie` / `Ufficio`; `Design di Prodotto`; `Branding & Grafica` → `Packaging`, `Editoriale`, `Tipografia`; `Musica & Spettacolo`...).
   - Adattamento dinamico in base a Studi vs Aziende.
   - Possibilità di aggiungere al volo nuove categorie e tag personalizzati direttamente dai filtri.
4. **Aggiornamento del prompt batch per Gemini**:
   - Modifica del prompt esportato da `ExportGeminiModal` per riflettere la nuova tassonomia, estrarre le sotto-categorie gerarchiche, la regione, gli spazi di lavoro e la tipologia di entità.

---

## 2. Modello Dati (`src/types.ts`)
Estensione delle interfacce:
- `EntityKind`: `'all' | 'studio' | 'azienda' | 'universita' | 'fotografia' | 'illustrazione' | 'artista' | 'content_creator' | 'amico_designer' | 'altro'`
- `WorkSpaceMode`: `'in_sede' | 'ibrido' | 'remoto' | 'showroom' | 'laboratorio'`
- Campi in `AIStudioAnalysis`:
  - `isPrivate?: boolean` (flag per persone fisiche / amici)
  - `locationRegion?: string` (Regione es. Lombardia, Piemonte, Lazio, Veneto...)
  - `locationCity?: string`
  - `workSpaceModes?: string[]`
  - `megaCategory?: string` (es. "Interni & Spazi", "Design di Prodotto", "Grafica & Comunicazione", "Musica & Audio")
  - `subCategories?: string[]` (array di percorsi o sotto-categorie es. `["Casa", "Cucina", "Maniglie"]`)
  - `designTags?: string[]` & `keySpecialties?: string[]`

---

## 3. Componenti da Sviluppare & Modificare

### A. Componente `TagAutocompleteInput` (`src/components/TagAutocompleteInput.tsx`)
- Input intelligente con popup doodle che visualizza i tag esistenti nel dataset filtrati in tempo reale durante la digitazione.
- Navigazione da tastiera (frecce, Invio o Tab per confermare).
- Pill doodle colorate rimovibili con icona a penna o 'x'.
- Possibilità di inserire istantaneamente un nuovo tag personalizzato.

### B. Modale Scheda Profilo Editabile (`src/components/StudioDetailModal.tsx`)
- Tasto di commutazione rapida per modificare direttamente ogni sezione della scheda:
  - Nome visualizzato, Username, Sito web, Instagram URL.
  - Tipologia Macro (`Studi`, `Aziende`, `Università`, `Artisti`, ecc.) e flag privato/pubblico.
  - Città, Regione, Paese, Indirizzo.
  - Modalità di lavoro e tipologia di spazi (badge cliccabili).
  - Stile visivo e sintesi descrittiva.
  - Tag delle sotto-categorie e specialità (tramite `TagAutocompleteInput` con suggerimenti intelligenti).
- Feedback di salvataggio immediato in `localStorage` e aggiornamento globale.

### C. Redesign Barra Superiore & Filtri a Cascata (`src/components/CategoryFilter.tsx`)
1. **Riga Superiore (Top Bar)**:
   - Input `Ricerca per nome...`
   - Pills delle macro entità (`Tutti`, `Studi`, `Aziende`, `Università`, `Fotografia`, `Illustrazione`, `Artisti`, `Content Creator`, `Amici Designer`).
   - Tasto separato evidenziato **`No privati`** con badge stile sketch (attivo/disattivo con colore rosso/arancio doodle).
   - Dropdown di stato: `Tutti`, `Analizzati`, `In attesa`, `Preferiti`.
   - Selettore Geografico con mini-toggle `[ Città | Regione ]` e menu a tendina dinamico associato.
   - Filtro "Spazi e Modalità" (In sede, Ibrido, Remoto, Showroom, Laboratorio).
   - Tasti di selezione vista (Tabella, Schede, Mappa, Rete, Statistiche).
2. **Sezione Inferiore (Sotto tutto - Tassonomia a Cascata Multi-Selezione)**:
   - Roster di mega-categorie selezionabili in multi-selezione cumulativa (l'attivazione di una non disattiva le altre).
   - Espansione ad albero / sotto-categorie contestuali (es. `Interni` → `Casa`, `Cucina`, `Maniglie`, `Ufficio`...).
   - Tasto doodle rapido `+ Aggiungi Categoria / Tag` per creare istantaneamente nuovi tag/filtri.
   - Riepilogo filtri attivi con conteggio dinamico e pulsante "Azzera tutti i filtri".

### D. Aggiornamento Prompt Batch Gemini (`src/components/ExportGeminiModal.tsx`)
- Riscrivere `generatePromptText()` con le istruzioni dettagliate per Gemini offline batch:
  - Estrazione gerarchica (`megaCategory`, `subCategories`).
  - Riconoscimento della natura (`studio`, `azienda`, `universita`, `fotografia`, `illustrazione`, `artista`, `content_creator`, `amico_designer`).
  - Flag booleano `isPrivate` (se amico o persona privata).
  - Estrazione `locationRegion`, `locationCity`, `workSpaceModes`.
  - Linee guida anti-allucinazione aggiornate.

### E. Adattamento Dataset Iniziale & Logica Filtri (`src/App.tsx` & `src/data/initialStudios.ts`)
- Arricchimento dei profili iniziali con regioni (Lombardia, Veneto, Piemonte, Lazio, ecc.), mega-categorie e sotto-categorie (es. Zanotta con `Interni > Casa > Living`, Alessi con `Product Design > Cucina`, Studio Volpi con `Design Industriale > Elettronica`).
- Aggiornamento della logica di filtraggio combinato in `App.tsx` per gestire le selezioni cumulative (multi-select additivo).

---

## 4. Verifica e Collaudo
- Verifica compilazione con `compile_applet` e linting con `lint_applet`.
- Test della ricerca per nome e username.
- Test del toggle `No privati` e della commutazione geografica Città / Regione.
- Test della selezione cumulativa delle sotto-categorie a cascata.
- Test dell'editing manuale dell'analisi e dell'autocomplete dei tag nel modal dettaglio.
- Test del prompt batch generato per Gemini.
