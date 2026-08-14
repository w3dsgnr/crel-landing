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

export interface CaseProject {
  /** ключ глифа ICONS в Cases */
  id: string;
  name: string;
  body: string;
  /** фото проекта в рельсе hover-ленты (путь в /public); без него — глиф ICONS[id] */
  image?: string;
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
  /** незримый заголовок секции для скринридеров */
  srTitle: string;
  /** aria-label формы подписки */
  formAria: string;
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

/** Тексты модалки захвата контакта (спека 2026-08-13 §Тексты). */
export interface ContactContent {
  title: string;
  sub: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  /** подпись кнопки в фазе submitting */
  sending: string;
  /** aria-label крестика в углу панели: видимого текста у кнопки нет */
  close: string;
  successTitle: string;
  successBody: string;
  /** сбой отправки — единственный текст на все сетевые причины */
  errorGeneric: string;
  /** ключи совпадают с тем, что возвращает validateField (lib/validateContact.ts) */
  errors: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    messageRequired: string;
  };
}
