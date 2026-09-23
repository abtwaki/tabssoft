export default function Privacy() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <span className="eyebrow">Legal</span>
        <h1 className="section-title">Privacy Policy</h1>
        <p className="muted">Last updated: September 2026 · NDPR compliant</p>

        <div className="prose mt-3">
          <h2>Who we are</h2>
          <p>
            TabsSoft Global Technologies Limited (RC 9350407), Minna, Niger
            State, Nigeria — the data controller for this website and the
            TabsSoft AI Suite.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li><strong>Account data:</strong> name, email, role, organisation — collected with your explicit consent at signup.</li>
            <li><strong>Content you create:</strong> text you submit to AI tools and documents you save. Saved documents are encrypted at rest.</li>
            <li><strong>Usage data:</strong> which tools you use and when, for quota enforcement and product analytics.</li>
            <li><strong>Billing data:</strong> payment references and subscription status. Card details are handled entirely by Paystack — we never see or store them.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To provide and improve the AI Suite and our services</li>
            <li>To enforce plan quotas and process payments</li>
            <li>To communicate with you about your account</li>
          </ul>

          <h2>AI processing</h2>
          <p>
            Text you submit to AI tools is sent to our AI provider solely to
            generate your result. Inputs are length-limited and sanitized. Do
            not submit secrets, passwords, or highly sensitive personal data
            to AI tools.
          </p>

          <h2>Your rights (NDPR)</h2>
          <ul>
            <li><strong>Access:</strong> your data is visible in your dashboard and settings.</li>
            <li><strong>Erasure:</strong> delete your account and all associated data from Settings → Delete account.</li>
            <li><strong>Consent withdrawal:</strong> account deletion withdraws consent and removes your data.</li>
            <li><strong>Complaints:</strong> contact us at info@tabssoftglobal.com.</li>
          </ul>

          <h2>Security</h2>
          <p>
            HTTPS everywhere, encrypted sensitive fields at rest, per-user rate
            limiting on AI endpoints, and standard Django security protections
            (CSRF, XSS, SQLi) on every endpoint.
          </p>

          <h2>Contact</h2>
          <p>
            Data protection enquiries: <a href="mailto:info@tabssoftglobal.com">info@tabssoftglobal.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}
