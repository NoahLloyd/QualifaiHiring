import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarFallbackInitials } from "@/components/ui/avatar-fallback";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { compareApplicants } from "@/lib/openai";

interface CompareCandidatesProps {
  jobId?: number;
  initialCandidates?: number[];
}

export default function CompareCandidates({ jobId, initialCandidates = [] }: CompareCandidatesProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>(initialCandidates);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Fetch all available candidates for the select dropdowns
  const { data: availableCandidates } = useQuery({
    queryKey: [jobId ? `/api/jobs/${jobId}/applicants` : '/api/applicants'],
  });

  // Fetch detailed data for selected candidates
  const { data: candidateDetails, refetch: refetchCandidateDetails } = useQuery({
    queryKey: [`/api/applicants/details?ids=${selectedCandidates.join(',')}`],
    enabled: selectedCandidates.length > 0,
  });

  // Trigger fetch when selected candidates change
  useEffect(() => {
    if (selectedCandidates.length > 0) {
      refetchCandidateDetails();
    }
  }, [selectedCandidates, refetchCandidateDetails]);

  const handleCandidateSelect = (index: number, candidateId: number) => {
    const newSelectedCandidates = [...selectedCandidates];
    
    // If we're updating an existing slot
    if (index < newSelectedCandidates.length) {
      newSelectedCandidates[index] = candidateId;
    } 
    // If we're adding a new candidate
    else if (index === newSelectedCandidates.length) {
      newSelectedCandidates.push(candidateId);
    }
    
    setSelectedCandidates(newSelectedCandidates);
  };

  const handleAddCandidate = () => {
    // Only allow adding up to 3 candidates for comparison
    if (selectedCandidates.length < 3) {
      // If there are available candidates not already selected, add the first one
      const availableId = availableCandidates?.find(
        (c: any) => !selectedCandidates.includes(c.id)
      )?.id;
      
      if (availableId) {
        setSelectedCandidates([...selectedCandidates, availableId]);
      }
    }
  };

  const handleRemoveCandidate = (index: number) => {
    const newSelectedCandidates = [...selectedCandidates];
    newSelectedCandidates.splice(index, 1);
    setSelectedCandidates(newSelectedCandidates);
    
    // Clear comparison data if we no longer have enough candidates
    if (newSelectedCandidates.length < 2) {
      setComparisonData(null);
    }
  };

  const handleCompare = async () => {
    if (selectedCandidates.length < 2) {
      toast({
        title: "Cannot compare",
        description: "Please select at least two candidates to compare.",
        variant: "destructive",
      });
      return;
    }

    setIsComparing(true);
    try {
      const result = await compareApplicants(selectedCandidates);
      setComparisonData(result);
    } catch (error) {
      toast({
        title: "Comparison failed",
        description: "Failed to generate comparison. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const getCandidateById = (id: number) => {
    return candidateDetails?.find((c: any) => c.id === id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Compare Candidates</h1>
        
        {/* Candidate Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {selectedCandidates.map((candidateId, index) => {
            const candidate = getCandidateById(candidateId);
            return (
              <Card key={index} className="border border-neutral-200 rounded-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-neutral-800">
                      Candidate {index + 1}
                    </CardTitle>
                    <Select
                      value={candidateId.toString()}
                      onValueChange={(value) => handleCandidateSelect(index, parseInt(value))}
                    >
                      <SelectTrigger className="h-8 w-8 p-0 border-none">
                        <span className="sr-only">Select candidate</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </SelectTrigger>
                      <SelectContent align="end" className="min-w-[200px]">
                        {availableCandidates?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {candidate && (
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={candidate.profilePicUrl || ""} alt={candidate.name} />
                        <AvatarFallback>
                          <AvatarFallbackInitials name={candidate.name} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{candidate.name}</div>
                        <div className="flex items-center">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {candidate.matchScore}% Match
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-neutral-500 hover:text-red-600 px-2 h-7"
                    onClick={() => handleRemoveCandidate(index)}
                  >
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

          {selectedCandidates.length < 3 && (
            <Card className="border border-dashed border-neutral-300 rounded-lg">
              <CardContent className="flex items-center justify-center h-full min-h-[120px]">
                <Button
                  variant="ghost"
                  className="text-sm text-primary-600 font-medium flex items-center"
                  onClick={handleAddCandidate}
                >
                  <PlusCircle className="h-5 w-5 mr-1" />
                  Add Another Candidate
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {selectedCandidates.length >= 2 && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleCompare}
              disabled={isComparing}
              className="min-w-[200px]"
            >
              {isComparing ? "Comparing..." : "Compare Candidates"}
            </Button>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {comparisonData && candidateDetails && selectedCandidates.length >= 2 && (
        <Card className="overflow-x-auto bg-white">
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-neutral-100 px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-r border-neutral-200">
                    Comparison Category
                  </th>
                  {selectedCandidates.map((id, index) => {
                    const candidate = getCandidateById(id);
                    return (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
                        {candidate?.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                <tr>
                  <td className="sticky left-0 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-900 border-r border-neutral-200">
                    Experience
                  </td>
                  {selectedCandidates.map((id, index) => {
                    const candidate = getCandidateById(id);
                    return (
                      <td key={index} className="px-6 py-3 text-sm text-neutral-800">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                          {candidate?.experience} years
                        </span>
                        {candidate?.education && ` - ${candidate.education}`}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-900 border-r border-neutral-200">
                    Skills
                  </td>
                  {selectedCandidates.map((id, index) => {
                    const candidate = getCandidateById(id);
                    return (
                      <td key={index} className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {candidate?.skills?.map((skill: string, i: number) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className={
                                comparisonData.keyDifferences?.skills?.[i]?.includes(skill)
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-primary-50 text-primary-700 border-primary-100"
                              }
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-900 border-r border-neutral-200">
                    Match Score
                  </td>
                  {selectedCandidates.map((id, index) => {
                    const candidate = getCandidateById(id);
                    return (
                      <td key={index} className="px-6 py-3 text-sm text-neutral-800">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {candidate?.matchScore}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-900 border-r border-neutral-200">
                    AI Summary
                  </td>
                  {selectedCandidates.map((id, index) => {
                    const candidate = getCandidateById(id);
                    return (
                      <td key={index} className="px-6 py-3 text-sm text-neutral-800 bg-blue-50">
                        <p className="text-neutral-800">
                          {candidate?.aiAnalysis?.summary || "No AI summary available"}
                        </p>
                      </td>
                    );
                  })}
                </tr>
                {comparisonData.keyDifferences && Object.entries(comparisonData.keyDifferences)
                  .filter(([key]) => key !== 'skills') // Skills are already covered above
                  .map(([category, values]: [string, any]) => (
                    <tr key={category}>
                      <td className="sticky left-0 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-900 border-r border-neutral-200 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      {selectedCandidates.map((id, index) => (
                        <td key={index} className="px-6 py-3 text-sm text-neutral-800">
                          {values[`candidate${index + 1}`] || "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <CardFooter className="p-6">
            <Alert className="bg-yellow-50 border-yellow-200 w-full">
              <AlertTriangle className="h-4 w-4 text-yellow-800" />
              <AlertDescription className="text-sm text-yellow-800">
                <strong>AI-Powered Comparison Analysis:</strong> {comparisonData.recommendation}
                {comparisonData.differentiators && (
                  <p className="mt-1">
                    <strong>Key Differentiator:</strong> {comparisonData.differentiators[0]}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
