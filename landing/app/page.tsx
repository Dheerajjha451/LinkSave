'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Chrome, Github, Sparkles } from 'lucide-react';
import { useState } from 'react';
import TypewriterText from './components/TypewriterText';

const chromeStoreUrl = 'https://chromewebstore.google.com/detail/linksave/ojikdodfhnpohghabhaebmkglmpagenm';
const githubUrl = 'https://github.com/Dheerajjha451/LinkSave';
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LinkSave',
  applicationCategory: 'BrowserApplication',
  operatingSystem: 'Chrome',
  description: 'A Chrome extension for saving, organizing, and finding the web pages that matter to you.',
  downloadUrl: chromeStoreUrl,
  sameAs: [githubUrl],
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <main className="landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="landing__noise" aria-hidden="true" />
      <div className="landing__orb landing__orb--blue" aria-hidden="true" />
      <div className="landing__orb landing__orb--grey" aria-hidden="true" />

      <motion.header
        className="site-brand"
        initial={{ opacity: 0, y: -30, scaleX: 0.2, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, scaleX: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="site-brand__mark"
          initial={{ opacity: 0, rotate: -14, scale: 0.65 }}
          animate={{ opacity: 1, rotate: [-14, 8, -3, 0], scale: [0.65, 1.16, 0.96, 1] }}
          transition={{ duration: 0.68, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src="/linksave-icon.svg" alt="LinkSave" width={46} height={46} priority />
        </motion.div>
        <motion.span
          className="site-brand__name"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.42, delay: 0.38, ease: 'easeOut' }}
        >
          LinkSave
        </motion.span>
      </motion.header>

      <section className="hero">
        <motion.div
          className="hero__content"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1, delayChildren: 0.12 }}
        >
          <motion.p className="hero__eyebrow" variants={fadeUp} transition={{ duration: 0.55 }}>
            <Sparkles size={14} aria-hidden="true" />
            Your personal link library
          </motion.p>

          <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }}>
            <TypewriterText text="Save less." showCursor={false} /><br />
            <em><TypewriterText text="Remember more." startDelay={520} /></em>
          </motion.h1>

          <motion.p className="hero__description" variants={fadeUp} transition={{ duration: 0.6 }}>
            LinkSave gives every useful page a place to live. Save a link in one click,
            then return to it when the moment is right.
          </motion.p>

          <motion.div className="hero__actions" variants={fadeUp} transition={{ duration: 0.6 }}>
            <a
              className="button button--primary"
              href={chromeStoreUrl}
              target="_blank"
              rel="noreferrer"
              data-hovered={hoveredAction === 'chrome'}
              onPointerEnter={() => setHoveredAction('chrome')}
              onPointerLeave={() => setHoveredAction(null)}
              onFocus={() => setHoveredAction('chrome')}
              onBlur={() => setHoveredAction(null)}
            >
              <Chrome size={18} strokeWidth={2.15} />
              Install for Chrome
              <ArrowUpRight className="button__arrow" size={16} strokeWidth={2.2} />
            </a>
            <a
              className="button button--quiet"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              data-hovered={hoveredAction === 'github'}
              onPointerEnter={() => setHoveredAction('github')}
              onPointerLeave={() => setHoveredAction(null)}
              onFocus={() => setHoveredAction('github')}
              onBlur={() => setHoveredAction(null)}
            >
              <Github size={18} strokeWidth={2.15} />
              Contribute on GitHub
              <ArrowUpRight className="button__arrow" size={16} strokeWidth={2.2} />
            </a>
          </motion.div>

        </motion.div>

        <div className="showcase-shell">
          <motion.div
            className="showcase"
            initial={{ opacity: 0, y: 42, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.85, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="showcase__halo" aria-hidden="true" />
            <div className="browser-frame">
              <Image
                className="browser-frame__image"
                src="/image.png"
                alt="LinkSave Chrome extension open beside a webpage"
                width={1920}
                height={1440}
                priority
                unoptimized
              />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
