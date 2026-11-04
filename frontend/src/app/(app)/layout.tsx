import { GlobalNavbar } from "@/components/layout/global-navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F5F2] dark:bg-[#09090B] text-[#1D1E20] dark:text-[#FAFAFA] font-sans antialiased selection:bg-[#60CDFF] selection:text-black transition-colors duration-150 flex flex-col">
      {/* Floating Global Navbar */}
      <GlobalNavbar />

      {/* Main Internal Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {children}
      </main>
    </div>
  );
}
