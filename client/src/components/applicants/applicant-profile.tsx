import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AvatarFallbackInitials } from "@/components/ui/avatar-fallback";
import { 
  User, FileBadge, Briefcase, Trophy, Star, 
  ThumbsUp, ThumbsDown, Clock, FileText, Send
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface ApplicantProfileProps {
  id: number;
}

export default function ApplicantProfile({ id }: ApplicantProfileProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  // Fetch applicant details
  const { data: applicant, isLoading } = useQuery({
    queryKey: [`/api/applicants/${id}`],
  });

  // Fetch applicant AI analysis
  const { data: aiAnalysis } = useQuery({
    queryKey: [`/api/applicants/${id}/ai-analysis`],
    enabled: !!applicant,
  });

  // Fetch applicant notes
  const { data: notes } = useQuery({
    queryKey: [`/api/applicants/${id}/notes`],
    enabled: !!applicant,
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/applicants/${id}/notes`, { content });
    },
    onSuccess: () => {
      toast({
        title: "Note added",
        description: "Your note has been successfully added.",
      });
      setNewNote("");
      queryClient.invalidateQueries({ queryKey: [`/api/applicants/${id}/notes`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update applicant status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("PATCH", `/api/applicants/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Applicant status has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/applicants/${id}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

  const handleUpdateStatus = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  if (isLoading || !applicant) {
    return <div>Loading applicant profile...</div>;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Avatar className="h-16 w-16 mr-4">
            <AvatarImage src={applicant.profilePicUrl || ""} alt={applicant.name} />
            <AvatarFallback>
              <AvatarFallbackInitials name={applicant.name} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{applicant.name}</h1>
            <div className="flex items-center mt-1">
              <Badge 
                variant="secondary" 
                className={
                  applicant.status === "shortlisted" ? "bg-blue-100 text-blue-800" :
                  applicant.status === "approved" ? "bg-green-100 text-green-800" :
                  applicant.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-neutral-100 text-neutral-800"
                }
              >
                {applicant.status}
              </Badge>
              {applicant.matchScore && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  {applicant.matchScore}% Match
                </Badge>
              )}
              <span className="ml-2 text-sm text-neutral-500">
                Applied {formatDate(applicant.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setLocation(`/compare?candidates=${id}`)}
          >
            Compare
          </Button>
          <Button
            variant="outline"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
            onClick={() => handleUpdateStatus("shortlisted")}
            disabled={applicant.status === "shortlisted"}
          >
            Shortlist
          </Button>
          <Button
            variant="outline"
            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
            onClick={() => handleUpdateStatus("approved")}
            disabled={applicant.status === "approved"}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            onClick={() => handleUpdateStatus("rejected")}
            disabled={applicant.status === "rejected"}
          >
            Reject
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="notes">Notes & History</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                    <p className="mt-1">{applicant.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Phone</h3>
                    <p className="mt-1">{applicant.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Experience</h3>
                    <p className="mt-1">{applicant.experience} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Education</h3>
                    <p className="mt-1">{applicant.education || "Not provided"}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {applicant.skills?.map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-primary-50 text-primary-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center border-8 border-primary-100 mb-4">
                    <span className="text-3xl font-bold text-primary-700">
                      {applicant.matchScore || 0}%
                    </span>
                  </div>
                  <p className="text-sm text-center text-neutral-500">
                    AI-calculated match score based on job requirements and applicant qualifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-6">
          {aiAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-neutral-800">{aiAnalysis.summary}</p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
                        <ThumbsUp className="mr-2 h-4 w-4 text-green-600" />
                        Strengths
                      </h3>
                      <ul className="list-disc list-inside text-neutral-800 space-y-1">
                        {aiAnalysis.strengths?.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
                        <ThumbsDown className="mr-2 h-4 w-4 text-red-600" />
                        Areas for Improvement
                      </h3>
                      <ul className="list-disc list-inside text-neutral-800 space-y-1">
                        {aiAnalysis.weaknesses?.map((weakness, i) => (
                          <li key={i}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {aiAnalysis.recommendations && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-neutral-700 mb-2">Recommendations</h3>
                      <p className="text-neutral-800">{aiAnalysis.recommendations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5" />
                      Skills Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(aiAnalysis.skills || {}).map(([skill, score]) => (
                        <div key={skill}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-neutral-700">{skill}</span>
                            <span className="text-sm font-medium text-neutral-700">{score}/10</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${(score as number) * 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Experience Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(aiAnalysis.experience || {}).map(([title, details]: [string, any]) => (
                        <div key={title}>
                          <h4 className="text-sm font-medium text-neutral-800">{title}</h4>
                          <p className="text-sm text-neutral-600">{details.company || ''}</p>
                          {details.highlights && (
                            <ul className="mt-1 text-sm text-neutral-700 list-disc list-inside">
                              {details.highlights.map((highlight: string, i: number) => (
                                <li key={i}>{highlight}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <p className="text-neutral-500">No AI analysis available for this applicant.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {notes?.length > 0 ? (
                  notes.map((note: any) => (
                    <div key={note.id} className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>
                              <AvatarFallbackInitials name={note.user?.fullName || "User"} />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{note.user?.fullName || "User"}</span>
                        </div>
                        <span className="text-xs text-neutral-500">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-neutral-700">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500">No notes yet for this applicant.</p>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Add a Note</h3>
                <Textarea
                  placeholder="Type your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {addNoteMutation.isPending ? "Saving..." : "Add Note"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {applicant.resumeUrl ? (
                <div className="flex flex-col items-center justify-center">
                  <iframe
                    src={applicant.resumeUrl}
                    className="w-full h-[800px] border rounded-md"
                    title={`${applicant.name}'s Resume`}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileBadge className="h-16 w-16 text-neutral-300 mb-4" />
                  <p className="text-neutral-500">No resume available for this applicant.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
