import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background w-full overflow-x-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <main className="flex-1 p-3.5 sm:p-6 max-w-7xl w-full mx-auto space-y-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
