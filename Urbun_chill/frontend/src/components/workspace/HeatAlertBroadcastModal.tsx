'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  PhoneCall,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  ShieldAlert,
  X,
  Share2,
  Volume2,
  FileText,
  Languages,
} from 'lucide-react';
import type { CityResult, HeatRisk } from '@/lib/globeConfig';

interface HeatAlertBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  city?: CityResult | { name: string; displayName?: string };
  cityName?: string;
  currentTemp?: number;
  heatRisk?: HeatRisk;
  sectorName?: string;
}

export default function HeatAlertBroadcastModal({
  isOpen,
  onClose,
  city,
  cityName,
  currentTemp = 42.5,
  heatRisk = 'Critical',
  sectorName,
}: HeatAlertBroadcastModalProps) {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'voice'>('whatsapp');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const effectiveName = cityName || city?.name || 'Urban Sector';
  const effectiveDisplayName = city?.displayName || effectiveName;
  const targetArea = sectorName ? `${sectorName} (${effectiveName})` : effectiveDisplayName;
  const tempStr = `${currentTemp.toFixed(1)}°C`;

  // English Advisory Templates
  const englishWhatsApp = `🚨 *URGENT MUNICIPAL HEAT ADVISORY* 🚨
📍 *Area:* ${targetArea}
🌡️ *Ground Surface Heat:* ${tempStr}
⚠️ *Heat Risk Level:* ${heatRisk.toUpperCase()} ALERT

*MUNICIPAL HEALTH DIRECTIVES:*
1. 💧 Maintain constant hydration with ORS/water.
2. ☀️ AVOID direct sun exposure between 12:00 PM – 4:00 PM.
3. 🏢 Designated Cool Roofs & Hydration Centers are active across ward centers.
4. 👵 Check on vulnerable elderly residents, children, and outdoor workers.

Issued by UrbanChill AI Smart City Climate Twin.
Stay Safe & Cool!`;

  const englishSms = `[ALERT] Extreme Heat in ${sectorName || effectiveName}: ${tempStr} (${heatRisk}). Avoid sun 12-4PM, drink water. Cool shelters active at Ward Centers. -UrbanChill`;

  const englishVoice = `Attention resident of ${sectorName || effectiveName}. UrbanChill climate sensors have detected extreme ground heat of ${tempStr} in your sector. Please drink water, avoid direct sun between 12 to 4 PM, and visit designated cool roof centers if needed. Stay safe.`;

  // Hindi / Regional Advisory Templates
  const hindiWhatsApp = `🚨 *आपत्कालीन नागरी उष्णता चेतावणी* 🚨
📍 *परिसर:* ${targetArea}
🌡️ *जमिनीचे तापमान:* ${tempStr}
⚠️ *उष्णता धोका:* ${heatRisk === 'Critical' ? 'गंभीर' : 'जास्त'} उष्णता लाट

*नागरी आरोग्य सूचना:*
१. 💧 भरपूर पाणी, लिंबू पाणी किंवा ओआरएस प्या.
२. ☀️ दुपारी १२ ते ४ दरम्यान थेट उन्हात जाणे टाळा.
३. 🏢 प्रभाग स्तरावर सावली केंद्र आणि मोफत पिण्याचे पाणी केंद्रे सुरू आहेत.
४. 👵 ज्येष्ठ नागरिक आणि लहान मुलांची विशेष काळजी घ्या.

अर्बनचिल एआय स्मार्ट सिटी ट्विन द्वारे प्रसारित.
सुरक्षित राहा!`;

  const hindiSms = `[चेतावणी] ${sectorName || effectiveName} मध्ये उष्णता लाट: ${tempStr}. दुपारी १२-४ उन्हात जाऊ नका, पाणी प्या. प्रभाग सावली केंद्रे सुरू. -अर्बनचिल`;

  const hindiVoice = `सावधान नागरिक, आपल्या ${sectorName || effectiveName} भागात जमिनीचे तापमान ${tempStr} वर पोहोचले आहे. कृपया भरपूर पाणी प्या, दुपारी १२ ते ४ दरम्यान उन्हात जाणे टाळा, आणि महापालिकेच्या सावली केंद्रांचा लाभ घ्या.`;

  const currentWhatsApp = language === 'en' ? englishWhatsApp : hindiWhatsApp;
  const currentSms = language === 'en' ? englishSms : hindiSms;
  const currentVoice = language === 'en' ? englishVoice : hindiVoice;

  // Handle WhatsApp Open
  const handleSendWhatsApp = () => {
    let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentWhatsApp)}`;
    if (phoneNumber.trim()) {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(currentWhatsApp)}`;
    }
    window.open(url, '_blank');
  };

  // Handle Copy to Clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate Broadcast Dispatch
  const handleSimulateDispatch = () => {
    setIsDispatched(true);
    setTimeout(() => setIsDispatched(false), 3500);
  };

  return (
    <div className="dialog-overlay z-50">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden text-left">
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className="card-header card-header-border bg-gray-50/80 dark:bg-gray-850/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-error/15 text-error flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-error" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Heatwave Alert & Citizen Broadcast
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-error/15 text-error border border-error/30">
                  {heatRisk} Risk • {tempStr}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Broadcast official safety circulars directly to WhatsApp, SMS, and Voice channels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Target Area Banner & Language Selector ──────────────────── */}
        <div className="px-5 py-3 bg-gray-100/60 dark:bg-gray-750/40 border-b border-gray-200 dark:border-gray-700/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 truncate">
            <Flame className="w-4 h-4 text-error shrink-0" />
            <span>Target Zone:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{targetArea}</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
            <Languages className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'en' ? 'bg-primary text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'hi' ? 'bg-primary text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300'
              }`}
            >
              मराठी / हिंदी
            </button>
          </div>
        </div>

        {/* ── Channel Selector Tabs ───────────────────────────────────── */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-750/70 border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                activeChannel === 'whatsapp'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Advisory</span>
            </button>

            <button
              onClick={() => setActiveChannel('sms')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                activeChannel === 'sms'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Cellular SMS Broadcast</span>
            </button>

            <button
              onClick={() => setActiveChannel('voice')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                activeChannel === 'voice'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Automated Voice Call</span>
            </button>
          </div>

          {/* ── Channel 1: WhatsApp Advisory ──────────────────────────── */}
          {activeChannel === 'whatsapp' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  Instant WhatsApp Dispatch
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Pre-fills a complete heatwave safety circular formatted with bullet points and emergency directives.
                </div>
              </div>

              {/* Message Preview Box */}
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Circular Message Preview
                </label>
                <textarea
                  readOnly
                  value={currentWhatsApp}
                  rows={9}
                  className="w-full p-3 text-xs font-mono rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 outline-none leading-relaxed resize-none select-all"
                />
                <button
                  onClick={() => handleCopyText(currentWhatsApp)}
                  className="absolute top-7 right-2.5 p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary transition-colors cursor-pointer shadow-xs"
                  title="Copy message text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Optional Phone Input & Direct WhatsApp Button */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <div className="flex-1 w-full relative">
                  <input
                    type="tel"
                    placeholder="Enter phone number with country code (optional, e.g. 919876543210)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input text-xs py-2 px-3 rounded-xl w-full"
                  />
                </div>

                <button
                  onClick={handleSendWhatsApp}
                  className="w-full sm:w-auto button bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Channel 2: Cellular SMS Broadcast ─────────────────────── */}
          {activeChannel === 'sms' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 text-xs space-y-1">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Cellular Broadcast Service (CBS / SMS)
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Concise telecommunication alert tailored under 160 characters for mass citizen delivery across the sector.
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    SMS Character Length: {currentSms.length} / 160
                  </label>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">Standard 1-SMS Limit</span>
                </div>
                <div className="p-3 text-xs font-mono rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 leading-relaxed">
                  {currentSms}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => handleCopyText(currentSms)}
                  className="button button-default rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy SMS Script'}</span>
                </button>

                <button
                  onClick={handleSimulateDispatch}
                  disabled={isDispatched}
                  className="button button-solid rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isDispatched ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Broadcast Sent to Sector Cell Towers!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Simulate Ward SMS Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Channel 3: Automated Voice Call Script ─────────────────── */}
          {activeChannel === 'voice' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  Automated Municipal Voice Broadcast (IVR)
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Pre-recorded automated voice call script for disaster sirens and ward tele-announcements.
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Audio Script Reading
                </label>
                <div className="p-3 text-xs font-serif italic rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 leading-relaxed">
                  "{currentVoice}"
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => handleCopyText(currentVoice)}
                  className="button button-default rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Audio Script</span>
                </button>

                <button
                  onClick={handleSimulateDispatch}
                  disabled={isDispatched}
                  className="button bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isDispatched ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>IVR Call Queue Dispatched!</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Initiate Automated Ward Calls</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────── */}
        <div className="card-footer card-footer-border bg-gray-50/50 dark:bg-gray-850/50 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Emergency Broadcast Network Ready</span>
          </div>

          <button
            onClick={onClose}
            className="button button-plain rounded-xl px-3 py-1.5 font-semibold text-xs cursor-pointer text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
