import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { AvatarFallbackInitials } from "./avatar-fallback";
import { type Applicant } from "@shared/schema";

interface CandidateCardProps {
  candidate: Applicant & {
    summary?: string;
    matchScore?: number;
    aiAnalysis?: {
      strengths?: string[];
      skills?: string[];
    };
  };
  onView?: (id: number) => void;
  onShortlist?: (id: number) => void;
  onReject?: (id: number) => void;
}

export function CandidateCard({ candidate, onView, onShortlist, onReject }: CandidateCardProps) {
  return (
    <Card className="hover:bg-neutral-50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={candidate.profilePicUrl || ""} alt={candidate.name} />
            <AvatarFallback>
              <AvatarFallbackInitials name={candidate.name} />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-neutral-900">
                {candidate.name}
              </h4>
              <div className="flex items-center">
                {candidate.matchScore && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 mr-2">
                    {candidate.matchScore}% Match
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(candidate.id)}>
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onShortlist && (
                      <DropdownMenuItem onClick={() => onShortlist(candidate.id)}>
                        Shortlist
                      </DropdownMenuItem>
                    )}
                    {onReject && (
                      <DropdownMenuItem onClick={() => onReject(candidate.id)}>
                        Reject
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <p className="text-sm text-neutral-600 mb-2">
              {candidate.summary || `${candidate.experience || 0} years experience. ${candidate.education || ''}`}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {(candidate.aiAnalysis?.skills || candidate.skills || []).slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-100">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
