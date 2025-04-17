import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import CompareCandidates from "@/components/comparisons/compare-candidates";

export default function Compare() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [initialCandidates, setInitialCandidates] = useState<number[]>([]);
  const [jobId, setJobId] = useState<number | undefined>(undefined);

  // Parse query params on component mount
  useEffect(() => {
    const params = new URLSearchParams(search);
    
    // Check for candidates parameter
    const candidatesParam = params.get('candidates');
    if (candidatesParam) {
      try {
        // If single value, convert to array
        if (!candidatesParam.includes(',')) {
          setInitialCandidates([parseInt(candidatesParam)]);
        } else {
          // If comma-separated list, parse as array
          const candidateIds = candidatesParam.split(',').map(id => parseInt(id.trim()));
          setInitialCandidates(candidateIds.filter(id => !isNaN(id)));
        }
      } catch (error) {
        toast({
          title: "Invalid candidate IDs",
          description: "The candidate IDs provided in the URL are invalid",
          variant: "destructive",
        });
      }
    }
    
    // Check for job ID parameter
    const jobIdParam = params.get('jobId');
    if (jobIdParam) {
      try {
        setJobId(parseInt(jobIdParam));
      } catch (error) {
        console.error("Invalid job ID:", error);
      }
    }
  }, [search, toast]);

  const handleBack = () => {
    if (jobId) {
      setLocation(`/jobs/${jobId}`);
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {jobId ? "Job" : "Dashboard"}
        </Button>
        
        <h1 className="text-2xl font-bold">Compare Candidates</h1>
      </div>

      {/* Compare Candidates Component */}
      <CompareCandidates 
        jobId={jobId} 
        initialCandidates={initialCandidates}
      />
    </div>
  );
}
