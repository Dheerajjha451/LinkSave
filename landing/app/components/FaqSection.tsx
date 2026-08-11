'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Is LinkSave free and open-source?',
    a: 'Yes, 100% free and open-source under the MIT License. You can inspect the code on GitHub or self-host your own modifications.',
  },
  {
    q: 'Where are my saved links stored?',
    a: 'All data is saved locally on your computer inside Chrome storage. No external servers or analytics tracking are used.',
  },
  {
    q: 'Can I customize the hotkey shortcut?',
    a: 'Yes! Navigate to chrome://extensions/shortcuts in your Chrome browser to assign any custom hotkey combination you prefer.',
  },
  {
    q: 'How does LinkSave differ from built-in Chrome bookmarks?',
    a: 'LinkSave provides instant fuzzy search, tagging, tag filtering, keyboard navigation, and a modern minimal interface without nestable folder confusion.',
  },
  {
    q: 'Can I export my saved links?',
    a: 'Yes, you can export your entire link collection to JSON or CSV format anytime from the settings panel.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-wrapper" style={{ maxWidth: '840px' }}>
      <div className="section-header section-header--center">
        <div className="section-tag">
          <HelpCircle size={13} />
          <span>FAQ</span>
        </div>
        <h2 className="section-title">
          Frequently asked questions.
        </h2>
        <p className="section-description">
          Everything you need to know about LinkSave.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="faq-item">
              <button
                className="faq-trigger"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: isOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="faq-content">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
