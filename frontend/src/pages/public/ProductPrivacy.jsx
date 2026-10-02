import { Link, Navigate, useParams } from "react-router-dom";

/**
 * Per-product privacy policies for apps/products distributed outside this
 * website. The main platform policy lives at /privacy.
 */
const POLICIES = {
  "litafi-nya-soko": {
    name: "Litafi Nya Soko",
    subtitle: "The Nupe Bible App",
    updated: "October 2026",
    blocks: [
      {
        h: "1. Introduction",
        p: [
          "This Privacy Policy governs the use of the mobile application Litafi Nya Soko developed by Abraham Saidu Twaki. The application provides digital access to the Bible in the Nupe language, including the Old Testament, New Testament, and a Topics & Life Issues study guide. We respect your privacy and are committed to protecting it.",
        ],
      },
      {
        h: "2. Information Collection and Use",
        p: ["Litafi Nya Soko does not collect, store, transmit, or share any personally identifiable information (PII)."],
        list: [
          "No user account creation or registration is required to use the app.",
          "We do not collect names, phone numbers, email addresses, precise geographic locations, or payment details.",
        ],
      },
      {
        h: "3. Device Permissions",
        p: [
          "The app operates locally on your mobile device. Any device permissions requested (such as offline storage access) are strictly used for storing Bible text locally on your device for uninterrupted offline reading. No personal data from your device is extracted, harvested, or sold.",
        ],
      },
      {
        h: "4. Third-Party Services & Analytics",
        p: [
          "The app does not utilize third-party tracking software or advertising services that gather personal data. Anonymous diagnostic or crash reports collected automatically by Google Play Store are handled strictly according to Google's Privacy Policy.",
        ],
      },
      {
        h: "5. Children's Privacy",
        p: [
          "Litafi Nya Soko contains religious and educational content appropriate for all ages. We do not knowingly collect personal information from children or any other users.",
        ],
      },
      {
        h: "6. Changes to This Privacy Policy",
        p: [
          "We may update our Privacy Policy from time to time. Any changes will be posted directly on this page with an updated revision date.",
        ],
      },
      {
        h: "7. Contact Us",
        p: [
          "If you have any questions or suggestions regarding this Privacy Policy, please contact us:",
        ],
        list: ["Developer: Abraham Saidu Twaki", "Email: abtwaki@gmail.com"],
      },
      {
        h: "Copyright",
        p: ["Scripture text Copyright © Bible Society of Nigeria. All rights reserved."],
      },
    ],
  },
  "nupe-hymns": {
    name: "Nupe Hymns",
    subtitle: "The Nupe Hymnbook App",
    updated: "October 2026",
    blocks: [
      {
        h: "1. Introduction",
        p: [
          "This Privacy Policy governs the use of the Nupe Hymns mobile application developed by Abraham Saidu Twaki / TabsSoft Global Technologies. The app provides digital access to hymns in the Nupe language for personal devotion and congregational worship. We respect your privacy and are committed to protecting it.",
        ],
      },
      {
        h: "2. Information Collection and Use",
        p: ["Nupe Hymns does not collect, store, transmit, or share any personally identifiable information (PII)."],
        list: [
          "No user account creation or registration is required to use the app.",
          "We do not collect names, phone numbers, email addresses, precise geographic locations, or payment details.",
        ],
      },
      {
        h: "3. Device Permissions",
        p: [
          "The app operates locally on your mobile device. Any device permissions requested (such as storage access) are strictly used for storing hymn text locally on your device for uninterrupted offline use. No personal data from your device is extracted, harvested, or sold.",
        ],
      },
      {
        h: "4. Third-Party Services & Analytics",
        p: [
          "The app does not utilize third-party tracking software or advertising services that gather personal data. Anonymous diagnostic or crash reports collected automatically by the app store are handled strictly according to the store's own privacy policy.",
        ],
      },
      {
        h: "5. Children's Privacy",
        p: [
          "Nupe Hymns contains religious and educational content appropriate for all ages. We do not knowingly collect personal information from children or any other users.",
        ],
      },
      {
        h: "6. Changes to This Privacy Policy",
        p: [
          "We may update our Privacy Policy from time to time. Any changes will be posted directly on this page with an updated revision date.",
        ],
      },
      {
        h: "7. Contact Us",
        p: ["If you have any questions or suggestions regarding this Privacy Policy, please contact us:"],
        list: ["Developer: Abraham Saidu Twaki", "Email: abtwaki@gmail.com"],
      },
      {
        h: "Copyright",
        p: [
          "Hymn texts remain the property of their respective copyright holders and are reproduced for worship and devotional use.",
        ],
      },
    ],
  },
  "tabsforge-schoolos": {
    name: "TabsForge SchoolOS",
    subtitle: "School Management Platform",
    updated: "October 2026",
    blocks: [
      {
        h: "1. Introduction",
        p: [
          "This Privacy Policy governs TabsForge SchoolOS, the school management platform operated by TabsSoft Global Technologies Limited (RC 9350407), Minna, Niger State, Nigeria. It explains how school, staff, student and guardian data is handled across the platform, in line with the Nigeria Data Protection Regulation (NDPR).",
        ],
      },
      {
        h: "2. Roles & Responsibilities",
        p: [
          "Each school using TabsForge SchoolOS is the Data Controller for the records it enters. TabsSoft Global Technologies acts as the Data Processor — we host, secure and maintain the platform on the school's instructions and never use school data for our own purposes.",
        ],
      },
      {
        h: "3. Information We Process",
        list: [
          "Student records: names, enrolment details, attendance, results and related academic data entered by the school.",
          "Staff and guardian accounts: names, contact details and role-based credentials.",
          "Financial records: fees, invoices and payments recorded by the school.",
          "Technical logs: sign-in activity and audit trails required for security and support.",
        ],
      },
      {
        h: "4. How Data Is Used",
        list: [
          "To provide the school's management, academic, finance and communication functions.",
          "To secure accounts, prevent abuse and produce audit trails.",
          "To maintain, back up and improve the platform.",
        ],
        p: ["We do not sell or share school data with advertisers or unrelated third parties."],
      },
      {
        h: "5. Security",
        p: [
          "Data is encrypted in transit (HTTPS) and sensitive fields are encrypted at rest. Access is role-based and audited. Backups are performed regularly, and access to production systems is restricted to authorised TabsSoft personnel under confidentiality obligations.",
        ],
      },
      {
        h: "6. Data Retention & Your Rights",
        p: [
          "Records are retained for the duration of the school's subscription and handled according to the school's instructions thereafter. Parents, guardians, staff and students should direct access, correction or erasure requests to their school (the Data Controller); we assist schools in honouring NDPR requests.",
        ],
      },
      {
        h: "7. Changes to This Privacy Policy",
        p: [
          "We may update this policy from time to time; material changes will be posted on this page and, where appropriate, communicated to subscribed schools.",
        ],
      },
      {
        h: "8. Contact Us",
        list: [
          "TabsSoft Global Technologies Limited, Minna, Niger State, Nigeria",
          "Email: info@tabssoftglobal.com",
        ],
      },
    ],
  },
};

export default function ProductPrivacy() {
  const { slug } = useParams();
  const policy = POLICIES[slug];
  if (!policy) return <Navigate to="/privacy" replace />;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <span className="eyebrow">Product privacy</span>
        <h1 className="section-title">{policy.name} — Privacy Policy</h1>
        <p className="muted">
          {policy.subtitle} · Last updated: {policy.updated}
        </p>
        <div className="prose mt-3">
          {policy.blocks.map((b) => (
            <div key={b.h}>
              <h2>{b.h}</h2>
              {b.p?.map((para, i) => <p key={i}>{para}</p>)}
              {b.list && (
                <ul>
                  {b.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 small muted">
          Looking for the website & AI Suite policy? <Link to="/privacy">See the platform privacy policy</Link>.
        </p>
      </div>
    </section>
  );
}
