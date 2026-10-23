import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  ChevronDown,
  FileText,
  X,
  SkipBack,
  SkipForward,
  Loader2,
} from 'lucide-react';

// ─── Utilidades ────────────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const VOICES_ES = ['es-', 'spanish', 'español'];

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  if (lang === 'es') {
    const esVoice = voices.find(v =>
      VOICES_ES.some(k => v.lang.toLowerCase().includes(k) || v.name.toLowerCase().includes(k))
    );
    return esVoice || voices[0] || null;
  }
  const enVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  return enVoice || voices[0] || null;
}

// ─── Extractor PDF con pdfjs-dist desde CDN ────────────────────────────────────

async function extractTextFromPDF(file: File): Promise<string> {
  // Cargamos pdfjs dinámicamente para no añadir bundle weight
  const pdfjsLib = await import(
    /* @vite-ignore */
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs'
  ) as any;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText.trim();
}

// ─── Componente principal ───────────────────────────────────────────────────────

export default function TextReaderTool() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [muted, setMuted] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [sentences, setSentences] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentenceIndexRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Cargar voces
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        const best = pickVoice(v, lang);
        if (best) setSelectedVoice(best.name);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [lang]);

  // Actualizar voz seleccionada al cambiar idioma
  useEffect(() => {
    const best = pickVoice(voices, lang);
    if (best) setSelectedVoice(best.name);
  }, [lang, voices]);

  // Dividir texto en oraciones para lectura progresiva
  const prepareText = useCallback((raw: string) => {
    const clean = stripMarkdown(raw);
    const parts = clean.match(/[^.!?\n]+[.!?\n]+/g) || [clean];
    setSentences(parts.map(s => s.trim()).filter(Boolean));
    return parts;
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setHighlightIndex(-1);
    sentenceIndexRef.current = 0;
  }, []);

  const speakFrom = useCallback((parts: string[], startIndex: number) => {
    window.speechSynthesis.cancel();
    sentenceIndexRef.current = startIndex;

    const speakNext = (idx: number) => {
      if (idx >= parts.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        setHighlightIndex(-1);
        return;
      }
      const utt = new SpeechSynthesisUtterance(parts[idx]);
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utt.voice = voice;
      utt.lang = lang === 'es' ? 'es-CO' : 'en-US';
      utt.rate = rate;
      utt.pitch = pitch;
      utt.volume = muted ? 0 : volume;

      utt.onstart = () => {
        setHighlightIndex(idx);
        setProgress(Math.round((idx / parts.length) * 100));
        setTimeout(() => {
          highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      };

      utt.onend = () => {
        sentenceIndexRef.current = idx + 1;
        speakNext(idx + 1);
      };

      utt.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    };

    speakNext(startIndex);
    setIsPlaying(true);
    setIsPaused(false);
  }, [voices, selectedVoice, lang, rate, pitch, volume, muted]);

  const play = useCallback(() => {
    if (!text.trim()) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }
    const parts = prepareText(text);
    speakFrom(parts, 0);
  }, [text, isPaused, prepareText, speakFrom]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const skipBackward = () => {
    const idx = Math.max(0, sentenceIndexRef.current - 2);
    speakFrom(sentences, idx);
  };

  const skipForward = () => {
    const idx = Math.min(sentences.length - 1, sentenceIndexRef.current + 1);
    speakFrom(sentences, idx);
  };

  // Leer archivo de texto plano
  const handleTextFile = (file: File) => {
    setFileName(file.name);
    setPdfError('');
    stop();
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setText(content);
      prepareText(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Leer PDF
  const handlePdfFile = async (file: File) => {
    setFileName(file.name);
    setPdfError('');
    setPdfLoading(true);
    stop();
    try {
      const extracted = await extractTextFromPDF(file);
      if (!extracted.trim()) {
        setPdfError('El PDF no contiene texto seleccionable (puede ser una imagen escaneada).');
      } else {
        setText(extracted);
        prepareText(extracted);
      }
    } catch (err) {
      console.error(err);
      setPdfError('No se pudo leer el PDF. Asegúrate de que no esté protegido con contraseña.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      handlePdfFile(file);
    } else {
      handleTextFile(file);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so el mismo archivo puede subirse de nuevo
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearAll = () => {
    stop();
    setText('');
    setFileName('');
    setSentences([]);
    setProgress(0);
    setPdfError('');
  };

  const filteredVoices = voices.filter(v =>
    lang === 'es'
      ? VOICES_ES.some(k => v.lang.toLowerCase().includes(k) || v.name.toLowerCase().includes(k))
      : v.lang.toLowerCase().startsWith('en')
  );

  const displayVoices = filteredVoices.length > 0 ? filteredVoices : voices;

  return (
    <div className="min-h-screen bg-[#040817] text-[#f4f7ff] font-sans p-4 sm:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-3xl mb-8 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7fa8ff] rounded-full border border-[#7fa8ff]/15 bg-[#3e7bff]/5 px-4 py-2 mb-4">
          <Volume2 className="w-3.5 h-3.5" />
          Lector de Texto
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase leading-tight tracking-tight">
          Text<span className="text-[#3e7bff]" style={{ textShadow: '0 0 28px rgba(62,123,255,0.55)' }}>Reader</span>
        </h1>
        <p className="text-[#7fa8ff]/70 text-sm mt-2">Sube un archivo o pega tu texto. Te lo leeré en voz alta.</p>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        {/* Zona de carga */}
        <div
          className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer
            ${dragOver ? 'border-[#3e7bff] bg-[#3e7bff]/10' : 'border-[#7fa8ff]/20 bg-[#0d1630]/60 hover:border-[#3e7bff]/50'}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
            {pdfLoading ? (
              <>
                <Loader2 className="w-6 h-6 text-[#3e7bff] animate-spin" />
                <p className="text-sm font-semibold text-[#7fa8ff]">Extrayendo texto del PDF…</p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[#3e7bff]" />
                <p className="text-sm font-semibold text-[#7fa8ff]">
                  {fileName ? fileName : 'Arrastra o haz clic para subir'}
                </p>
                <p className="text-xs text-[#7fa8ff]/40">.pdf · .md · .txt · .doc compatible</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md,.txt,.doc,.docx,.text"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Error PDF */}
        {pdfError && (
          <div className="flex items-start gap-2 bg-[#ff4f4f]/10 border border-[#ff4f4f]/30 rounded-xl px-4 py-3 text-xs text-[#ff8f8f]">
            <FileText className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{pdfError}</span>
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); prepareText(e.target.value); stop(); }}
            placeholder="O pega aquí tu texto directamente..."
            rows={6}
            className="w-full bg-[#0d1630]/80 border border-[#7fa8ff]/15 rounded-2xl p-4 text-sm text-[#f4f7ff] placeholder-[#7fa8ff]/30 resize-none focus:outline-none focus:border-[#3e7bff]/60 transition-colors"
          />
          {text && (
            <button
              onClick={clearAll}
              className="absolute top-3 right-3 text-[#7fa8ff]/40 hover:text-[#f4f7ff] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Preview de oraciones con highlight */}
        {sentences.length > 0 && (
          <div className="bg-[#0d1630]/60 border border-[#7fa8ff]/10 rounded-2xl p-4 max-h-48 overflow-y-auto text-sm leading-relaxed">
            {sentences.map((s, i) => (
              <span
                key={i}
                ref={i === highlightIndex ? (highlightRef as React.RefObject<HTMLSpanElement>) : undefined}
                className={`transition-colors duration-200 ${
                  i === highlightIndex
                    ? 'bg-[#3e7bff]/25 text-[#f4f7ff] rounded px-0.5'
                    : 'text-[#7fa8ff]/50'
                }`}
              >
                {s}{' '}
              </span>
            ))}
          </div>
        )}

        {/* Barra de progreso */}
        {(isPlaying || isPaused || progress > 0) && (
          <div className="w-full bg-[#7fa8ff]/10 rounded-full h-1.5">
            <div
              className="bg-[#3e7bff] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Controles de reproducción */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={skipBackward}
            disabled={!isPlaying && !isPaused}
            className="p-2.5 rounded-full border border-[#7fa8ff]/20 text-[#7fa8ff] hover:border-[#3e7bff]/50 hover:text-[#3e7bff] disabled:opacity-30 transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {!isPlaying ? (
            <button
              onClick={play}
              disabled={!text.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white disabled:opacity-40 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #3e7bff, #2e5fe0)', boxShadow: '0 0 20px rgba(62,123,255,0.3)' }}
            >
              <Play className="w-4 h-4" />
              {isPaused ? 'Continuar' : 'Leer'}
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #3e7bff, #2e5fe0)' }}
            >
              <Pause className="w-4 h-4" />
              Pausar
            </button>
          )}

          <button
            onClick={stop}
            disabled={!isPlaying && !isPaused}
            className="p-2.5 rounded-full border border-[#7fa8ff]/20 text-[#7fa8ff] hover:border-[#ff4f4f]/50 hover:text-[#ff4f4f] disabled:opacity-30 transition-all"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={skipForward}
            disabled={!isPlaying && !isPaused}
            className="p-2.5 rounded-full border border-[#7fa8ff]/20 text-[#7fa8ff] hover:border-[#3e7bff]/50 hover:text-[#3e7bff] disabled:opacity-30 transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 rounded-full border border-[#7fa8ff]/20 text-[#7fa8ff] hover:border-[#3e7bff]/50 transition-all"
          >
            {muted ? <VolumeX className="w-4 h-4 text-[#ff4f4f]" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Ajustes */}
        <div className="bg-[#0d1630]/60 border border-[#7fa8ff]/10 rounded-2xl p-4 space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7fa8ff]/50">Ajustes de voz</p>

          {/* Idioma */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7fa8ff]/60 w-20 shrink-0">Idioma</span>
            <div className="flex gap-2">
              {(['es', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    lang === l
                      ? 'bg-[#3e7bff] text-white'
                      : 'border border-[#7fa8ff]/20 text-[#7fa8ff]/60 hover:border-[#3e7bff]/50'
                  }`}
                >
                  {l === 'es' ? '🇨🇴 Español' : '🇺🇸 English'}
                </button>
              ))}
            </div>
          </div>

          {/* Voz */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7fa8ff]/60 w-20 shrink-0">Voz</span>
            <div className="relative flex-1">
              <button
                onClick={() => setShowVoiceSelect(!showVoiceSelect)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#040817] border border-[#7fa8ff]/15 rounded-xl text-xs text-[#f4f7ff] hover:border-[#3e7bff]/40 transition-colors"
              >
                <span className="truncate">{selectedVoice || 'Auto'}</span>
                <ChevronDown className="w-3 h-3 shrink-0 text-[#7fa8ff]/40" />
              </button>
              {showVoiceSelect && (
                <div className="absolute z-10 mt-1 w-full bg-[#0d1630] border border-[#7fa8ff]/15 rounded-xl overflow-hidden shadow-xl max-h-40 overflow-y-auto">
                  {displayVoices.map(v => (
                    <button
                      key={v.name}
                      onClick={() => { setSelectedVoice(v.name); setShowVoiceSelect(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#3e7bff]/10 transition-colors ${
                        selectedVoice === v.name ? 'text-[#3e7bff] font-bold' : 'text-[#7fa8ff]/70'
                      }`}
                    >
                      {v.name} <span className="text-[#7fa8ff]/30">({v.lang})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Velocidad */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7fa8ff]/60 w-20 shrink-0">Velocidad</span>
            <input
              type="range" min="0.5" max="2" step="0.1" value={rate}
              onChange={e => setRate(parseFloat(e.target.value))}
              className="flex-1 accent-[#3e7bff]"
            />
            <span className="text-xs text-[#7fa8ff]/50 w-8 text-right">{rate.toFixed(1)}x</span>
          </div>

          {/* Volumen */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7fa8ff]/60 w-20 shrink-0">Volumen</span>
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-[#3e7bff]"
            />
            <span className="text-xs text-[#7fa8ff]/50 w-8 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-[10px] text-[#7fa8ff]/20 text-center">
        Usa la API de Web Speech del navegador · Funciona sin servidor
      </p>
    </div>
  );
}
