'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Select, Textarea } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { submitInteraction } from '../presenters/submit-interaction';
import { ClientOption } from '../view-models/submit-interaction';

export function SubmitInteractionForm({
  clients,
  fixedClient,
  onSubmitted,
}: {
  clients: readonly ClientOption[];
  fixedClient?: ClientOption;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(fixedClient?.id ?? clients[0]?.id ?? '');
  const [transcript, setTranscript] = useState('');
  const [isPending, setIsPending] = useState(false);

  if (!fixedClient && clients.length === 0) {
    return (
      <div className="rounded-sm border border-border bg-surface p-5 sm:p-6">
        <Text tone="muted" variant="small">
          No clients yet. Add a client before submitting an interaction.
        </Text>
      </div>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    try {
      const viewModel = await submitInteraction({ clientId, transcript });

      if (viewModel.status === 'ok') {
        const effectiveClientId = fixedClient?.id ?? clientId;
        setTranscript('');
        toast.success('Transcript saved. Next step: analyze this interaction.');
        onSubmitted?.();
        router.push(`/clients/${effectiveClientId}/interactions/${viewModel.interactionId}`);
        return;
      }

      if (viewModel.unauthorized) {
        router.push('/login');
        router.refresh();
        return;
      }
      toast.error(viewModel.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-sm border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold tracking-[-0.01em]">New interaction</h3>
          <Text tone="muted" variant="small" className="mt-1">
            {fixedClient
              ? `Intake for ${fixedClient.displayName}. Screening runs before any model call.`
              : 'Paste meeting notes. Screening runs before any model call.'}
          </Text>
        </div>
      </div>
      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        {!fixedClient ? (
          <Field label="Client">
            <Select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              disabled={isPending}
              className="rounded-sm"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.displayName}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        <Field label="Transcript">
          <Textarea
            placeholder="Paste meeting notes here…"
            required
            rows={6}
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            disabled={isPending}
            className="min-h-32 rounded-sm"
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Submitting…' : 'Submit interaction'}
          </Button>
          <Text tone="muted" variant="caption">
            Saved as received, then needs analysis.
          </Text>
        </div>
      </form>
    </div>
  );
}
