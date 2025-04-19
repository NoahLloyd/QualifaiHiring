import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
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

  const handleCompare = () => {
    if (!topPicks || !Array.isArray(topPicks) || topPicks.length < 2) return;
    const ids = topPicks.slice(0, 2).map((candidate: any) => candidate.id);
    setLocation(`/compare?candidates=${ids.join(',')}`);
  };

  // Sample candidate data for the mockup
  const mockCandidates = [
    {
      id: 1,
      name: "Jose Flores",
      matchScore: 99,
      insight: "Unique Insight",
      summary: "Brings a strong design eye with a mix of technical skills.",
      experience: "5 years experience. B.A. in Cognitive Science, University of North Carolina",
      skills: ["Design Systems", "Visual Design", "Sketch", "Figma"],
      years: "5 years"
    },
    {
      id: 2,
      name: "John Clark",
      matchScore: 99,
      insight: "Unique Insight",
      summary: "Strong design skills with extensive full-stack experience.",
      experience: "4 years experience. B.S. in Computer Science, University of S. California",
      skills: ["Design Systems", "Engineering", "Full-stack", "Figma"],
      years: "4 years"
    },
    {
      id: 3,
      name: "Yan Wei",
      matchScore: 99,
      insight: "Unique Insight",
      summary: "Brings a strong design eye with a mix of technical skills.",
      experience: "5 years experience. B.S. in Engineering, Boston University",
      skills: ["Design Systems", "Visual Design", "Sketch", "Figma"],
      years: "5 years"
    },
    {
      id: 4,
      name: "Haruka Singh",
      matchScore: 99,
      insight: "Unique Insight",
      summary: "Brings a strong design eye with a mix of technical skills.",
      experience: "3 years experience. B.A. in Cognitive Science, University of North Carolina",
      skills: ["Design Systems", "Visual Design", "Sketch", "Figma"],
      years: "3 years"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Top 5 Daily Picks</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-8 px-4 text-sm">Compare</Button>
          <Button variant="outline" size="sm" className="h-8 px-4 text-sm">Manage</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-40 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {mockCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{candidate.name}</div>
                  <div className="flex items-center">
                    <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5 font-medium">
                      {candidate.matchScore}% Match
                    </span>
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M10 4L5 9M10 4L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs text-blue-500">{candidate.insight}</span>
                </div>
                
                <p className="text-xs text-gray-600 mb-3">{candidate.summary}</p>
                
                <p className="text-xs mb-2">{candidate.experience}</p>
                
                <div className="grid grid-cols-2 gap-x-4 text-xs">
                  {candidate.skills.slice(0, 2).map((skill, i) => (
                    <div key={`${candidate.id}-skill-${i}`} className="font-medium">{skill}</div>
                  ))}
                  {candidate.skills.slice(2, 4).map((skill, i) => (
                    <div key={`${candidate.id}-skill-2-${i}`} className="flex items-center">
                      <div className="font-medium text-gray-600">{skill}</div>
                      {i === 1 && <span className="ml-2 text-gray-500">{candidate.years}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Button 
          variant="ghost" 
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          onClick={() => setLocation(jobId ? `/jobs/${jobId}/top-candidates` : '/top-candidates')}
        >
          View All Candidates
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
