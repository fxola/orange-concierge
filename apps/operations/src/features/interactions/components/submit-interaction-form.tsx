'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Select, Textarea } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { submitInteraction } from '../presenters/submit-interaction';
import { ClientOption } from '../view-models/submit-interaction';

export function SubmitInteractionForm({
  clients,
  fixedClient,
}: {
  clients: readonly ClientOption[];
  fixedClient?: ClientOption;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(fixedClient?.id ?? clients[0]?.id ?? '');
  const [transcript, setTranscript] = useState('');
  const [isPending, setIsPending] = useState(false);

  if (!fixedClient && clients.length === 0) {
    return (
      <Card>
        <Text tone="muted">No clients yet. Add a client before submitting an interaction.</Text>
      </Card>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    try {
      const viewModel = await submitInteraction({ clientId, transcript });

      if (viewModel.status === 'ok') {
        setTranscript('');
        toast.success('Interaction received. Queued for analysis.');
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
    <Card>
      <form className="grid gap-4" onSubmit={onSubmit}>
        {!fixedClient ? (
          <Field label="Client">
            <Select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              disabled={isPending}
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
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            disabled={isPending}
          />
        </Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit interaction'}
        </Button>
      </form>
    </Card>
  );
}
