'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Check, Palette, Sparkles, Sliders } from 'lucide-react';
import { useTheme } from '@/lib/themeContext';

interface EcmeThemeConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EcmeThemeConfigurator({
  isOpen,
  onClose,
}: EcmeThemeConfiguratorProps) {
  const { mode, setMode } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-Over Drawer Container (Ecme Theme Style) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="
              fixed inset-y-0 right-0 z-50 w-full sm:w-96
              bg-white dark:bg-gray-800
              border-l border-gray-200 dark:border-gray-700
              text-gray-900 dark:text-gray-100
              shadow-2xl flex flex-col justify-between overflow-hidden
            "
            aria-label="Theme Configurator"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-base tracking-tight">Theme Config</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title="Close Configurator"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Configuration Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Option 1: Light & Dark Theme Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dark Mode</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Switch theme to dark or light mode</p>
                  </div>
                  {/* Segmented Switcher */}
                  <button
                    onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                    className={`
                      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                      transition-colors duration-200 ease-in-out focus:outline-none
                      ${mode === 'dark' ? 'bg-primary' : 'bg-gray-200'}
                    `}
                    role="switch"
                    aria-checked={mode === 'dark'}
                  >
                    <span
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0
                        transition duration-200 ease-in-out
                        ${mode === 'dark' ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>

                {/* Visual Mode Selector Cards */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => setMode('light')}
                    className={`
                      flex flex-col items-center gap-2.5 p-3.5 rounded-xl border text-xs font-semibold
                      transition-all cursor-pointer
                      ${
                        mode === 'light'
                          ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 font-bold'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750/30 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200/60 shadow-xs">
                      <Sun className="w-4 h-4" />
                    </div>
                    <span>Light Mode</span>
                    {mode === 'light' && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">Active</span>}
                  </button>

                  <button
                    onClick={() => setMode('dark')}
                    className={`
                      flex flex-col items-center gap-2.5 p-3.5 rounded-xl border text-xs font-semibold
                      transition-all cursor-pointer
                      ${
                        mode === 'dark'
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750/30 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-900 text-primary flex items-center justify-center border border-gray-700 shadow-xs">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span>Dark Mode</span>
                    {mode === 'dark' && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">Active</span>}
                  </button>
                </div>
              </div>

              {/* Option 2: Primary Accent Color Palette */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700/80">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    Primary Palette
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ecme Official Blue Design Tokens</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750/30 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-gray-800 dark:text-gray-200">Ecme Blue</span>
                      <span className="text-[10px] font-mono text-gray-400">#2a85ff (Default)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Standard</span>
                </div>
              </div>

              {/* Option 3: System Status & Design System Compliance */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700/80">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Design Architecture
                </h4>
                <div className="space-y-2 text-xs font-mono text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-750/20 border border-gray-100 dark:border-gray-700/50">
                    <span>Layout:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">Collapsible SideNav</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-750/20 border border-gray-100 dark:border-gray-700/50">
                    <span>Token System:</span>
                    <span className="text-primary font-bold">Ecme Standard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 flex items-center gap-2.5">
              <button
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                className="button button-solid flex-1 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                {mode === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>Toggle to {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
