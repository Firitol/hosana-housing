import type { Metadata } from 'next';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { OverviewCharts } from '@/components/dashboard/overview-charts';
import { AiBrief } from '@/components/dashboard/ai-brief';

export const metadata: Metadata = {
  title: 'Dashboard | Hosana Nexus',
  description: 'Overview of the Hosana City Housing Management System.',
};

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
      <StatsCards />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <OverviewCharts />
        <AiBrief />
      </div>
    </div>
  );
}
