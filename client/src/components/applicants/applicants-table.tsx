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
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={applicant.profilePicUrl || ""} alt={applicant.name} />
              <AvatarFallback>
                <AvatarFallbackInitials name={applicant.name} />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-neutral-900">{applicant.name}</div>
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
      accessorKey: "experience",
      header: "Experience",
      cell: ({ row }) => {
        const experience = row.original.experience || 0;
        return (
          <div>
            <div className="text-sm text-neutral-900">{experience} years</div>
            <div className="text-sm text-neutral-500">{row.original.education}</div>
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

  return (
    <Card className="shadow-sm">
      <Tabs value={activeMatchTab} onValueChange={setActiveMatchTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full rounded-b-none">
          <TabsTrigger value="all" className="text-sm">
            All Applicants ({applicants.length})
          </TabsTrigger>
          <TabsTrigger value="great-fit" className="text-sm">
            Great Fit ({greatFitCount})
          </TabsTrigger>
          <TabsTrigger value="good-fit" className="text-sm">
            Good Fit ({goodFitCount})
          </TabsTrigger>
          <TabsTrigger value="not-good-fit" className="text-sm">
            Not a Good Fit ({notGoodFitCount})
          </TabsTrigger>
          <TabsTrigger value="poor-fit" className="text-sm">
            Poor Fit ({poorFitCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeMatchTab} className="m-0 p-0">
          <DataTable
            columns={columns}
            data={filteredApplicants}
            filterColumn="name"
            filterPlaceholder="Search by name or skill..."
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
