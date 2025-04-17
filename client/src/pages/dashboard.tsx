import OverviewMetrics from "@/components/dashboard/overview-metrics";
import HiringManagerOverview from "@/components/dashboard/hiring-manager-overview";
import JobListingsOverview from "@/components/dashboard/job-listings-overview";
import TrendChart from "@/components/dashboard/trend-chart";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Overview Metrics - Personalized for Hiring Manager */}
      <OverviewMetrics />

      {/* Hiring Manager Overview and Application Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HiringManagerOverview />
        </div>
        
        <div>
          <TrendChart 
            title="Application Trends"
            endpoint="application-trends"
            type="line"
          />
        </div>
      </div>

      {/* Job Listings Overview */}
      <JobListingsOverview />
    </div>
  );
}
