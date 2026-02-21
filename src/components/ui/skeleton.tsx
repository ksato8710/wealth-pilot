import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-md bg-[#27272a] animate-pulse", className)}
      {...props}
    />
  );
}
