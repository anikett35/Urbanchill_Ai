"use client";

import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#about", label: "About" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-7 w-7 text-red-500" />
            <Link
              href="#home"
              className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors hover:text-red-500"
            >
              Chill<span className="text-red-500">.</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1 md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-red-500 hover:after:w-full after:transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Get in Touch
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              Start Free
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-6 space-y-4 animate-slide-down">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-medium text-slate-700 dark:text-slate-300 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3 border-t border-slate-200/50 dark:border-slate-800/50">
            <Link
              href="#contact"
              className="text-base font-medium text-slate-700 dark:text-slate-300 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get in Touch
            </Link>
            <Link
              href="/dashboard"
              className="text-base font-medium text-white py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-center shadow-lg shadow-red-500/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}