'use client';

import { useUser } from '@/firebase';
import { KetuaDashboard } from '@/components/dashboard/ketua-dashboard';
import { WakilDashboard } from '@/components/dashboard/wakil-dashboard';
import { SekretarisDashboard } from '@/components/dashboard/sekretaris-dashboard';
import { BendaharaDashboard } from '@/components/dashboard/bendahara-dashboard';
import { AnggotaDashboard } from '@/components/dashboard/anggota-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  
  if (isLoading || !user) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
  }

  const renderDashboard = () => {
    switch(user.position) {
      case 'Ketua OSIS':
        return <KetuaDashboard />;
      case 'Wakil Ketua OSIS':
        return <WakilDashboard />;
      case 'Sekretaris 1':
      case 'Sekretaris 2':
        return <SekretarisDashboard />;
      case 'Bendahara 1':
      case 'Bendahara 2':
        return <BendaharaDashboard />;
      default:
        return <AnggotaDashboard />;
    }
  }

  return (
    <section>
      {renderDashboard()}
    </section>
  );
}
