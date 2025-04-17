import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewMetrics from "@/components/dashboard/overview-metrics";
import TopPicks from "@/components/dashboard/top-picks";
import TrendChart from "@/components/dashboard/trend-chart";
import ApplicantsTable from "@/components/applicants/applicants-table";
import ApplicantFilters from "@/components/applicants/applicant-filters";
import CompareCandidates from "@/components/comparisons/compare-candidates";
import AiAssistant from "@/components/ai/ai-assistant";
import SkillGapAnalysis from "@/components/ai/skill-gap-analysis";

interface JobOverviewProps {
  jobId: number;
}

export default function JobOverview({ jobId }: JobOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [applicantFilters, setApplicantFilters] = useState<any[]>([]);

  // Fetch job details
  const { data: job, isLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
  });

  if (isLoading) {
    return <div>Loading job details...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{job?.title || "Job Overview"}</h1>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <OverviewMetrics />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopPicks jobId={jobId} />
              </div>
              
              <div>
                <TrendChart 
                  jobId={jobId}
                  title="Application Trends"
                  endpoint="application-trends"
                  type="line"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Applicants Tab Content */}
        <TabsContent value="applicants">
          <div className="space-y-6">
            <ApplicantFilters 
              jobId={jobId} 
              onFilterChange={setApplicantFilters} 
            />
            <ApplicantsTable jobId={jobId} />
          </div>
        </TabsContent>

        {/* Comparisons Tab Content */}
        <TabsContent value="comparisons">
          <CompareCandidates jobId={jobId} />
        </TabsContent>

        {/* AI Insights Tab Content */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <TrendChart 
                  jobId={jobId}
                  title="Application Trend Insights"
                  endpoint="application-insights"
                  type="bar"
                />
                
                <TrendChart 
                  jobId={jobId}
                  title="Skills Distribution Among Top Candidates"
                  endpoint="skills-distribution"
                  type="pie"
                />
                
                <SkillGapAnalysis jobId={jobId} />
              </div>
            </div>
            
            <div>
              <AiAssistant jobId={jobId} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
