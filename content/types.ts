export type LandingState = "services" | "platform";

export interface HeroContent {
  /** аргумент команды в покое: выбор ветки ещё не сделан */
  restArg: string;
  subtitle: string;
  ctaPrimary: string;
}

export interface SectionCopy {
  /** CLI-лейбл секции, формат "NN: name", строчные */
  label: string;
  /** V1 — рабочий вариант; V2 хранится рядом в комментарии контент-модуля */
  title: string;
  /** тезис под заголовком; опционален — есть не у всех секций */
  sub?: string;
}

export interface FinalCtaContent {
  title: string;
  sub: string;
  ctaPrimary: string;
}

/** Легал-документы (спека 2026-08-13 §Контент легала): id совпадает с ключом
 *  footer.legalLinks и с записью в legalDocs (content/legal.ts). */
export type LegalDocId = "privacy" | "cookies" | "terms" | "imprint";

export interface LegalSection {
  heading: string;
  paras: string[];
  bullets?: string[];
}

export interface LegalDoc {
  id: LegalDocId;
  title: string;
  /** "August 2026" — без дня месяца, дата ревизии до юридической вычитки */
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/** Тексты финального блока страницы (спека 2026-08-13): тезис под логотипом,
 *  форма захвата e-mail и CTA модалки контакта. */
export interface FinaleContent {
  sub: string;
  emailLead: string;
  emailPlaceholder: string;
  emailSubmit: string;
  /** подпись кнопки в фазе submitting — как ContactContent.sending */
  emailSending: string;
  emailSuccess: string;
  /** сбой отправки — единственный текст на все сетевые причины, как в ContactContent */
  emailErrorGeneric: string;
  consentPrefix: string;
  consentLinkLabel: string;
  ctaPrimary: string;
}
