import { AppLayout } from "@/components/layout/app-layout";

export default function TaxOptimizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
