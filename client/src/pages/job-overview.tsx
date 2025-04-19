import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import TopPicks from "@/components/dashboard/top-picks";
import ApplicantsTable from "@/components/applicants/applicants-table";
import ApplicantFilters from "@/components/applicants/applicant-filters";
import CompareCandidates from "@/components/comparisons/compare-candidates";
import AiAssistant from "@/components/ai/ai-assistant";
import SkillGapAnalysis from "@/components/ai/skill-gap-analysis";
import { format } from "date-fns";

interface JobOverviewProps {
  jobId: number;
}

export default function JobOverview({ jobId }: JobOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [applicantFilters, setApplicantFilters] = useState<any[]>([]);

  // Fetch job details
  const { data: job, isLoading } = useQuery<any>({
    queryKey: [`/api/jobs/${jobId}`],
  });

  if (isLoading) {
    return <div>Loading job details...</div>;
  }

  // Format date as "Posted MM/DD/YYYY"
  const formattedDate = job && job.createdAt 
    ? `Posted ${format(new Date(job.createdAt), 'M/d/yyyy')}`
    : "Posted 4/17/2025";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{job?.title || "Job Overview"}</h1>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
          <Badge variant="outline" className="border-gray-300 text-gray-700">1 week</Badge>
        </div>
      </div>
      <p className="text-sm text-gray-500">{formattedDate}</p>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 border-b w-full justify-start rounded-none h-10 bg-transparent p-0">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="applicants" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Applicants</TabsTrigger>
          <TabsTrigger value="compare" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Compare</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Insights</TabsTrigger>
          <TabsTrigger value="manage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Manage</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* New Applicants Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">New Applicants</CardTitle>
                <Users className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">50</div>
                  <p className="text-sm text-gray-500">last 24 hours</p>
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="outline" size="sm" className="w-full">Review</Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Meetings Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Today's Meetings</CardTitle>
                <Calendar className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">3</div>
                  <p className="text-sm text-gray-500">scheduled interviews</p>
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="outline" size="sm" className="w-full">View</Button>
                </div>
              </CardContent>
            </Card>

            {/* Follow-ups Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Follow-ups</CardTitle>
                <MessageSquare className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">7</div>
                  <p className="text-sm text-gray-500">pending responses</p>
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="outline" size="sm" className="w-full">Messages</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TopPicks jobId={jobId} />
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Hiring Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <div className="font-medium">1st Round</div>
                      <div className="text-gray-500">Screening & Demos</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Alex Morgan" className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="text-sm font-medium">Alex Morgan</div>
                            <div className="text-xs text-gray-500">Recruiter</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">5 Active</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="https://randomuser.me/api/portraits/women/67.jpg" alt="Tina Ray" className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="text-sm font-medium">Tina Ray</div>
                            <div className="text-xs text-gray-500">Sr. Recruiter</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">3 Active</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <div className="font-medium">2nd Round</div>
                      <div className="text-gray-500">Live Interview</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="Joshua Sanchez" className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="text-sm font-medium">Joshua Sanchez</div>
                            <div className="text-xs text-gray-500">Lead Engineer</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">2 Active</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="https://randomuser.me/api/portraits/men/36.jpg" alt="Micah Weis" className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="text-sm font-medium">Micah Weis</div>
                            <div className="text-xs text-gray-500">Lead Designer</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">4 Active</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <div className="font-medium">3rd Round</div>
                      <div className="text-gray-500">Culture Fit</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="https://randomuser.me/api/portraits/women/22.jpg" alt="Katy Sue" className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="text-sm font-medium">Katy Sue</div>
                            <div className="text-xs text-gray-500">Head of Product</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">3 Active</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="Andrew Torres" className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="text-sm font-medium">Andrew Torres</div>
                            <div className="text-xs text-gray-500">Head of Engineering</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">2 Active</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Applicant Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square relative">
                    <canvas id="applicantSourcesChart" width="100%" height="100%"></canvas>
                    {/* Chart will be rendered here */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3/4 h-3/4 rounded-full" style={{ 
                          background: "conic-gradient(#3B82F6 0% 45%, #F97316 45% 75%, #22C55E 75% 90%, #EF4444 90% 100%)",
                          position: "relative" 
                        }}>
                          <div className="absolute inset-[15%] bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>LinkedIn</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span>Indeed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Greenhouse</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Referral</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-800 flex items-center">
              View All Candidates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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

        {/* Compare Tab Content */}
        <TabsContent value="compare">
          <CompareCandidates jobId={jobId} />
        </TabsContent>

        {/* Insights Tab Content */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <SkillGapAnalysis jobId={jobId} />
              </div>
            </div>
            
            <div>
              <AiAssistant jobId={jobId} />
            </div>
          </div>
        </TabsContent>

        {/* Manage Tab Content */}
        <TabsContent value="manage">
          <div className="p-12 text-center text-gray-500 border border-dashed rounded-lg">
            <h3 className="text-lg font-medium mb-2">Job Management</h3>
            <p>Edit job details, update requirements, and manage hiring workflow.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
