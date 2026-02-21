import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border border-[#27272a] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#27272a] bg-[#18181b]">
            {Array.from({ length: columns }).map((_, col) => (
              <th key={col} className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row} className="border-b border-[#27272a] last:border-b-0">
              {Array.from({ length: columns }).map((_, col) => (
                <td key={col} className="px-4 py-3">
                  <Skeleton className="h-3 w-full max-w-[120px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
