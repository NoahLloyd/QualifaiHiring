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
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800 text-2xl font-medium">Applicants to Review</h3>
            <div className="flex items-center justify-center w-8 h-8 bg-amber-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <div>
              <div className="text-5xl font-bold">50</div>
              <div className="text-gray-500 mt-1">to stay on track</div>
            </div>
            <div className="self-end">
              <Button 
                variant="outline" 
                className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 rounded-full px-6"
                onClick={() => setLocation('/applicants?status=new')}
              >
                Review
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800 text-2xl font-medium">Today's Meetings</h3>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <div>
              <div className="text-5xl font-bold">3</div>
              <div className="text-gray-500 mt-1">scheduled interviews</div>
            </div>
            <div className="self-end">
              <Button 
                variant="outline" 
                className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 rounded-full px-6"
                onClick={() => setLocation('/calendar')}
              >
                View
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800 text-2xl font-medium">Follow-ups</h3>
            <div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <div>
              <div className="text-5xl font-bold">7</div>
              <div className="text-gray-500 mt-1">pending responses</div>
            </div>
            <div className="self-end">
              <Button 
                variant="outline" 
                className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 rounded-full px-6"
                onClick={() => setLocation('/messages')}
              >
                Messages
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Job Listings */}
      <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
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
        
        <div className="space-y-4">
          {jobsLoading ? (
            <div className="p-6 text-center">Loading job listings...</div>
          ) : (
            jobListings.map((job: any, index: number) => (
              <div 
                key={job.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setLocation(`/jobs/${job.id}`)}
              >
                <div className="p-5 pb-2">
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
                  
                  <div className="flex justify-between mt-5 items-center">
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full">
                        {job.applicantsCount || (index === 0 ? "150" : index === 1 ? "100" : "50")} Applicants
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700 border-0 rounded-full">
                        {job.team || (index === 0 ? "Design Team" : index === 1 ? "QA Team" : "Engineering Team")}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "4/17/2025"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Team Overview */}
      <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Team Overview</h2>
        </div>
        
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <svg className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reviews this week
            </h3>
            <Badge className="bg-gray-100 text-gray-700 border-0">
              42 Applicants
            </Badge>
          </div>
          
          <div className="mb-6">
            <Progress value={mockReviewPercent} className="h-2 bg-gray-200 mb-2" indicatorClassName="bg-green-600" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Goal: 15 reviews/day - Almost there!</span>
              <span>{mockReviewPercent}%</span>
            </div>
          </div>
          
          <h3 className="font-medium mb-4">Workload Distribution</h3>
          
          <div className="space-y-4">
            {mockTeamMembers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full mr-3">
                    <img 
                      src={`https://randomuser.me/api/portraits/${index === 0 ? 'women' : 'men'}/${index + 10}.jpg`} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.role}</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                  {member.applicantsHandling} Applicants
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setLocation('/team')}
            >
              View Team Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
