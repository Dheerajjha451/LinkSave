import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Terms of Service | LinkSave Chrome Extension',
  description: 'LinkSave Terms of Service. Review the terms governing the use of the LinkSave Chrome extension.',
};

export default function TermsPage() {
  return (
    <main className="landing-wrapper">
      <Navbar />

      <section className="section-wrapper" style={{ maxWidth: '800px', margin: '40px auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'var(--accent-blue-bright)', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
          <h1 style={{ fontSize: '36px', fontWeight: 700, margin: '16px 0 8px', color: 'var(--text-primary)' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Last Updated: August 11, 2026</p>
        </div>

        <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '15px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By downloading, installing, or using the LinkSave Chrome extension or website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the extension.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            2. License & Open Source
          </h2>
          <p>
            LinkSave is open-source software provided under the MIT License. You are free to view, inspect, modify, and distribute the software code in accordance with the terms of the MIT License.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            3. User Responsibilities & Conduct
          </h2>
          <p>
            You agree to use LinkSave solely for lawful purposes. You are responsible for maintaining the security of your browser installation and any bookmarks or URLs saved within your local extension database.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            4. Disclaimer of Warranties
          </h2>
          <p>
            LinkSave is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, express or implied, including fitness for a particular purpose or non-infringement.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            5. Limitation of Liability
          </h2>
          <p>
            In no event shall LinkSave or its maintainers be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the extension.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px' }}>
            6. Changes to Terms
          </h2>
          <p>
            We reserve the right to update these Terms of Service at any time. Continued use of LinkSave constitutes acceptance of any updated terms.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
