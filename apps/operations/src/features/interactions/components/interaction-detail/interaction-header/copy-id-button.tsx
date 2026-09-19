'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyIdButton({ id }: Readonly<{ id: string }>) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      const area = document.createElement('textarea');
      area.value = id;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <code
        title={id}
        className="min-w-0 font-mono text-xs text-muted-foreground tabular-nums [overflow-wrap:anywhere]"
      >
        {id}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? 'Interaction ID copied to clipboard' : 'Copy interaction ID'}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        {copied ? (
          <Check aria-hidden="true" className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy aria-hidden="true" className="h-3.5 w-3.5" />
        )}
      </button>
      {copied ? (
        <span role="status" className="shrink-0 text-xs font-medium text-success">
          Copied
        </span>
      ) : null}
    </span>
  );
}
