import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import OverviewMetrics from "@/components/dashboard/overview-metrics";
import TopPicks from "@/components/dashboard/top-picks";
import TrendChart from "@/components/dashboard/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch job listings
  const { data: jobListings, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs'],
  });

  const handleViewJob = (jobId: number) => {
    setLocation(`/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Overview Metrics */}
      <OverviewMetrics />

      {/* Top Picks and Application Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopPicks />
        </div>
        
        <div>
          <TrendChart 
            title="Application Trends"
            endpoint="application-trends"
            type="line"
          />
        </div>
      </div>

      {/* Job Listings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Job Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : jobListings?.length ? (
            jobListings.map((job: any) => (
              <Card 
                key={job.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewJob(job.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {job.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {job.applicantsCount} applicants
                    </span>
                    <span className="text-sm text-neutral-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <p className="text-neutral-500 mb-4">No active job listings found</p>
                <button 
                  className="text-primary-600 hover:text-primary-800 font-medium"
                  onClick={() => setLocation('/jobs/new')}
                >
                  Create a new job listing
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
