import { BottomNavPetugas } from '@/components/layout/BottomNavPetugas';

export default function PetugasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <main className="flex-1 p-4">
        {children}
      </main>
      <BottomNavPetugas />
    </div>
  );
}
