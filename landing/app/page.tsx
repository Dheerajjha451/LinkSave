'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Chrome, Github, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import BentoGrid from './components/BentoGrid';
import InteractiveDemo from './components/InteractiveDemo';
import HowItWorks from './components/HowItWorks';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="landing-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="landing-noise" aria-hidden="true" />
      <div className="ambient-glow ambient-glow--top" aria-hidden="true" />
      <div className="ambient-glow ambient-glow--bento" aria-hidden="true" />

      {/* Floating Header Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.12, delayChildren: 0.05 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="hero-eyebrow"
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.04 }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span>Your Personal Link Library</span>
            </motion.div>
          </motion.div>

          <motion.h1
            className="hero-title"
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <TypewriterText text="Save less," startDelay={250} speed={55} showCursor={false} />{' '}
            <span className="font-serif-italic">
              <TypewriterText text="Remember more." startDelay={900} speed={55} />
            </span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            LinkSave gives every useful page a place to live. Save active tab links in one click,
            filter by date range, and recall what matters instantly.
          </motion.p>

          <motion.div
            className="hero-ctas"
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.a
              href={chromeStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary"
              style={{ height: '48px', padding: '0 22px' }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Chrome size={18} />
              <span>Install for Chrome</span>
              <ArrowUpRight className="btn--icon-arrow" size={16} />
            </motion.a>

            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--secondary"
              style={{ height: '48px', padding: '0 20px' }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Github size={18} />
              <span>Contribute on GitHub</span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Faux macOS Frame Showcase */}
        <div className="showcase-container">
          <motion.div
            className="mac-frame"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, scale: 1.005 }}
          >
            <div className="mac-frame__header">
              <div className="mac-frame__dots">
                <span className="mac-frame__dot mac-frame__dot--red" />
                <span className="mac-frame__dot mac-frame__dot--yellow" />
                <span className="mac-frame__dot mac-frame__dot--green" />
              </div>
              <div className="mac-frame__address-bar">
                <span>chrome-extension://linksave</span>
              </div>
              <div style={{ width: '40px' }} />
            </div>

            <Image
              className="mac-frame__image"
              src="/image.png"
              alt="LinkSave Chrome extension preview interface"
              width={1920}
              height={1440}
              priority
              unoptimized
            />
          </motion.div>
        </div>
      </section>

      {/* Feature Bento Grid (Current Features) */}
      <div id="features">
        <BentoGrid />
      </div>

      {/* Interactive Extension Demo Sandbox */}
      <div id="sandbox">
        <InteractiveDemo />
      </div>

      {/* How It Works Workflow */}
      <div id="workflow">
        <HowItWorks />
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <FaqSection />
      </div>

      {/* Footer Banner & Bottom Links */}
      <Footer />
    </main>
  );
}
