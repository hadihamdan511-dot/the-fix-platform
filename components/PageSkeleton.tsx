export function PageSkeleton({ blocks = 3 }: { blocks?: number }) {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-6 p-6" aria-busy="true">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="h-7 w-56 rounded bg-gray-200" />
      </div>
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-3 w-40 rounded bg-gray-200" />
          <div className="h-8 w-32 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}