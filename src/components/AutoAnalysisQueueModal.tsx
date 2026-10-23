import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sliders,
  X,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { InstagramProfile, AIStudioAnalysis } from '../types';
import { analyzeProfileOnline } from '../services/geminiOnlineService';

interface AutoAnalysisQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: InstagramProfile[];
  onUpdateProfileAnalysis: (profileId: string, aiAnalysis: AIStudioAnalysis) => void;
  isDark?: boolean;
}

interface LogEntry {
  id: string;
  username: string;
  status: 'analyzing' | 'success' | 'error' | 'rate_limit';
  message: string;
  subType?: string;
  location?: string;
  visualStyle?: string;
  sources?: string[];
  isPartial?: boolean;
  time: string;
}

export const AutoAnalysisQueueModal: React.FC<AutoAnalysisQueueModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onUpdateProfileAnalysis,
  isDark = false,
}) => {
  const [scope, setScope] = useState<'pending' | 'all'>('pending');
  const [delaySeconds, setDelaySeconds] = useState<number>(4);
  const [status, setStatus] = useState<
    'idle' | 'running' | 'paused' | 'cooling_down' | 'completed' | 'stopped'
  >('idle');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentStepMessage, setCurrentStepMessage] = useState<string>('');
  const [delayCountdown, setDelayCountdown] = useState<number>(0);
  const [cooldownCountdown, setCooldownCountdown] = useState<number>(0);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [failedProfiles, setFailedProfiles] = useState<InstagramProfile[]>([]);

  // Refs to manage async queue loop reliably without stale state closures
  const isRunningRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const queueProfilesRef = useRef<InstagramProfile[]>([]);
  const currentIndexRef = useRef<number>(0);

  // Compute targeted profiles list
  const pendingProfiles = profiles.filter((p) => !p.isAnalyzed);
  const targetProfiles = scope === 'pending' ? pendingProfiles : profiles;

  // Auto-scroll log feed
  const logContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Keep queue reference updated
  useEffect(() => {
    if (status === 'idle') {
      queueProfilesRef.current = targetProfiles;
      setCurrentIndex(0);
      currentIndexRef.current = 0;
    }
  }, [profiles, scope, status]);

  if (!isOpen) return null;

  const totalToProcess = targetProfiles.length;
  const progressPercent =
    totalToProcess > 0
      ? Math.min(100, Math.round((currentIndex / totalToProcess) * 100))
      : 0;

  // Estimated remaining time in minutes
  const remainingProfiles = Math.max(0, totalToProcess - currentIndex);
  const estimatedSeconds = remainingProfiles * (delaySeconds + 3);
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

  const currentProfile = targetProfiles[currentIndex];

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleStartQueue = async (overrideProfiles?: InstagramProfile[]) => {
    const listToProcess = Array.isArray(overrideProfiles)
      ? overrideProfiles
      : queueProfilesRef.current.length > 0 && status === 'paused'
      ? queueProfilesRef.current
      : targetProfiles;
    if (listToProcess.length === 0) return;

    isRunningRef.current = true;
    isPausedRef.current = false;
    queueProfilesRef.current = listToProcess;
    setStatus('running');

    let idx = currentIndexRef.current;

    while (idx < queueProfilesRef.current.length && isRunningRef.current) {
      if (isPausedRef.current) {
        setStatus('paused');
        break;
      }

      const p = queueProfilesRef.current[idx];
      setCurrentIndex(idx);
      currentIndexRef.current = idx;

      // 1. Log analysis start
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentStepMessage(`Ricerca web online & analisi tassonomica per @${p.username}...`);

      setLogs((prev) => [
        ...prev,
        {
          id: `${p.id}-${Date.now()}`,
          username: p.username,
          status: 'analyzing',
          message: 'Ricerca online in corso (Wikidata, Wikipedia, blog, notizie) e classificazione AI...',
          time: timeStr,
        },
      ]);

      // 2. Call API
      const result = await analyzeProfileOnline({
        username: p.username,
        profileUrl: p.profileUrl,
        displayName: p.displayName || p.aiAnalysis?.displayName,
        notes: p.notes,
      });

      // Check if paused or stopped during call
      if (!isRunningRef.current) break;

      if (result.isRateLimit) {
        // Rate limit 429: Enter cooldown mode for 25 seconds
        setStatus('cooling_down');
        setCurrentStepMessage('Limite di frequenza 429: raffreddamento automatico attivo');
        setLogs((prev) => [
          ...prev,
          {
            id: `cooldown-${Date.now()}`,
            username: p.username,
            status: 'rate_limit',
            message: 'Quota momentaneamente esaurita (429). Attesa 25 secondi prima di riprovare...',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);

        for (let cd = 25; cd > 0; cd--) {
          if (!isRunningRef.current || isPausedRef.current) break;
          setCooldownCountdown(cd);
          await sleep(1000);
        }
        setCooldownCountdown(0);

        if (!isRunningRef.current) break;
        if (isPausedRef.current) {
          setStatus('paused');
          break;
        }

        // Retry the same index without advancing
        setStatus('running');
        continue;
      }

      if (result.success && result.aiAnalysis) {
        // Success: update profile immediately
        onUpdateProfileAnalysis(p.id, result.aiAnalysis);
        setSuccessCount((prev) => prev + 1);
        setFailedProfiles((prev) => prev.filter((item) => item.id !== p.id));

        setLogs((prev) => [
          ...prev.filter((l) => !(l.username === p.username && l.status === 'analyzing')),
          {
            id: `success-${p.id}-${Date.now()}`,
            username: p.username,
            status: 'success',
            message: `${result.aiAnalysis?.displayName || p.username} analizzato con successo`,
            subType: result.aiAnalysis?.subType || result.aiAnalysis?.category,
            location: result.aiAnalysis?.locationCity,
            visualStyle: result.aiAnalysis?.visualStyle,
            sources: result.webSources,
            isPartial: result.isPartialWebData,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);
      } else {
        // Non-rate-limit error
        setErrorCount((prev) => prev + 1);
        setFailedProfiles((prev) => [...prev.filter((item) => item.id !== p.id), p]);
        setLogs((prev) => [
          ...prev.filter((l) => !(l.username === p.username && l.status === 'analyzing')),
          {
            id: `err-${p.id}-${Date.now()}`,
            username: p.username,
            status: 'error',
            message: result.error || 'Errore durante l\'analisi del profilo',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);
      }

      idx++;
      currentIndexRef.current = idx;
      setCurrentIndex(idx);

      // Smart delay between profiles if more profiles remain
      if (idx < queueProfilesRef.current.length && isRunningRef.current && !isPausedRef.current) {
        for (let cd = delaySeconds; cd > 0; cd--) {
          if (!isRunningRef.current || isPausedRef.current) break;
          setDelayCountdown(cd);
          setCurrentStepMessage(`Pausa quota (${cd}s) prima del prossimo profilo...`);
          await sleep(1000);
        }
        setDelayCountdown(0);
      }
    }

    if (idx >= queueProfilesRef.current.length && isRunningRef.current) {
      setStatus('completed');
      setCurrentStepMessage('Analisi di tutti i profili completata!');
      isRunningRef.current = false;
    }
  };

  const handlePauseQueue = () => {
    isPausedRef.current = true;
    setStatus('paused');
    setCurrentStepMessage('Analisi messa in pausa. Clicca "Riprendi" per continuare.');
  };

  const handleResumeQueue = () => {
    isPausedRef.current = false;
    handleStartQueue();
  };

  const handleStopQueue = () => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    setStatus('stopped');
    setDelayCountdown(0);
    setCooldownCountdown(0);
    setCurrentStepMessage('Analisi interrotta dall\'utente.');
  };

  const handleRetryFailed = () => {
    if (failedProfiles.length === 0) return;
    const toRetry = [...failedProfiles];
    setFailedProfiles([]);
    setErrorCount(0);
    queueProfilesRef.current = toRetry;
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    handleStartQueue(toRetry);
  };

  const handleResetQueue = () => {
    handleStopQueue();
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setStatus('idle');
    setLogs([]);
    setSuccessCount(0);
    setErrorCount(0);
    setFailedProfiles([]);
    setCurrentStepMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div
        className={`w-full max-w-2xl rounded-2xl border-2 shadow-doodle flex flex-col max-h-[90vh] overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#181716] border-[#44403C] text-[#F7F4EB]'
            : 'bg-[#FFFDF7] border-[#1C1A17] text-[#1C1A17]'
        }`}
      >
        {/* Header with Washi Tape Look */}
        <div className="relative px-5 py-4 border-b-2 border-current/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border-2 shadow-xs ${
                isDark
                  ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B]'
                  : 'bg-[#FFD13B] text-[#1C1A17] border-[#1C1A17]'
              }`}
            >
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-hand font-bold text-lg sm:text-xl leading-tight">
                  Analisi Online con Google AI Studio
                </h3>
                <span className="font-typewriter text-[10px] px-2 py-0.5 rounded-full border border-[#FFBE0B] bg-[#FFBE0B]/20 font-bold text-[#FF8500]">
                  Free Tier API
                </span>
              </div>
              <p className="text-xs opacity-70 font-sans">
                Analizza profilo per profilo con Gemini 3.8 Flash & Google Search in tempo reale
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (status === 'running') handlePauseQueue();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-current/20 hover:border-current transition cursor-pointer"
            title="Chiudi finestra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar (Scope & Delay) */}
        <div
          className={`px-5 py-3 border-b border-current/10 flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-[#22201D]' : 'bg-[#FAF7F0]'
          }`}
        >
          {/* Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="font-hand font-bold opacity-75">Profili da analizzare:</span>
            <div className="inline-flex rounded-lg border border-current/20 p-0.5">
              <button
                type="button"
                disabled={status === 'running' || status === 'cooling_down'}
                onClick={() => {
                  setScope('pending');
                  setCurrentIndex(0);
                  currentIndexRef.current = 0;
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-hand font-bold transition cursor-pointer ${
                  scope === 'pending'
                    ? isDark
                      ? 'bg-[#FFD13B] text-[#181716]'
                      : 'bg-[#1C1A17] text-white'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Solo da analizzare ({pendingProfiles.length})
              </button>
              <button
                type="button"
                disabled={status === 'running' || status === 'cooling_down'}
                onClick={() => {
                  setScope('all');
                  setCurrentIndex(0);
                  currentIndexRef.current = 0;
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-hand font-bold transition cursor-pointer ${
                  scope === 'all'
                    ? isDark
                      ? 'bg-[#FFD13B] text-[#181716]'
                      : 'bg-[#1C1A17] text-white'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Tutti i profili ({profiles.length})
              </button>
            </div>
          </div>

          {/* Delay / Rate Limit Controller */}
          <div className="flex items-center gap-2">
            <span className="font-hand font-bold opacity-75 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF8500]" />
              <span>Intervallo quota:</span>
            </span>
            <select
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
              disabled={status === 'running'}
              className={`px-2 py-1 rounded-md border font-typewriter text-xs ${
                isDark
                  ? 'bg-[#181716] text-[#F7F4EB] border-[#44403C]'
                  : 'bg-white text-[#1C1A17] border-[#1C1A17]/30'
              }`}
            >
              <option value={3}>3 secondi (Veloce)</option>
              <option value={4}>4 secondi (Consigliato)</option>
              <option value={5}>5 secondi (Prudente)</option>
              <option value={6}>6 secondi (Sicuro)</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Progress Bar & Numerical Counter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-typewriter">
              <span className="font-bold">
                Avanzamento: {currentIndex} / {totalToProcess} profili ({progressPercent}%)
              </span>
              <span className="opacity-70">
                {status === 'running' && remainingProfiles > 0
                  ? `~${estimatedMinutes} min rimanenti`
                  : status === 'completed'
                  ? 'Completato'
                  : 'In attesa'}
              </span>
            </div>

            {/* Custom doodle progress track */}
            <div
              className={`w-full h-3.5 rounded-full border-2 overflow-hidden p-0.5 ${
                isDark ? 'border-[#44403C] bg-[#22201D]' : 'border-[#1C1A17] bg-[#FAF7F0]'
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-300 ease-out bg-[#FFBE0B]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Active Profile Card / Status Banner */}
          <div
            className={`p-3.5 rounded-xl border-2 transition ${
              status === 'cooling_down'
                ? 'border-[#FF8500] bg-[#FF8500]/10'
                : status === 'running'
                ? 'border-[#FFD13B] bg-[#FFD13B]/10 animate-pulse'
                : status === 'completed'
                ? 'border-[#38B000] bg-[#38B000]/10'
                : isDark
                ? 'border-[#44403C] bg-[#22201D]'
                : 'border-[#1C1A17]/20 bg-[#FAF7F0]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-typewriter uppercase tracking-wider opacity-60">
                    {status === 'running'
                      ? 'In elaborazione adesso:'
                      : status === 'cooling_down'
                      ? 'Pausa raffreddamento quota:'
                      : status === 'paused'
                      ? 'Coda in pausa:'
                      : status === 'completed'
                      ? 'Risultato finale:'
                      : 'Prossimo profilo:'}
                  </span>
                  {status === 'cooling_down' && (
                    <span className="font-typewriter text-xs font-bold text-[#FF8500] px-2 py-0.5 rounded-md bg-[#FF8500]/20">
                      Ripresa tra {cooldownCountdown}s
                    </span>
                  )}
                  {status === 'running' && delayCountdown > 0 && (
                    <span className="font-typewriter text-xs font-bold text-[#FFBE0B] px-2 py-0.5 rounded-md bg-[#FFBE0B]/20">
                      Pausa di {delayCountdown}s...
                    </span>
                  )}
                </div>

                {currentProfile ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-hand font-bold text-base truncate">
                      @{currentProfile.username}
                    </span>
                    {currentProfile.profileUrl && (
                      <a
                        href={currentProfile.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-50 hover:opacity-100 transition inline-flex items-center"
                        title="Apri profilo Instagram"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="font-hand font-bold text-base text-gray-500 mt-1">
                    Nessun profilo da elaborare
                  </div>
                )}

                {currentStepMessage && (
                  <p className="text-xs font-sans opacity-75 mt-0.5">
                    {currentStepMessage}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-hand font-bold border ${
                    status === 'running'
                      ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B]'
                      : status === 'paused'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : status === 'cooling_down'
                      ? 'bg-orange-100 text-orange-900 border-orange-400'
                      : status === 'completed'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {status === 'running' && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
                  {status === 'paused' && <Pause className="w-3.5 h-3.5" />}
                  {status === 'cooling_down' && <Clock className="w-3.5 h-3.5" />}
                  {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-hand font-bold">
              <span>Registro attività in tempo reale ({logs.length})</span>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="opacity-50 hover:opacity-100 underline text-[11px] cursor-pointer"
                >
                  Svuota registro
                </button>
              )}
            </div>

            <div
              ref={logContainerRef}
              className={`h-48 overflow-y-auto rounded-xl border-2 p-2.5 space-y-1.5 font-typewriter text-xs transition ${
                isDark ? 'border-[#44403C] bg-[#121110]' : 'border-[#1C1A17]/20 bg-[#F4F1EA]'
              }`}
            >
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center opacity-50 font-hand text-sm">
                  Le attività e i risultati di Gemini compariranno qui man mano che ogni profilo viene analizzato.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded-lg border flex items-start justify-between gap-2 text-[11px] leading-relaxed ${
                      log.status === 'success'
                        ? isDark
                          ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : log.status === 'error'
                        ? isDark
                          ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                          : 'border-rose-300 bg-rose-50 text-rose-900'
                        : log.status === 'rate_limit'
                        ? isDark
                          ? 'border-orange-500/30 bg-orange-950/20 text-orange-300'
                          : 'border-orange-300 bg-orange-50 text-orange-900'
                        : isDark
                        ? 'border-white/10 bg-white/5'
                        : 'border-black/10 bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold">@{log.username}</span>
                        {log.subType && (
                          <span className="opacity-75 font-hand font-bold">
                            · {log.subType}
                          </span>
                        )}
                        {log.location && (
                          <span className="opacity-75">
                            📍 {log.location}
                          </span>
                        )}
                      </div>
                      <p className="opacity-80 text-[10px] mt-0.5 truncate">{log.message}</p>
                      {log.visualStyle && (
                        <p className="italic opacity-70 text-[9px] mt-0.5 truncate">
                          "{log.visualStyle}"
                        </p>
                      )}
                      {log.sources && log.sources.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap text-[9px] opacity-80 font-typewriter">
                          <span className="font-bold">🌐 Fonti web:</span>
                          <span className="truncate max-w-[340px]">{log.sources.join(' · ')}</span>
                        </div>
                      )}
                      {log.isPartial && (
                        <p className="text-[9px] mt-0.5 opacity-65 font-typewriter italic">
                          ℹ️ Dati web parziali integrati con conoscenza del modello
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 opacity-50 text-[9px]">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer with Controls and Counters */}
        <div
          className={`px-5 py-3.5 border-t-2 border-current/15 flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-[#22201D]' : 'bg-[#FAF7F0]'
          }`}
        >
          {/* Stats Counters */}
          <div className="flex items-center gap-3 text-xs font-typewriter">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successCount} ok</span>
            </span>
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorCount} errori</span>
              </span>
            )}
            <span className="opacity-60">
              Rimanenti: {remainingProfiles}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {failedProfiles.length > 0 && status !== 'running' && (
              <button
                type="button"
                onClick={handleRetryFailed}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-hand font-bold text-xs border-2 border-amber-500 bg-amber-500 text-black hover:scale-102 transition cursor-pointer shadow-doodle-sm"
                title="Rilancia l'analisi automatica solo per i profili che hanno riscontrato un errore"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Riprova {failedProfiles.length} con errore</span>
              </button>
            )}

            {status === 'idle' && (
              <button
                type="button"
                disabled={targetProfiles.length === 0}
                onClick={() => handleStartQueue()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-hand font-bold text-sm border-2 shadow-doodle-sm transition cursor-pointer ${
                  targetProfiles.length === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : isDark
                    ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B] hover:scale-102'
                    : 'bg-[#1C1A17] text-white border-[#1C1A17] hover:scale-102'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Avvia Analisi Online ({totalToProcess})</span>
              </button>
            )}

            {status === 'running' && (
              <>
                <button
                  type="button"
                  onClick={handlePauseQueue}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-hand font-bold text-sm border-2 border-amber-500 bg-amber-500 text-black hover:scale-102 transition cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausa</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopQueue}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-hand font-bold text-sm border-2 border-rose-500 bg-rose-500 text-white hover:scale-102 transition cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Interrompi</span>
                </button>
              </>
            )}

            {status === 'paused' && (
              <>
                <button
                  type="button"
                  onClick={handleResumeQueue}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-hand font-bold text-sm border-2 border-emerald-500 bg-emerald-500 text-white hover:scale-102 transition cursor-pointer shadow-doodle-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Riprendi</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopQueue}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-hand font-bold text-sm border-2 border-current/20 hover:border-current transition cursor-pointer"
                >
                  <Square className="w-4 h-4" />
                  <span>Interrompi</span>
                </button>
              </>
            )}

            {status === 'cooling_down' && (
              <button
                type="button"
                onClick={handleStopQueue}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-hand font-bold text-sm border-2 border-rose-500 bg-rose-500 text-white hover:scale-102 transition cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Interrompi</span>
              </button>
            )}

            {(status === 'completed' || status === 'stopped') && (
              <>
                <button
                  type="button"
                  onClick={handleResetQueue}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-hand font-bold text-sm border-2 border-current/20 hover:border-current transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ricomincia</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-hand font-bold text-sm border-2 transition cursor-pointer ${
                    isDark
                      ? 'bg-[#FFD13B] text-[#181716] border-[#FFD13B]'
                      : 'bg-[#1C1A17] text-white border-[#1C1A17]'
                  }`}
                >
                  <span>Fatto / Chiudi</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
