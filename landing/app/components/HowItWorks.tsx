'use client';

import { motion } from 'framer-motion';
import { Download, MousePointerClick, Search, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Download,
    title: 'Install & Sign In',
    description: 'Add LinkSave to Google Chrome and sign in securely with your Google account in one click.',
  },
  {
    number: '02',
    icon: MousePointerClick,
    title: 'Save Any Webpage',
    description: 'Click "Save Current Page" for active tabs, or enter custom URLs and custom titles manually.',
  },
  {
    number: '03',
    icon: Search,
    title: 'Search & Date Filter',
    description: 'Fuzzy search by title or URL (Ctrl+K), filter by date range (Today, 7d, 30d), or copy all links.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-wrapper">
      <div className="section-header section-header--center">
        <div className="section-tag">
          <Sparkles size={13} />
          <span>Workflow</span>
        </div>
        <h2 className="section-title">
          Three simple steps to <span className="font-serif-italic">never lose</span> a link.
        </h2>
        <p className="section-description">
          Designed to stay completely out of your way until you need your saved bookmarks.
        </p>
      </div>

      <div className="step-grid">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, scale: 1.01 }}
            >
              <div className="step-number">{step.number}</div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                <Icon size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 10px', color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
