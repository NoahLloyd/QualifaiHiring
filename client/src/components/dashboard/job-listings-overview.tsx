import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";

export default function JobListingsOverview() {
  const [, setLocation] = useLocation();

  // Fetch job listings
  const { data: jobListings, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs'],
  });

  const handleViewJob = (jobId: number) => {
    setLocation(`/jobs/${jobId}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium">Active Job Listings</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-primary-600"
          onClick={() => setLocation('/jobs/new')}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : jobListings?.length ? (
            jobListings.map((job: any) => (
              <div 
                key={job.id} 
                className="border border-neutral-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewJob(job.id)}
              >
                <h3 className="font-medium text-neutral-900 mb-1">{job.title}</h3>
                <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                  {job.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                      {job.applicantsCount} applicants
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      {job.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-neutral-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed border-neutral-300 rounded-lg">
              <p className="text-neutral-500 mb-4">No active job listings found</p>
              <Button 
                variant="outline"
                className="text-primary-600 border-primary-200"
                onClick={() => setLocation('/jobs/new')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create a new job listing
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}