'use client';

import { motion } from 'framer-motion';
import { Sparkles, Tag, Command, Brain, FolderGit2, ArrowRight } from 'lucide-react';

const upcomingFeatures = [
  {
    icon: Tag,
    title: 'Custom Category Tagging',
    description: 'Organize saved links into color-coded tags like Engineering, Design System, and Reading queues.',
    status: 'In Development',
    color: 'cyan',
  },
  {
    icon: Command,
    title: 'Global System Hotkey (⌘+Shift+S)',
    description: 'Save any webpage directly from your keyboard without opening the extension pop-up.',
    status: 'Planned',
    color: 'emerald',
  },
  {
    icon: Brain,
    title: 'AI Webpage Summaries',
    description: 'Automatically extract key takeaways and executive summaries from long articles when saved.',
    status: 'Researching',
    color: 'amber',
  },
  {
    icon: FolderGit2,
    title: 'Nested Collections & Export',
    description: 'Group links into shareable collection folders and export full backups in JSON/CSV.',
    status: 'Planned',
    color: 'cyan',
  },
];

export default function FutureRoadmap() {
  return (
    <section className="section-wrapper" style={{ paddingTop: '60px' }}>
      <div className="section-header section-header--center">
        <div className="section-tag">
          <Sparkles size={13} style={{ color: 'var(--accent-amber)' }} />
          <span>Future Roadmap</span>
        </div>
        <h2 className="section-title">
          What we are building <span className="font-serif-italic">next</span>.
        </h2>
        <p className="section-description">
          LinkSave is actively evolving. Here are the features planned for upcoming releases.
        </p>
      </div>

      <div className="bento-grid">
        {upcomingFeatures.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              className="bento-card bento-card--col-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="bento-card__icon-box">
                    <Icon size={18} style={{ color: `var(--accent-${item.color})` }} />
                  </div>
                  <span
                    className={`demo-tag demo-tag--${item.color}`}
                    style={{ fontSize: '11px' }}
                  >
                    {item.status}
                  </span>
                </div>
                <h3 className="bento-card__title" style={{ marginTop: '20px' }}>
                  {item.title}
                </h3>
                <p className="bento-card__desc">{item.description}</p>
              </div>

              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span>Coming in future release</span>
                <ArrowRight size={12} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
