import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sidebar';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Readonly<{
    variant?: ButtonVariant;
    size?: ButtonSize;
  }>;

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  outline: 'border border-border-strong bg-transparent text-foreground hover:bg-surface-muted',
  ghost: 'bg-transparent text-foreground hover:bg-surface-muted',
  danger: 'bg-danger text-white',
  // Fixed navy shell (identical in both themes): light iconography on dark.
  sidebar: 'bg-transparent text-[#f7f4ed]/60 hover:bg-white/10 hover:text-white',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-10 w-10 text-sm',
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-none font-semibold',
        'transition-[background-color,border-color,transform] duration-150 ease-cubic',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        VARIANTS[variant],
        SIZES[size],
        className ?? '',
      ].join(' ')}
      {...props}
    />
  );
}
