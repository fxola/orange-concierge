import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const CONTROL = `
   w-full rounded-none border border-border bg-surface
   px-3 text-sm text-foreground transition-colors 
   placeholder:text-muted-foreground hover:border-border-strong 
   focus:border-focus focus:outline-none 
   disabled:bg-surface-muted disabled:text-muted-foreground`;

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={[CONTROL, 'h-11', className ?? ''].join(' ')} {...props} />;
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, rows = 8, ...props }: TextareaProps) {
  return (
    <textarea
      className={[CONTROL, 'min-h-40 py-2.5 leading-normal', className ?? ''].join(' ')}
      rows={rows}
      {...props}
    />
  );
}
