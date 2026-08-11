'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Chrome, Github, Menu, X, Sparkles } from 'lucide-react';

const chromeStoreUrl = 'https://chromewebstore.google.com/detail/linksave/ojikdodfhnpohghabhaebmkglmpagenm';
const githubUrl = 'https://github.com/Dheerajjha451/LinkSave';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Try Sandbox', href: '#sandbox' },
  { name: 'Workflow', href: '#workflow' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      className="navbar-wrapper"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="navbar">
        <a href="#" className="navbar__brand" aria-label="LinkSave Home">
          <Image
            src="/linksave-icon.svg"
            alt="LinkSave logo"
            width={24}
            height={24}
            className="navbar__logo"
          />
          <span>LinkSave</span>
        </a>

        {/* Desktop Nav Links */}
        <div className="navbar__desktop-links">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="navbar__nav-link">
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="navbar__actions navbar__actions--desktop">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn--secondary"
            style={{ height: '36px', padding: '0 14px', fontSize: '13px' }}
          >
            <Github size={15} />
            <span>GitHub</span>
          </a>
          <a
            href={chromeStoreUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn--primary"
            style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
          >
            <Chrome size={15} />
            <span>Install</span>
            <ArrowUpRight className="btn--icon-arrow" size={14} />
          </a>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="navbar__hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="navbar__mobile-drawer"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="navbar__mobile-links">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="navbar__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{link.name}</span>
                </a>
              ))}
            </div>

            <div className="navbar__mobile-actions">
              <a
                href={chromeStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn--primary"
                style={{ width: '100%', height: '42px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Chrome size={16} />
                <span>Install for Chrome</span>
                <ArrowUpRight size={15} />
              </a>

              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn--secondary"
                style={{ width: '100%', height: '42px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Github size={16} />
                <span>Contribute on GitHub</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
