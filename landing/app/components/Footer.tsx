'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Chrome, Github, ArrowUp } from 'lucide-react';

const chromeStoreUrl = 'https://chromewebstore.google.com/detail/linksave/ojikdodfhnpohghabhaebmkglmpagenm';
const githubUrl = 'https://github.com/Dheerajjha451/LinkSave';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Bottom Call To Action Banner */}
      <section className="section-wrapper" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-glass)',
            background: 'linear-gradient(180deg, rgba(24, 24, 28, 0.8), rgba(9, 9, 11, 0.95))',
            padding: '64px 32px',
            textAlign: 'center',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: 'var(--text-primary)',
            }}
          >
            Start remembering what you <span className="font-serif-italic">save</span>.
          </h2>
          <p
            style={{
              maxWidth: '520px',
              margin: '0 auto 36px',
              color: 'var(--text-secondary)',
              fontSize: '17px',
              lineHeight: 1.6,
            }}
          >
            Free, lightweight, and open source. Available now on Google Chrome Web Store.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              href={chromeStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary"
              style={{ height: '48px', padding: '0 24px' }}
            >
              <Chrome size={18} />
              <span>Add to Chrome — It&apos;s Free</span>
              <ArrowUpRight className="btn--icon-arrow" size={16} />
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--secondary"
              style={{ height: '48px', padding: '0 20px' }}
            >
              <Github size={18} />
              <span>Star on GitHub</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer Navigation */}
      <footer className="footer">
        <div className="footer__brand">
          <Image src="/linksave-icon.svg" alt="LinkSave" width={22} height={22} />
          <span>LinkSave</span>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
            © {new Date().getFullYear()} Dheeraj Jha
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', flexWrap: 'wrap' }}>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s ease' }}
          >
            GitHub
          </a>
          <a
            href={chromeStoreUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s ease' }}
          >
            Chrome Web Store
          </a>
          <Link
            href="/privacy"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s ease', textDecoration: 'none' }}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s ease', textDecoration: 'none' }}
          >
            Terms of Service
          </Link>
          <button
            onClick={scrollToTop}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              padding: '6px 12px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </footer>
    </>
  );
}
