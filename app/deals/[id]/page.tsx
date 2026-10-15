import { Suspense } from 'react';
import DealDetails from '@/src/features/deals/DealDetails';
import { StatSkeleton } from '@/src/components/Skeleton';

async function DealContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealDetails dealId={id} />;
}

export default function DealPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-inset" />
          <div className="h-6 w-96 animate-pulse rounded bg-surface-inset" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <DealContent params={props.params} />
    </Suspense>
  );
}
