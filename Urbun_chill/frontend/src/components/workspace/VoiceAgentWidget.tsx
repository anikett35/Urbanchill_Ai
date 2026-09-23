'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Minus,
  Maximize2,
} from 'lucide-react';

import type { CityResult, AnalyzeResult } from '@/lib/globeConfig';
import { fetchVoiceAgentResponse, type VoiceAgentResponse } from '@/lib/apiClient';

interface VoiceAgentWidgetProps {
  city: CityResult;
  analyzeResult: AnalyzeResult | null;
  isOpenExternal?: boolean;
  onToggleExternal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

// ── Lightweight Rich Markdown & Telemetry Formatter ─────────────────────────
function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;

        // Subheaders like ### Title
        if (trimmed.startsWith('### ')) {
          return (
            <div key={lIdx} className="font-bold text-emerald-300 text-xs mt-1 mb-0.5 tracking-wide">
              {renderInlineTokens(trimmed.replace('### ', ''))}
            </div>
          );
        }

        // Bullets: - item or 1. item
        const isBullet = trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);

        return (
          <div
            key={lIdx}
            className={isBullet ? 'pl-2 text-gray-200 flex items-start gap-1.5' : 'text-gray-200'}
          >
            {isBullet && <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>}
            <span>{renderInlineTokens(isBullet ? trimmed.replace(/^[-*]\s+|\d+\.\s+/, '') : trimmed)}</span>
          </div>
        );
      })}
    </div>
  );
}

function renderInlineTokens(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(str.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key++} className="font-bold text-emerald-300">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-black/50 text-cyan-300 font-mono text-[11px] border border-cyan-500/20">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx));
  }
  return parts;
}

export default function VoiceAgentWidget({
  city,
  analyzeResult,
  isOpenExternal,
  onToggleExternal,
}: VoiceAgentWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;
  const setIsOpen = (val: boolean) => {
    setInternalOpen(val);
    if (onToggleExternal && val !== isOpen) onToggleExternal();
  };

  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Analyze Current Heat Risk',
    'How to reduce heat by 2°C?',
    'Show hottest sector',
    'हिंदी में बात करें',
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Synchronize greeting with real-time telemetry when city or analysis loads
  const currentCityName = city.name;
  const currentLstVal = analyzeResult?.lst ?? null;
  const currentRiskVal = analyzeResult?.heatRisk ?? null;

  useEffect(() => {
    const currentLst = currentLstVal !== null ? `${currentLstVal.toFixed(1)}°C` : 'Analyzing...';
    const currentRisk = currentRiskVal ?? 'High';

    const greetingText =
      language === 'hi'
        ? `नमस्ते! मैं आपका **अर्बनचिल एआई जलवायु सलाहकार** हूँ। वर्तमान में **${currentCityName}** का ज़मीनी सतह तापमान **${currentLst}** है और हीट रिस्क **${currentRisk}** है। मैं आपकी क्या सहायता कर सकता हूँ?`
        : `Hello! I am your **UrbanChill AI Climatologist**. Currently, **${currentCityName}**'s Land Surface Temperature is **${currentLst}** with a **${currentRisk}** heat risk profile. How can I assist your urban planning today?`;

    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setSuggestions(
      language === 'hi'
        ? ['हीट रिस्क का विश्लेषण करें', 'गर्मी कैसे कम करें?', 'सबसे गर्म इलाका कौन सा है?', 'सिमुलेशन चलाएं']
        : ['Analyze Current Heat Risk', 'How to reduce heat by 2°C?', 'Show hottest sector', 'Simulate +20% Trees']
    );
  }, [currentCityName, language, currentLstVal, currentRiskVal]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) handleSendMessage(transcript);
        };
        recognition.onerror = (event: any) => {
          console.warn('[UrbanChill Voice] Recognition error:', event.error);
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, [language, city.name, analyzeResult]);

  // Text-To-Speech Speech Synthesis
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (language === 'hi') {
      const hindiVoice = voices.find(
        (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      const engVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      );
      if (engVoice) utterance.voice = engVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Speech recognition start notice:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const cityCtx = {
      city: city.name,
      lat: city.lat,
      lon: city.lon,
      lst: analyzeResult?.lst ?? 24.4,
      ambientTemp: (analyzeResult as any)?.ambientTemp ?? 23.3,
      heatRisk: analyzeResult?.heatRisk ?? 'High',
      ndvi: analyzeResult?.ndvi ?? 0.17,
      humidity: analyzeResult?.humidity ?? 89,
      airQualityIndex: analyzeResult?.airQualityIndex ?? 65,
      topHeatZones: analyzeResult?.topHeatZones ?? [],
      recommendations: analyzeResult?.recommendations ?? [],
    };

    try {
      const data: VoiceAgentResponse = await fetchVoiceAgentResponse(query, cityCtx, language);

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

      if (!isMuted && data.speech) {
        speakText(data.speech);
      }
    } catch (err) {
      console.error('Agent chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageToggle = (newLang: 'en' | 'hi') => {
    setLanguage(newLang);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-20 right-4 sm:right-[335px] xl:right-[355px] z-50 w-[420px] max-w-[calc(100vw-22rem)] h-[560px] max-h-[calc(100vh-7.5rem)] flex flex-col rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs font-bold">
                  <Bot className="w-4 h-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary border border-white dark:border-gray-900" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    {language === 'hi' ? 'अर्बनचिल एआई वॉइस' : 'UrbanChill AI Voice'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {city.name} • {analyzeResult?.lst ? `${analyzeResult.lst.toFixed(1)}°C LST` : 'Live Telemetry'}
                  </p>
                </div>
              </div>

              {/* Action Controls: Language Toggle, Mute, Close */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-xs">
                  <button
                    onClick={() => handleLanguageToggle('en')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                      language === 'en'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => handleLanguageToggle('hi')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                      language === 'hi'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    }
                  }}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isMuted
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-colors"
                  title="Close Window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audio Wave Visualizer Banner */}
            <AnimatePresence>
              {(isSpeaking || isListening) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs text-primary font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span>
                      {isListening
                        ? language === 'hi'
                          ? 'सुन रहे हैं... बोलिए'
                          : 'Listening... speak now'
                        : language === 'hi'
                        ? 'जलवायु सलाहकार बोल रहे हैं...'
                        : 'AI Climatologist speaking...'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 h-3">
                    <span className="w-0.5 h-full bg-primary rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-full bg-primary/80 rounded-full animate-[bounce_0.4s_ease-in-out_infinite_0.1s]" />
                    <span className="w-0.5 h-full bg-primary/60 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.2s]" />
                    <span className="w-0.5 h-full bg-primary rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.3s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conversation Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-gray-800">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'agent' && (
                    <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-xs shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-750 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <FormattedMessageText text={m.text} />
                    <div
                      className={`text-[9px] mt-1.5 ${
                        m.sender === 'user' ? 'text-white/70 text-right' : 'text-gray-400 dark:text-gray-500 text-left'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-750 w-fit">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse delay-300" />
                  </div>
                  <span>
                    {language === 'hi'
                      ? 'जलवायु मॉडल विश्लेषण कर रहा है...'
                      : 'Analyzing spatial climate telemetry...'}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-800/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-gray-750 hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Bar: Mic & Text Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-850 flex items-center gap-2">
              <motion.button
                onClick={handleToggleListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2.5 rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-primary text-white hover:bg-primary-deep'
                }`}
                title={
                  isListening
                    ? language === 'hi'
                      ? 'सुनना बंद करें'
                      : 'Stop Listening'
                    : language === 'hi'
                    ? 'माइक से बोलें'
                    : 'Speak with Voice'
                }
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  language === 'hi'
                    ? 'पूछें (जैसे: पुणे का हीट रिस्क क्या है?)...'
                    : `Ask about ${city.name}'s heat risk or cooling...`
                }
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="button button-solid rounded-xl p-2.5 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
