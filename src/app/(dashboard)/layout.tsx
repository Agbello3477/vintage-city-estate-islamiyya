import { requireAuth } from "@/lib/rbac";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
      <footer className="border-t border-slate-200/60 bg-white/60 py-4 text-center text-xs text-slate-500 space-y-0.5 mt-auto">
        <p>Vintage City Estate Islamiyya &bull; All Rights Reserved © {new Date().getFullYear()}</p>
        <p className="font-semibold text-emerald-800 text-[11px]">Powered by MaSha Tech Innovations</p>
      </footer>
    </div>
  );
}
