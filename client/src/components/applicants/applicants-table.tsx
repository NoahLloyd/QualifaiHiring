import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Eye, FilePlus, Check, X } from "lucide-react";
import { AvatarFallbackInitials } from "@/components/ui/avatar-fallback";
import type { ColumnDef } from "@tanstack/react-table";
import type { Applicant } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface ApplicantsTableProps {
  jobId?: number;
  status?: string;
}

// Categories for match score ranges
const MATCH_CATEGORIES = {
  GREAT_FIT: { min: 95, label: "Great Fit (95%+)" },
  GOOD_FIT: { min: 51, max: 94, label: "Good Fit (51-94%)" },
  NOT_GOOD_FIT: { min: 30, max: 50, label: "Not a Good Fit (30-50%)" },
  POOR_FIT: { max: 29, label: "Poor Fit (<30%)" }
};

export default function ApplicantsTable({ jobId, status }: ApplicantsTableProps) {
  const [, setLocation] = useLocation();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeMatchTab, setActiveMatchTab] = useState("all");

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
  
  // Function to filter applicants based on match score category
  const filterApplicantsByMatchCategory = (category: string): Applicant[] => {
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
          return score >= MATCH_CATEGORIES.GOOD_FIT.min && score <= MATCH_CATEGORIES.GOOD_FIT.max;
        case "not-good-fit":
          return score >= MATCH_CATEGORIES.NOT_GOOD_FIT.min && score <= MATCH_CATEGORIES.NOT_GOOD_FIT.max;
        case "poor-fit":
          return score <= MATCH_CATEGORIES.POOR_FIT.max;
        default:
          return true;
      }
    });
  };

  const columns: ColumnDef<Applicant>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Candidate",
      cell: ({ row }) => {
        const applicant = row.original;
        return (
          <div className="flex items-center">
            <div>
              <div className="text-base font-medium text-neutral-900">{applicant.name}</div>
              <div className="text-sm text-neutral-500">{applicant.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "skills",
      header: "Skills",
      cell: ({ row }) => {
        const skills = row.original.skills || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {skills.slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-100">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="bg-neutral-50 text-neutral-700">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "uniqueInsight",
      header: "Key Quality",
      cell: ({ row }) => {
        const applicant = row.original;
        
        // Create a concise, one-sentence unique insight using semantic reasoning
        let insight = "";
        const skills = applicant.skills || [];
        const experience = applicant.experience || 0;
        const education = applicant.education || "";
        
        // Personality traits mapped from skills and experience
        const personalityTraits: Record<string, string> = {
          "UI/UX Design": "human-centered thinker",
          "Design Systems": "systematic problem solver",
          "Visual Design": "visual storyteller",
          "UX Research": "empathetic listener",
          "Interaction Design": "intuitive experience creator",
          "Prototype": "iterative innovator",
          "Web Design": "digital craftsperson",
          "Figma": "collaborative designer",
          "Sketch": "detail-oriented visualizer",
          "Product Design": "user advocate",
          "JavaScript": "logical thinker",
          "HTML": "structure-focused builder",
          "CSS": "aesthetic implementer",
          "React": "component-minded creator",
          "User Testing": "feedback-driven improver",
          "Design Thinking": "creative problem solver",
          "Wireframing": "conceptual architect"
        };
        
        // Choose a trait based on skills or randomly select one general trait if no match
        let trait = "";
        if (skills.length > 0) {
          for (const skill of skills) {
            if (skill && personalityTraits[skill]) {
              trait = personalityTraits[skill];
              break;
            }
          }
        }
        
        if (!trait) {
          // Default traits based on years of experience
          if (experience > 10) {
            trait = "seasoned industry veteran";
          } else if (experience > 5) {
            trait = "accomplished practitioner";
          } else {
            trait = "fresh perspective bringer";
          }
        }
        
        // Educational background as a modifier
        let educationInsight = "";
        if (education) {
          if (education.includes("Computer Science") || education.includes("Software")) {
            educationInsight = "technical foundation";
          } else if (education.includes("Design") || education.includes("Art")) {
            educationInsight = "creative background";
          } else if (education.includes("Business") || education.includes("MBA")) {
            educationInsight = "business-minded approach";
          } else if (education.includes("Psychology") || education.includes("Cognitive")) {
            educationInsight = "psychological understanding";
          }
        }
        
        // Create a very short, concise insight (no truncation)
        if (educationInsight) {
          insight = `${trait.charAt(0).toUpperCase() + trait.slice(1)} with ${educationInsight} background.`;
        } else if (experience > 0) {
          insight = `${trait.charAt(0).toUpperCase() + trait.slice(1)} with ${experience} years in the field.`;
        } else {
          insight = `${trait.charAt(0).toUpperCase() + trait.slice(1)} with fresh perspective.`;
        }
        
        return (
          <div className="max-w-md">
            <div className="text-sm text-neutral-900">{insight}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "matchScore",
      header: "Match Score",
      cell: ({ row }) => {
        const score = row.original.matchScore || 0;
        let bgColor = "bg-red-100 text-red-800";
        if (score >= 80) bgColor = "bg-green-100 text-green-800";
        else if (score >= 60) bgColor = "bg-yellow-100 text-yellow-800";
        
        return (
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {score}%
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let statusColor = "";
        
        switch (status) {
          case "new":
            statusColor = "bg-neutral-100 text-neutral-800";
            break;
          case "shortlisted":
            statusColor = "bg-blue-100 text-blue-800";
            break;
          case "approved":
            statusColor = "bg-green-100 text-green-800";
            break;
          case "rejected":
            statusColor = "bg-red-100 text-red-800";
            break;
          default:
            statusColor = "bg-neutral-100 text-neutral-800";
        }
        
        return (
          <Badge className={`${statusColor} capitalize`}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const applicant = row.original;
        
        return (
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-900"
              onClick={() => setLocation(`/applicants/${applicant.id}`)}
            >
              View
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setLocation(`/applicants/${applicant.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation(`/applicants/${applicant.id}/notes`)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add note
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {applicant.status !== "shortlisted" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "shortlisted")}>
                    <Check className="mr-2 h-4 w-4" />
                    Shortlist
                  </DropdownMenuItem>
                )}
                {applicant.status !== "approved" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "approved")}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Approve
                  </DropdownMenuItem>
                )}
                {applicant.status !== "rejected" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "rejected")}>
                    <X className="mr-2 h-4 w-4 text-red-600" />
                    Reject
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <div>Loading applicants...</div>;
  }

  // Count applicants in each category
  const greatFitCount = filterApplicantsByMatchCategory("great-fit").length;
  const goodFitCount = filterApplicantsByMatchCategory("good-fit").length;
  const notGoodFitCount = filterApplicantsByMatchCategory("not-good-fit").length;
  const poorFitCount = filterApplicantsByMatchCategory("poor-fit").length;
  
  const filteredApplicants = filterApplicantsByMatchCategory(activeMatchTab);

  // Count applicants by status
  const newCount = applicants.filter(a => a.status === 'new').length;
  const shortlistedCount = applicants.filter(a => a.status === 'shortlisted').length;
  const approvedCount = applicants.filter(a => a.status === 'approved').length;
  const rejectedCount = applicants.filter(a => a.status === 'rejected').length;
  
  // State for status-based filtering
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  
  // Apply status filter if selected
  let displayedApplicants = filteredApplicants;
  if (activeStatusFilter) {
    displayedApplicants = displayedApplicants.filter(a => a.status === activeStatusFilter);
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={activeStatusFilter === null ? "default" : "outline"}
            onClick={() => setActiveStatusFilter(null)}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={activeStatusFilter === 'new' ? "default" : "outline"}
            onClick={() => setActiveStatusFilter('new')}
            className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900 border-neutral-200"
          >
            New ({newCount})
          </Button>
          <Button 
            size="sm" 
            variant={activeStatusFilter === 'shortlisted' ? "default" : "outline"}
            onClick={() => setActiveStatusFilter('shortlisted')}
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 border-blue-200"
          >
            Shortlisted ({shortlistedCount})
          </Button>
          <Button 
            size="sm" 
            variant={activeStatusFilter === 'approved' ? "default" : "outline"}
            onClick={() => setActiveStatusFilter('approved')}
            className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 border-green-200"
          >
            Approved ({approvedCount})
          </Button>
          <Button 
            size="sm" 
            variant={activeStatusFilter === 'rejected' ? "default" : "outline"}
            onClick={() => setActiveStatusFilter('rejected')}
            className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 border-red-200"
          >
            Rejected ({rejectedCount})
          </Button>
        </div>
        {selectedRows.length > 0 && (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => {
              selectedRows.forEach(id => handleStatusChange(id, 'shortlisted'));
              setSelectedRows([]);
            }}>
              <Check className="mr-2 h-4 w-4" />
              Shortlist Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              selectedRows.forEach(id => handleStatusChange(id, 'approved'));
              setSelectedRows([]);
            }}>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Approve Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              selectedRows.forEach(id => handleStatusChange(id, 'rejected'));
              setSelectedRows([]);
            }}>
              <X className="mr-2 h-4 w-4 text-red-600" />
              Reject Selected
            </Button>
          </div>
        )}
      </div>
      
      <Card className="shadow-sm">
        <Tabs value={activeMatchTab} onValueChange={setActiveMatchTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-b-none">
            <TabsTrigger value="all" className="text-sm">
              All Applicants ({applicants.length})
            </TabsTrigger>
            <TabsTrigger value="great-fit" className="text-sm bg-green-50 data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
              Great Fit ({greatFitCount})
            </TabsTrigger>
            <TabsTrigger value="good-fit" className="text-sm bg-yellow-50 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900">
              Good Fit ({goodFitCount})
            </TabsTrigger>
            <TabsTrigger value="not-good-fit" className="text-sm bg-red-50 data-[state=active]:bg-red-100 data-[state=active]:text-red-900">
              Not a Good Fit ({notGoodFitCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeMatchTab} className="m-0 p-0">
            <DataTable
              columns={columns}
              data={displayedApplicants}
              filterColumn="name"
              filterPlaceholder="Search by name or skill..."
              onRowSelectionChange={(rows: Record<string, boolean>) => {
                setSelectedRows(
                  Object.keys(rows)
                    .filter(key => rows[key])
                    .map(key => parseInt(key, 10))
                );
              }}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
