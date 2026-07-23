export type LandingState = "services" | "platform";

export interface HeroContent {
  /** аргумент команды после "c:" — печатается typewriter-ом */
  commandArg: LandingState;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary?: string;
}

export interface SectionCopy {
  /** CLI-лейбл секции, формат "NN: name", строчные */
  label: string;
  /** V1 — рабочий вариант; V2 хранится рядом в комментарии контент-модуля */
  title: string;
}

export interface FinalCtaContent {
  title: string;
  sub: string;
  ctaPrimary: string;
  ctaSecondary?: string;
}
