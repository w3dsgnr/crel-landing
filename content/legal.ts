// Легальные документы (спека 2026-08-13 §Контент легала): обычный регистр,
// не lowercase-тон UI-копирайта. Ничего не выдумываем — все фактические
// реквизиты (адрес, регистрационные номера, юрисдикция) стоят как
// [VERIFY: credentials от Roman] до вычитки заказчиком и юристом. Privacy
// перечисляет ровно те данные, что берут две формы сайта (contact, email
// capture) — см. lib/validateContact.ts и content/shared.ts (contact, finale).
import type { LegalDoc, LegalDocId } from "./types";

const privacy: LegalDoc = {
  id: "privacy",
  title: "Privacy Policy",
  updated: "Last updated: August 2026",
  intro:
    "This policy explains what personal data Crel [AG], Zurich, Switzerland [VERIFY: credentials от Roman] collects through this website, why, and what rights you have over it.",
  sections: [
    {
      heading: "Controller",
      paras: [
        "The controller responsible for the data described in this policy is Crel [AG], [street, postcode] Zurich, Switzerland [VERIFY: credentials от Roman]. Reach us at info@crel.ch.",
      ],
    },
    {
      heading: "Data we collect",
      paras: [
        "We collect only what you type into the forms on this site. There is no other source: no cookies, no analytics, no third-party trackers.",
      ],
      bullets: [
        "Contact form: your name, email address and message",
        "Email capture: your email address",
      ],
    },
    {
      heading: "Purposes and legal basis",
      paras: [
        "We process contact-form submissions to reply to your enquiry, under GDPR art. 6(1)(a) (your consent, given by submitting the form) and art. 6(1)(f) (our legitimate interest in responding to enquiries about our services).",
        "We process the email address you leave with the subscribe form to send occasional updates, under GDPR art. 6(1)(a). You can withdraw this consent at any time.",
      ],
    },
    {
      heading: "Retention",
      paras: [
        "We keep contact-form and subscription data for as long as needed to handle the enquiry or the subscription, and no longer than [VERIFY: срок хранения].",
      ],
    },
    {
      heading: "Your rights",
      paras: [
        "Under GDPR art. 15–22 you have the right to access, correct, delete or restrict the data we hold about you, to receive it in a portable format, and to object to processing. Where processing relies on consent, you can withdraw it at any time without affecting processing carried out before the withdrawal. To exercise any of these rights, write to info@crel.ch.",
        "If you believe we have not handled your data lawfully, you can lodge a complaint with your local data protection supervisory authority.",
      ],
    },
    {
      heading: "International transfers and Swiss FADP",
      paras: [
        "As a Swiss company, Crel also processes personal data in accordance with the Swiss Federal Act on Data Protection (FADP). Where data is transferred outside Switzerland or the EEA, we rely on appropriate safeguards recognised under GDPR and Swiss law.",
      ],
    },
    {
      heading: "No profiling",
      paras: [
        "We do not use the data described in this policy for automated decision-making or profiling.",
      ],
    },
    {
      heading: "Changes to this policy",
      paras: [
        "We may update this policy as the site or its forms change. The date at the top marks the last revision.",
      ],
    },
  ],
};

const cookies: LegalDoc = {
  id: "cookies",
  title: "Cookie Policy",
  updated: "Last updated: August 2026",
  intro:
    "This site is a static export with no server-side logic. It does not set cookies and does not run analytics or advertising trackers.",
  sections: [
    {
      heading: "No cookies today",
      paras: [
        "This website does not set cookies of any kind — no session cookies, no analytics cookies, no third-party or advertising cookies.",
      ],
    },
    {
      heading: "What we use instead",
      paras: [
        "Fonts are self-hosted rather than loaded from a third-party font service, and the site carries no analytics or tracking script. Nothing is written to your browser storage on our behalf.",
      ],
    },
    {
      heading: "If this changes",
      paras: [
        "Should we ever introduce cookies or similar technologies — for analytics or otherwise — we will ask for your consent through a banner before anything is set, and update this policy first.",
      ],
    },
    {
      heading: "Browser controls",
      paras: [
        "Even without cookies from us, your browser lets you review and control any stored data site by site through its own privacy settings.",
      ],
    },
  ],
};

const terms: LegalDoc = {
  id: "terms",
  title: "Terms of Use",
  updated: "Last updated: August 2026",
  intro:
    "These terms govern your use of this website, published by Crel [AG], Zurich, Switzerland [VERIFY: credentials от Roman]. By using the site, you accept them.",
  sections: [
    {
      heading: "About this site",
      paras: [
        "This website is informational: it describes Crel's platform and consulting services and lets you get in touch. It is not itself a financial service and does not process transactions.",
      ],
    },
    {
      heading: "Intellectual property",
      paras: [
        "All content on this site — text, design, logos and code — belongs to Crel or its licensors and is protected by copyright and trademark law. You may view and share pages for personal, non-commercial reference; you may not reproduce, redistribute or reuse the content without our written permission.",
      ],
    },
    {
      heading: "Acceptable use",
      paras: [
        "You agree not to misuse the site: no attempts to disrupt it, extract data at scale, or use it for unlawful purposes.",
      ],
    },
    {
      heading: "No warranties and limitation of liability",
      paras: [
        "The site is provided as is, without warranties of any kind, express or implied. To the extent permitted by law, Crel is not liable for indirect, incidental or consequential damages arising from your use of the site.",
      ],
    },
    {
      heading: "Governing law",
      paras: [
        "These terms are governed by the laws of [VERIFY: юрисдикция — Switzerland], without regard to conflict-of-law principles. Disputes fall under the jurisdiction of the competent courts at that location [VERIFY].",
      ],
    },
  ],
};

const imprint: LegalDoc = {
  id: "imprint",
  title: "Imprint",
  updated: "Last updated: August 2026",
  intro: "Legal disclosure for this website, per applicable transparency requirements.",
  sections: [
    {
      heading: "Company details",
      paras: [
        "Crel [AG], [street, postcode] Zurich, Switzerland [VERIFY: credentials от Roman].",
        "Commercial register number: [VERIFY]. VAT number: [VERIFY].",
      ],
    },
    {
      heading: "Responsible for content",
      paras: [
        "Responsible for the content of this website: [VERIFY: имя ответственного лица]. Contact: info@crel.ch.",
      ],
    },
  ],
};

export const legalDocs: Record<LegalDocId, LegalDoc> = { privacy, cookies, terms, imprint };

// Порядок вкладок/ссылок легал-модалки — совпадает с footer.legalLinks (content/shared.ts).
export const legalOrder: LegalDocId[] = ["privacy", "cookies", "terms", "imprint"];
