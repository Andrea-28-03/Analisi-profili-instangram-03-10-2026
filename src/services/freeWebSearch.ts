/**
 * Free Online Web Search & Multi-Source Intelligence for Instagram Profiles
 * Fetches real-time public web information without using billable Google Search Grounding:
 * - Wikidata structured entity ontology (design studio, manufacturer, architect, artist, etc.)
 * - Wikipedia Italian & English encyclopedic articles & press mentions
 * - DuckDuckGo Open Web targeted queries (news, blogs, Dezeen, Domus, Wallpaper, exhibitions)
 * - Official Website metadata & intro paragraph extraction
 */

export interface WebDossierResult {
  dossierText: string;
  sources: string[];
  isPartial: boolean;
  discoveredWebsite?: string;
}

/**
 * Clean text from HTML tags, entities and excessive spaces
 */
function cleanHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper to fetch with timeout via AbortController
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * 1. Search Wikidata for structured design entity classification
 */
async function queryWikidata(searchTerm: string): Promise<{ label: string; description: string; siteLink?: string }[]> {
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      searchTerm
    )}&language=it&format=json&limit=3`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'DesignCuratorTool/1.0 (academic research)' },
    }, 2800);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.search || !Array.isArray(data.search)) return [];

    return data.search.map((item: any) => ({
      label: item.label || '',
      description: item.description || '',
      siteLink: item.concepturi || '',
    }));
  } catch {
    return [];
  }
}

/**
 * 2. Search Wikipedia IT & EN for articles, exhibitions and background
 */
async function queryWikipedia(searchTerm: string, lang = 'it'): Promise<string[]> {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      `${searchTerm} design`
    )}&format=json&limit=3`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'DesignCuratorTool/1.0 (design taxonomy)' },
    }, 2800);
    if (!res.ok) return [];
    const data = await res.json();
    const hits = data?.query?.search;
    if (!Array.isArray(hits)) return [];

    return hits.map((hit: any) => `${hit.title}: ${cleanHtml(hit.snippet)}`);
  } catch {
    return [];
  }
}

/**
 * 3. Search DuckDuckGo Open HTML with targeted design & stylistic keywords
 */
async function queryDuckDuckGoSnippets(query: string): Promise<string[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    }, 3200);

    if (!res.ok) return [];
    const html = await res.text();
    const snippets = [...html.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g)]
      .slice(0, 4)
      .map((m) => cleanHtml(m[1]))
      .filter((text) => text.length > 20);

    return snippets;
  } catch {
    return [];
  }
}

/**
 * 4. Try extracting summary text from an official website
 */
async function fetchWebsiteSummary(websiteUrl: string): Promise<{ title?: string; description?: string; aboutText?: string } | null> {
  try {
    let target = websiteUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }

    const res = await fetchWithTimeout(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    }, 3000);

    if (!res.ok) return null;
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? cleanHtml(titleMatch[1]) : undefined;

    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const description = descMatch ? cleanHtml(descMatch[1]) : undefined;

    // Grab first clean paragraphs from about section if available
    const bodyText = cleanHtml(html.substring(0, 8000));
    let aboutSnippet = '';
    const aboutIdx = bodyText.search(/(about\s+us|chi\s+siamo|studio|philosophy|practice|who\s+we\s+are)/i);
    if (aboutIdx !== -1) {
      aboutSnippet = bodyText.substring(aboutIdx, aboutIdx + 400).trim();
    }

    return {
      title,
      description,
      aboutText: aboutSnippet || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Master multi-source web intelligence gatherer
 */
export async function gatherProfileOnlineDossier(profile: {
  username: string;
  displayName?: string;
  notes?: string;
  profileUrl?: string;
}): Promise<WebDossierResult> {
  const cleanUsername = profile.username.replace(/[@]/g, '').trim();
  const searchName = profile.displayName?.trim() || cleanUsername;
  const sources: string[] = [];
  const webSnippets: string[] = [];

  // Parallel multi-stream research
  const [wikidataResults, wikipediaIt, wikipediaEn, ddgStudioSnippets, ddgStyleSnippets] =
    await Promise.allSettled([
      queryWikidata(searchName),
      queryWikipedia(searchName, 'it'),
      queryWikipedia(searchName, 'en'),
      // Targeted query 1: Typology, Entity & Studio/Azienda/Manifattura identification
      queryDuckDuckGoSnippets(`"${searchName}" (studio OR design OR architettura OR azienda OR brand OR manifattura)`),
      // Targeted query 2: Style, Aesthetic language, Movements & Press mentions
      queryDuckDuckGoSnippets(`"${searchName}" (minimalista OR razionalista OR brutalista OR futurismo OR bauhaus OR pop OR critico OR dezeen OR domus OR wallpaper)`),
    ]);

  let wikidataText = '';
  if (wikidataResults.status === 'fulfilled' && wikidataResults.value.length > 0) {
    const valid = wikidataResults.value.filter((w) => w.description);
    if (valid.length > 0) {
      wikidataText = valid.map((w) => `${w.label} (${w.description})`).join('; ');
      sources.push('Wikidata Entity Ontology');
    }
  }

  const wikiSnippets: string[] = [];
  if (wikipediaIt.status === 'fulfilled' && wikipediaIt.value.length > 0) {
    wikiSnippets.push(...wikipediaIt.value);
    sources.push('Wikipedia (Italiano)');
  }
  if (wikipediaEn.status === 'fulfilled' && wikipediaEn.value.length > 0) {
    wikiSnippets.push(...wikipediaEn.value);
    sources.push('Wikipedia (Inglese)');
  }

  if (ddgStudioSnippets.status === 'fulfilled' && ddgStudioSnippets.value.length > 0) {
    webSnippets.push(...ddgStudioSnippets.value);
    sources.push('Ricerca Web Design & Tipologia');
  }

  if (ddgStyleSnippets.status === 'fulfilled' && ddgStyleSnippets.value.length > 0) {
    webSnippets.push(...ddgStyleSnippets.value);
    sources.push('Rassegna Stampa & Stili (Domus, Dezeen, Wallpaper)');
  }

  // Check if a website URL is mentioned in notes or snippets
  let discoveredWebsite: string | undefined = undefined;
  const urlInNotes = profile.notes?.match(/https?:\/\/[^\s]+/i)?.[0];
  if (urlInNotes) discoveredWebsite = urlInNotes;

  // Website homepage inspection
  let websiteSummaryText = '';
  if (discoveredWebsite) {
    const siteData = await fetchWebsiteSummary(discoveredWebsite);
    if (siteData) {
      sources.push(`Sito Ufficiale (${discoveredWebsite})`);
      websiteSummaryText = [
        siteData.title ? `Titolo: ${siteData.title}` : '',
        siteData.description ? `Descrizione: ${siteData.description}` : '',
        siteData.aboutText ? `Estratto About: ${siteData.aboutText}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
    }
  }

  const isPartial = sources.length === 0;

  // Assemble formatted dossier text
  const sections: string[] = [];
  sections.push('=== DOSSIER WEB IN TEMPO REALE RACCOLTO DAL SERVER ===');
  sections.push(`- Profilo analizzato: @${cleanUsername} (${searchName})`);

  if (wikidataText) {
    sections.push(`- Classificazione ontologica (Wikidata): ${wikidataText}`);
  }

  if (wikiSnippets.length > 0) {
    sections.push(`- Voci enciclopediche & pubblicazioni (Wikipedia):\n  * ${wikiSnippets.join('\n  * ')}`);
  }

  if (webSnippets.length > 0) {
    // Deduplicate snippets
    const uniqueSnippets = Array.from(new Set(webSnippets)).slice(0, 5);
    sections.push(`- Rassegna web, notizie & stili (Open Web, Riviste & Blog):\n  * ${uniqueSnippets.join('\n  * ')}`);
  }

  if (websiteSummaryText) {
    sections.push(`- Sito Web Ufficiale (${discoveredWebsite}): ${websiteSummaryText}`);
  }

  if (isPartial) {
    sections.push(
      '- Stato reperimento dati: PARZIALE (Nessuna fonte esterna aperta ha risposto entro il timeout; integra con la tua conoscenza analitica ed enciclopedica su design e architettura segnalando stima approssimativa).'
    );
  } else {
    sections.push(`- Fonti web verificate in tempo reale: ${sources.join(', ')}`);
  }
  sections.push('======================================================');

  return {
    dossierText: sections.join('\n'),
    sources,
    isPartial,
    discoveredWebsite,
  };
}
