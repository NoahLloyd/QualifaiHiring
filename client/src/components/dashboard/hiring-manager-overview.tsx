import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Mail, Clock, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// This component would use real data from an API in production
// For now, we're using mock data for the UI
const mockManagerStats = {
  todayMeetings: 3,
  pendingReviews: 42,
  reviewProgress: 65, // percentage
  followUps: 7,
  teamMembers: [
    { id: 1, name: "Alex Morgan", role: "Sr. Recruiter", applicantsHandling: 24 },
    { id: 2, name: "Jamie Lee", role: "Recruiter", applicantsHandling: 18 },
    { id: 3, name: "Sam Taylor", role: "HR Specialist", applicantsHandling: 12 }
  ]
};

export default function HiringManagerOverview() {
  const [, setLocation] = useLocation();

  // In a real implementation, we would fetch from the API
  // const { data: managerStats, isLoading } = useQuery({
  //   queryKey: ['/api/manager/stats'],
  // });
  
  // Using mock data for now
  const managerStats = mockManagerStats;
  const isLoading = false;

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-800">Hiring Manager Overview</CardTitle>
      </CardHeader>

      {isLoading ? (
        <CardContent className="py-4">
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="pt-4 pb-0">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-neutral-700">
                  <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                  <span className="text-sm font-medium">Today's Meetings</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-neutral-900 mr-2">{managerStats.todayMeetings}</span>
                  <span className="text-sm text-neutral-500">scheduled</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-600 p-0 h-auto mt-1 justify-start hover:bg-transparent"
                  onClick={() => setLocation('/calendar')}
                >
                  View Calendar
                </Button>
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-neutral-700">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">Follow-ups</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-neutral-900 mr-2">{managerStats.followUps}</span>
                  <span className="text-sm text-neutral-500">pending</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 p-0 h-auto mt-1 justify-start hover:bg-transparent"
                  onClick={() => setLocation('/emails')}
                >
                  Send Emails
                </Button>
              </div>
            </div>
            
            <div className="border-t border-b border-neutral-100 py-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center text-neutral-700">
                  <FileText className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-sm font-medium">Pending Reviews</span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">
                  {managerStats.pendingReviews} Applicants
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Review Progress</span>
                  <span>{managerStats.reviewProgress}%</span>
                </div>
                <Progress value={managerStats.reviewProgress} className="h-2" />
              </div>
              <div className="text-xs text-neutral-500 mt-2 flex justify-between">
                <span>Goal: 15 reviews/day</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-amber-600 p-0 h-auto text-xs hover:bg-transparent"
                  onClick={() => setLocation('/applicants?status=new')}
                >
                  Review Now
                </Button>
              </div>
            </div>
            
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Hiring Team Workload</h4>
            <div className="space-y-3">
              {managerStats.teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium text-sm mr-3">
                      {member.name.charAt(0)}{member.name.split(' ')[1].charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-800">{member.name}</div>
                      <div className="text-xs text-neutral-500">{member.role}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-neutral-50">
                    {member.applicantsHandling} Applicants
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="px-6 py-3 bg-neutral-50 border-t border-neutral-200">
            <Button 
              variant="ghost" 
              className="w-full py-2 text-primary-700 hover:text-primary-800"
              onClick={() => setLocation('/team')}
            >
              View Team Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}