'use client';

import { useUser } from '@/firebase';
import { KetuaDashboard } from '@/app/dashboard/ketua-dashboard';
import { WakilDashboard } from '@/app/dashboard/wakil-dashboard';
import { SekretarisDashboard } from '@/app/dashboard/sekretaris-dashboard';
import { BendaharaDashboard } from '@/app/dashboard/bendahara-dashboard';
import { AnggotaDashboard } from '@/app/dashboard/anggota-dashboard';
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
    if (!user || !user.position) {
      return <AnggotaDashboard />;
    }
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
