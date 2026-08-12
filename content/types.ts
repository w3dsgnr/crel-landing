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
