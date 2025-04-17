import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateCard } from "../ui/candidate-card";
import { useLocation } from "wouter";

export default function TopPicks({ jobId }: { jobId?: number }) {
  const [, setLocation] = useLocation();

  // Fetch top candidates
  const { data: topPicks, isLoading } = useQuery({
    queryKey: [jobId ? `/api/jobs/${jobId}/top-picks` : '/api/top-picks'],
  });

  const handleViewCandidate = (id: number) => {
    setLocation(`/applicants/${id}`);
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-800">Top 5 Daily Picks</h3>
          <div className="flex items-center text-sm text-neutral-600">
            <span>AI Processed</span>
            <span className="ml-2 flex h-4 w-4 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500"></span>
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 p-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-6 w-[100px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {topPicks?.map((candidate: any) => (
            <div key={candidate.id} className="border-b border-neutral-200 last:border-0">
              <CandidateCard 
                candidate={candidate}
                onView={handleViewCandidate}
              />
            </div>
          ))}
        </div>
      )}

      <CardFooter className="px-6 py-3 bg-neutral-50 border-t border-neutral-200">
        <Button 
          variant="ghost" 
          className="w-full py-2 text-primary-700 hover:text-primary-800"
          onClick={() => setLocation(jobId ? `/jobs/${jobId}/top-candidates` : '/top-candidates')}
        >
          View All Top Candidates
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
