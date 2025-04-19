import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Calendar, Send, ArrowRight, Clock, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch dashboard metrics
  const { data: metrics = { totalApplicants: 500, topTierCount: 150, newApplicantCount: 50 }, isLoading: metricsLoading } = useQuery<any>({
    queryKey: ['/api/dashboard/metrics'],
  });

  // Fetch job listings
  const { data: jobListings = [], isLoading: jobsLoading } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
  });

  const mockReviewPercent = 65;
  const mockTeamMembers = [
    { id: 1, name: "Alex Morgan", role: "Sr. Recruiter", applicantsHandling: 24 },
    { id: 2, name: "Jamie Lee", role: "Hiring Manager", applicantsHandling: 18 },
    { id: 3, name: "Sam Taylor", role: "HR Specialist", applicantsHandling: 12 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hiring Dashboard</h1>
      
      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="text-gray-700 font-medium">Applicants to Review</h3>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold">50</span>
              <span className="text-sm text-gray-500">to stay on track</span>
              <div className="mt-auto pt-4">
                <Button 
                  variant="outline" 
                  className="bg-white text-gray-700 border-gray-300"
                  onClick={() => setLocation('/applicants?status=new')}
                >
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-gray-700 font-medium">Today's Meetings</h3>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold">3</span>
              <span className="text-sm text-gray-500">scheduled interviews</span>
              <div className="mt-auto pt-4">
                <Button 
                  variant="outline" 
                  className="bg-white text-gray-700 border-gray-300"
                  onClick={() => setLocation('/calendar')}
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Send className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-gray-700 font-medium">Follow-ups</h3>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold">7</span>
              <span className="text-sm text-gray-500">pending responses</span>
              <div className="mt-auto pt-4">
                <Button 
                  variant="outline" 
                  className="bg-white text-gray-700 border-gray-300"
                  onClick={() => setLocation('/messages')}
                >
                  Messages
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Job Listings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Active Job Listings</h2>
          <Button 
            size="sm" 
            onClick={() => setLocation('/jobs/new')}
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
            variant="outline"
          >
            <PlusCircle className="h-4 w-4" /> Create New
          </Button>
        </div>
        
        <Card className="border border-gray-200 p-0 shadow-sm">
          <CardContent className="p-0">
            <div className="space-y-0 divide-y divide-gray-200">
              {jobsLoading ? (
                <div className="p-6">Loading job listings...</div>
              ) : (
                jobListings.map((job: any) => (
                  <div key={job.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setLocation(`/jobs/${job.id}`)}>
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg mb-1">{job.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 border-0">1 week</Badge>
                        </div>
                      </div>
                      
                      <div className="flex mt-5 flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full">
                          {job.applicantsCount || 150} Applicants
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700 border-0 rounded-full">
                          {job.team || "Design Team"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 px-5 py-2 bg-gray-50 border-t border-gray-200 flex justify-end">
                      Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "4/17/2025"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Team Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Team Overview</h2>
        
        <Card className="border border-gray-200">
          <CardContent className="p-5">
            <div className="flex justify-between mb-1">
              <h3 className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                Reviews this week
              </h3>
              <Badge className="bg-gray-100 text-gray-700 border-0">
                42 Applicants
              </Badge>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Goal: 15 reviews/day - Almost there!</span>
                <span>{mockReviewPercent}%</span>
              </div>
              <Progress value={mockReviewPercent} className="h-2 bg-gray-200" indicatorClassName="bg-green-600" />
            </div>
            
            <h3 className="font-medium mb-4">Workload Distribution</h3>
            
            <div className="space-y-4">
              {mockTeamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm mr-3">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {member.applicantsHandling} Applicants
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setLocation('/team')}
            >
              View Team Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
