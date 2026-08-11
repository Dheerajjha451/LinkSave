import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Privacy Policy | LinkSave Chrome Extension',
  description: 'LinkSave Privacy Policy. We respect your privacy. All saved links and bookmarks are stored locally in your browser.',
};

export default function PrivacyPage() {
  return (
    <main className="landing-wrapper">
      <Navbar />

      <section className="section-wrapper" style={{ maxWidth: '800px', margin: '40px auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'var(--accent-blue-bright)', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
          <h1 style={{ fontSize: '36px', fontWeight: 700, margin: '16px 0 8px', color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Last Updated: August 11, 2026</p>
        </div>

        <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '15px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            1. Overview
          </h2>
          <p>
            LinkSave (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. LinkSave is a Chrome extension designed to save and organize browser bookmarks with maximum speed and zero telemetry.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            2. Information We Collect & Store
          </h2>
          <p>
            LinkSave operates on a <strong>local-first privacy architecture</strong>:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>
              <strong>Saved Links:</strong> When you click &quot;Save Current Page&quot; or manually add a URL, the URL, page title, and timestamp are stored strictly in your browser local storage (<code>chrome.storage.local</code>).
            </li>
            <li>
              <strong>Google Account Information:</strong> If you sign in via Google OAuth, LinkSave accesses your basic user profile (name, email address, avatar) solely to maintain your active extension session.
            </li>
          </ul>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            3. What We Do NOT Collect
          </h2>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>We do NOT sell, rent, or trade your personal data to third parties.</li>
            <li>We do NOT track your browser history outside of pages you explicitly choose to save.</li>
            <li>We do NOT collect keystrokes, personal passwords, or financial information.</li>
            <li>We do NOT use invasive third-party analytics trackers.</li>
          </ul>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            4. Data Retention & Control
          </h2>
          <p>
            You retain 100% control over your data. You can edit or delete individual saved links anytime directly from the LinkSave extension popup. Uninstalling the Chrome extension removes all locally stored extension data from your device.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            5. Chrome Web Store Compliance
          </h2>
          <p>
            LinkSave strictly complies with the Google Chrome Web Store Developer Program Policies and User Data Guidelines, including the Limited Use Requirements.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            6. Contact Us
          </h2>
          <p>
            If you have questions regarding this Privacy Policy, please open an issue on our official{' '}
            <a
              href="https://github.com/Dheerajjha451/LinkSave"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-blue-bright)' }}
            >
              GitHub repository
            </a>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
