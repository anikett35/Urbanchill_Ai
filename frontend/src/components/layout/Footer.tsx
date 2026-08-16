"use client";

import Link from "next/link";
import { Globe, MessageSquare, Link as LinkIcon, Code, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "API Docs", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "#contact" },
    ],
    resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Webinars", href: "/webinars" },
      { label: "Case Studies", href: "/case-studies" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Security", href: "/security" },
    ],
  };

  const socialLinks = [
    { icon: MessageSquare, href: "https://twitter.com", label: "Twitter" },
    { icon: LinkIcon, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Code, href: "https://github.com", label: "GitHub" },
    { icon: Mail, href: "mailto:hello@chill.app", label: "Email" },
  ];

  const contactInfo = [
    { icon: MapPin, label: "San Francisco, CA", href: "#" },
    { icon: Phone, label: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: Mail, label: "hello@chill.app", href: "mailto:hello@chill.app" },
  ];

  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Chill<span className="text-red-500">.</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-xs">
              Empowering cities with intelligent thermal analytics to create cooler, more livable urban environments.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info Row */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((contact) => (
              <div key={contact.label} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-red-500">
                  <contact.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{contact.label}</p>
                  <a
                    href={contact.href}
                    className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  >
                    {contact.label === "San Francisco, CA" ? "Visit us" : "Contact"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} Chill. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Made with</span>
            <span className="text-red-500" aria-hidden="true">&hearts;</span>
            <span>for cooler cities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}