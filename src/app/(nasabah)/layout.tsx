import { BottomNavNasabah } from '@/components/layout/BottomNavNasabah';

export default function NasabahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24" suppressHydrationWarning>
      <main className="flex-1 p-4">
        {children}
      </main>
      <BottomNavNasabah />
    </div>
  );
}
