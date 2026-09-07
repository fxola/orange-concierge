import { PageHeader, TableEmpty } from '@/components/ui/page';

export default async function ReviewsRoute() {
  return (
    <>
      <PageHeader title="Reviews" description="Recommendations awaiting human review." />
      <div className="overflow-hidden rounded-none border border-border bg-surface">
        <TableEmpty
          title="Nothing awaiting review"
          description="Analyzed interactions will show up here for approval."
        />
      </div>
    </>
  );
}
