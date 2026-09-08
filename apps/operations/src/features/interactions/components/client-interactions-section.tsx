'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { TableEmpty } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { ClientOption } from '../view-models/submit-interaction';
import { SubmitInteractionForm } from './submit-interaction-form';

export function ClientInteractionsSection({ client }: { client: ClientOption }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center">
        <Text variant="h2">{open ? 'Add Interaction' : 'Interactions'}</Text>
      </div>
      {open ? (
        <div className="mt-3">
          <SubmitInteractionForm clients={[]} fixedClient={client} />
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-none border border-border bg-surface">
          <TableEmpty
            title="No interactions yet"
            description="Submitted meeting notes will appear here."
            action={
              <Button variant="secondary" size="sm" onClick={() => setOpen((value) => !value)}>
                Add Interaction
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
