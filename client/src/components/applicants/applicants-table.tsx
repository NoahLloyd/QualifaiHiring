import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Check, X, SlidersHorizontal } from "lucide-react";
import type { Applicant } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ApplicantsTableProps {
  jobId?: number;
  status?: string;
}

// Categories for match score ranges
const MATCH_CATEGORIES = {
  GREAT_FIT: { min: 95, label: "Great Fit" },
  GOOD_FIT: { min: 51, max: 94, label: "Good Fit" },
  NOT_GOOD_FIT: { min: 30, max: 50, label: "Not a Fit" }
};

export default function ApplicantsTable({ jobId, status }: ApplicantsTableProps) {
  const [, setLocation] = useLocation();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeMatchTab, setActiveMatchTab] = useState("all");
  const [filterText, setFilterText] = useState("");

  // Fetch applicants
  const { data: applicants = [], isLoading, refetch } = useQuery<Applicant[]>({
    queryKey: [jobId ? `/api/jobs/${jobId}/applicants${status ? `?status=${status}` : ''}` : `/api/applicants${status ? `?status=${status}` : ''}`],
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiRequest("PATCH", `/api/applicants/${id}/status`, { status: newStatus });
      refetch();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const viewApplicant = (id: number) => {
    setLocation(`/applicants/${id}`);
  };
  
  // Function to filter applicants based on match score category
  const filterApplicantsByMatchCategory = useCallback((category: string): Applicant[] => {
    if (!applicants.length) return [];
    
    // Make a copy of applicants and sort by match score (highest to lowest)
    const sortedApplicants = [...applicants].sort((a, b) => 
      (b.matchScore || 0) - (a.matchScore || 0)
    );
    
    if (category === "all") return sortedApplicants;
    
    return sortedApplicants.filter(applicant => {
      const score = applicant.matchScore || 0;
      
      switch(category) {
        case "great-fit":
          return score >= MATCH_CATEGORIES.GREAT_FIT.min;
        case "good-fit":
          return score >= MATCH_CATEGORIES.GOOD_FIT.min && score <= (MATCH_CATEGORIES.GOOD_FIT.max || 100);
        case "not-good-fit":
          return score >= MATCH_CATEGORIES.NOT_GOOD_FIT.min && score <= (MATCH_CATEGORIES.NOT_GOOD_FIT.max || 100);
        default:
          return true;
      }
    });
  }, [applicants]);

  // Count applicants in each category
  const greatFitCount = filterApplicantsByMatchCategory("great-fit").length;
  const goodFitCount = filterApplicantsByMatchCategory("good-fit").length;
  const notGoodFitCount = filterApplicantsByMatchCategory("not-good-fit").length;
  
  const filteredApplicants = filterApplicantsByMatchCategory(activeMatchTab);
  
  // Apply text search filter if entered
  const displayedApplicants = filteredApplicants.filter(applicant => {
    if (!filterText) return true;
    
    const searchText = filterText.toLowerCase();
    const name = applicant.name?.toLowerCase() || "";
    const email = applicant.email?.toLowerCase() || "";
    const skills = applicant.skills?.join(" ").toLowerCase() || "";
    
    return name.includes(searchText) || 
           email.includes(searchText) || 
           skills.includes(searchText);
  });

  if (isLoading) {
    return <div>Loading applicants...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search by name, skill, or keyword"
            className="pl-3 pr-10 py-2 border-gray-300 rounded-md"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white border-gray-300 text-gray-700"
          >
            Smart Sorting <span className="ml-1">↓</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
      </div>
      
      <Card className="shadow-sm border-0 overflow-hidden rounded-lg">
        <div className="flex w-full rounded-t-lg overflow-hidden">
          <div 
            className={`px-6 py-3 flex-1 text-center font-medium border-r border-gray-300 cursor-pointer ${activeMatchTab === 'all' ? 'bg-neutral-300' : 'bg-neutral-200'}`}
            onClick={() => setActiveMatchTab("all")}
          >
            All Applicants ({applicants.length})
          </div>
          <div 
            className={`px-6 py-3 flex-1 text-center font-medium border-r border-gray-300 cursor-pointer ${activeMatchTab === 'great-fit' ? 'bg-green-200' : 'bg-green-100'}`}
            onClick={() => setActiveMatchTab("great-fit")}
          >
            Great Fit ({greatFitCount})
          </div>
          <div 
            className={`px-6 py-3 flex-1 text-center font-medium border-r border-gray-300 cursor-pointer ${activeMatchTab === 'good-fit' ? 'bg-yellow-200' : 'bg-yellow-100'}`}
            onClick={() => setActiveMatchTab("good-fit")}
          >
            Good Fit ({goodFitCount})
          </div>
          <div 
            className={`px-6 py-3 flex-1 text-center font-medium cursor-pointer ${activeMatchTab === 'not-good-fit' ? 'bg-red-200' : 'bg-red-100'}`}
            onClick={() => setActiveMatchTab("not-good-fit")}
          >
            Not a Fit ({notGoodFitCount})
          </div>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-8">
                <Checkbox
                  checked={displayedApplicants.length > 0 && selectedRows.length === displayedApplicants.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(displayedApplicants.map(a => a.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Name & Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Key Skills</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Personal Insight</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Match</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedApplicants.map((applicant) => {
              // Get or generate insight based on skills and background
              let insight = "Systematic problem solver with psych and tech background.";
              
              // Status badge color
              let statusBadge = (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-full px-3 py-1 font-medium">
                  New
                </Badge>
              );
              
              if (applicant.status === "shortlisted") {
                statusBadge = (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full px-3 py-1 font-medium">
                    Shortlisted
                  </Badge>
                );
              } else if (applicant.status === "approved") {
                statusBadge = (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full px-3 py-1 font-medium">
                    Approved
                  </Badge>
                );
              } else if (applicant.status === "rejected") {
                statusBadge = (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200 rounded-full px-3 py-1 font-medium">
                    Rejected
                  </Badge>
                );
              }
              
              // Match score
              const score = applicant.matchScore || 0;
              let scoreColor = "bg-red-100 text-red-800";
              if (score >= 95) scoreColor = "bg-green-100 text-green-800";
              else if (score >= 85) scoreColor = "bg-green-100 text-green-800";
              else if (score >= 70) scoreColor = "bg-yellow-100 text-yellow-800";
              
              return (
                <tr key={applicant.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedRows.includes(applicant.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows([...selectedRows, applicant.id]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== applicant.id));
                        }
                      }}
                      aria-label={`Select ${applicant.name}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{applicant.name}</div>
                    <div className="text-sm text-gray-500">Product Engineer</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {(applicant.skills || []).slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-100 text-gray-800 border-0 hover:bg-gray-200 justify-start w-fit whitespace-nowrap">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className="text-sm text-gray-700 line-clamp-2">{insight}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={`${scoreColor} rounded-full px-3 py-1`}>
                      {score}%
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {statusBadge}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto bg-transparent hover:bg-transparent"
                        onClick={() => handleStatusChange(applicant.id, "approved")}
                      >
                        <Check className="h-5 w-5 text-green-600 hover:text-green-800" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto bg-transparent hover:bg-transparent"
                        onClick={() => viewApplicant(applicant.id)}
                      >
                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto bg-transparent hover:bg-transparent"
                        onClick={() => handleStatusChange(applicant.id, "rejected")}
                      >
                        <X className="h-5 w-5 text-red-600 hover:text-red-800" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="flex justify-center space-x-1 p-4 bg-white border-t border-gray-200">
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700">
            &lt; Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700">
            1
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700">
            2
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700">
            3
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700">
            Next &gt;
          </Button>
        </div>
      </Card>
    </div>
  );
}