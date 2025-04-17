import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ApplicantProfile from "@/components/applicants/applicant-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface ApplicantDetailProps {
  id: number;
}

export default function ApplicantDetail({ id }: ApplicantDetailProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch applicant job details to get back link information
  const { data: applicantJob, isLoading: jobLoading } = useQuery({
    queryKey: [`/api/applicants/${id}/job`],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load applicant job information",
        variant: "destructive",
      });
    }
  });

  const handleBack = () => {
    if (applicantJob) {
      setLocation(`/jobs/${applicantJob.id}`);
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {jobLoading ? "Job" : applicantJob?.title || "Dashboard"}
        </Button>
        
        <h1 className="text-2xl font-bold">Applicant Details</h1>
      </div>

      {/* Applicant Profile */}
      <ApplicantProfile id={id} />
    </div>
  );
}
