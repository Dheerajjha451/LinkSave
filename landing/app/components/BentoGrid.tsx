'use client';

import { motion } from 'framer-motion';
import { Search, Calendar, Zap, Sparkles, ShieldCheck } from 'lucide-react';

export default function BentoGrid() {
  return (
    <section className="section-wrapper">
      <div className="section-header section-header--center">
        <div className="section-tag">
          <Sparkles size={13} />
          <span>Extension Features</span>
        </div>
        <h2 className="section-title">
          Built for speed, clarity, and <span className="font-serif-italic">privacy</span>.
        </h2>
        <p className="section-description">
          Here is everything currently available inside the LinkSave Chrome extension.
        </p>
      </div>

      <div className="bento-grid">
        {/* Card 1: 1-Click Save */}
        <motion.div
          className="bento-card bento-card--col-7"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6, scale: 1.008 }}
        >
          <div>
            <div className="bento-card__icon-box">
              <Zap size={20} style={{ color: 'var(--accent-blue-bright)' }} />
            </div>
            <h3 className="bento-card__title">1-Click Active Page Save & Manual URL</h3>
            <p className="bento-card__desc">
              Instantly capture your current active tab URL and title, or add any link manually with a custom title.
            </p>
          </div>
        </motion.div>

        {/* Card 2: Smart Search */}
        <motion.div
          className="bento-card bento-card--col-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6, scale: 1.008 }}
        >
          <div>
            <div className="bento-card__icon-box">
              <Search size={20} style={{ color: '#34d399' }} />
            </div>
            <h3 className="bento-card__title">Instant Fuzzy Search</h3>
            <p className="bento-card__desc">
              Search saved links instantly by page title, URL substring, or domain name.
            </p>
          </div>
        </motion.div>

        {/* Card 3: Date Range Filters */}
        <motion.div
          className="bento-card bento-card--col-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6, scale: 1.008 }}
        >
          <div>
            <div className="bento-card__icon-box">
              <Calendar size={20} style={{ color: '#fbbf24' }} />
            </div>
            <h3 className="bento-card__title">Date Range Filters</h3>
            <p className="bento-card__desc">
              Filter saved bookmarks by Today, Last 7 Days, Last 30 Days, or custom date pickers.
            </p>
          </div>
        </motion.div>

        {/* Card 4: Copy All & Google OAuth Sync */}
        <motion.div
          className="bento-card bento-card--col-7"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6, scale: 1.008 }}
        >
          <div>
            <div className="bento-card__icon-box">
              <ShieldCheck size={20} style={{ color: 'var(--accent-blue-bright)' }} />
            </div>
            <h3 className="bento-card__title">Google OAuth & Copy All Links</h3>
            <p className="bento-card__desc">
              Secure 1-click Google sign-in with instant local caching (0ms latency), plus 1-click &quot;Copy All&quot; links to clipboard.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
