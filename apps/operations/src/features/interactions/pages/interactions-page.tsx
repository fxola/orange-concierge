import { PageHeader, TableEmpty } from '@/components/ui/page';

export function InteractionsPage() {
  return (
    <>
      <PageHeader
        title="Interactions"
        description="Submitted transcripts and their analysis state."
      />
      <div className="overflow-hidden rounded-none border border-border bg-surface">
        <TableEmpty
          title="No interactions yet"
          description="Submit your first client interaction to get started."
        />
      </div>
    </>
  );
}
