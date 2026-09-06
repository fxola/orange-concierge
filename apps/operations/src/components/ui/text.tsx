import type { ElementType, ReactNode } from 'react';

type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'caption';

type TextTone = 'default' | 'muted' | 'subtle';

const VARIANT_STYLES: Record<TextVariant, string> = {
  display: 'font-display text-[40px] font-medium leading-[48px]',
  h1: 'font-display text-[32px] font-medium leading-10',
  h2: 'text-2xl font-bold leading-8 tracking-[-0.015em]',
  h3: 'text-xl font-semibold leading-7',
  body: 'text-base leading-6',
  small: 'text-sm leading-5',
  label: 'text-sm font-semibold leading-5',
  caption: 'text-xs font-medium leading-4',
};

const DEFAULT_TAG: Record<TextVariant, ElementType> = {
  display: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  small: 'p',
  label: 'span',
  caption: 'span',
};

const TONES: Record<TextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  subtle: 'text-subtle-foreground',
};

export type TextProps = Readonly<{
  variant?: TextVariant;
  tone?: TextTone;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}>;

export function Text({ variant = 'body', tone = 'default', as, className, children }: TextProps) {
  const Tag = as ?? DEFAULT_TAG[variant];

  return (
    <Tag className={[VARIANT_STYLES[variant], TONES[tone], className ?? ''].join(' ')}>
      {children}
    </Tag>
  );
}
