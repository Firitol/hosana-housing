'use client';

import { StatsCards } from '@/components/dashboard/stats-cards';
import { OverviewCharts } from '@/components/dashboard/overview-charts';
import { AiBrief } from '@/components/dashboard/ai-brief';
import { useUser } from '@/firebase';

export default function DashboardPage() {
  const { user } = useUser();
  const lang = user?.language || 'English';

  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        {lang === 'Amharic' ? 'ዳሽቦርድ' : 'Dashboard'}
      </h1>
      <StatsCards />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <OverviewCharts />
        <AiBrief />
      </div>
    </div>
  );
}
