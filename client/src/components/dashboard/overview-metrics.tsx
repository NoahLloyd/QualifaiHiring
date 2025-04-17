import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, Clock, Users, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  actionLabel?: string;
  onAction?: () => void;
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  actionLabel,
  onAction,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-800">{title}</h3>
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
            {icon}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-neutral-800">{value}</p>
            <p className="text-sm font-medium text-neutral-500">{description}</p>
          </div>
          {trend ? (
            <div className={`flex items-center ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <ArrowUp className={`h-5 w-5 ${!trend.positive && 'rotate-180'}`} />
              <span className="ml-1 text-sm font-medium">{trend.positive ? '+' : '-'}{trend.value}%</span>
            </div>
          ) : actionLabel ? (
            <Button
              variant="outline"
              size="sm"
              className="text-primary-700 bg-primary-50 hover:bg-primary-100 border-primary-100"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewMetrics() {
  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 h-[120px] flex items-center justify-center">
              <div className="h-6 bg-neutral-200 animate-pulse rounded w-24"/>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Applicants"
        value={metrics?.totalApplicants || 0}
        description="from past 24 hours"
        icon={<Users className="h-5 w-5 text-primary-600" />}
        trend={{ value: 24, positive: true }}
      />

      <MetricCard
        title="Top Tier Candidates"
        value={metrics?.topTierCount || 0}
        description={`AI-recommended (${metrics?.topTierPercentage || 0}%)`}
        icon={<Award className="h-5 w-5 text-secondary-600" />}
        actionLabel="View All"
        onAction={() => window.location.href = "/applicants/top-tier"}
      />

      <MetricCard
        title="Next Round Waitlist"
        value={metrics?.waitlistCount || 0}
        description="candidates pending review"
        icon={<Clock className="h-5 w-5 text-neutral-600" />}
        actionLabel="Schedule"
        onAction={() => window.location.href = "/schedule-interviews"}
      />
    </div>
  );
}
