import { DashboardShell } from "@/components/DashboardShell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
