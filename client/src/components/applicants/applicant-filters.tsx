import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicantFilter {
  type: string;
  value: string;
  label: string;
}

interface ApplicantFiltersProps {
  jobId?: number;
  onFilterChange: (filters: ApplicantFilter[]) => void;
}

export default function ApplicantFilters({ jobId, onFilterChange }: ApplicantFiltersProps) {
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<ApplicantFilter[]>([]);
  const [experienceFilter, setExperienceFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [matchScoreFilter, setMatchScoreFilter] = useState("");
  
  // Fetch available skills for the filter dropdown
  const { data: skillOptions = [] } = useQuery<string[]>({
    queryKey: [jobId ? `/api/jobs/${jobId}/skills` : '/api/skills'],
  });

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const addFilter = (type: string, value: string, label: string) => {
    if (value && !filters.some(f => f.type === type && f.value === value)) {
      setFilters([...filters, { type, value, label }]);
      
      // Reset the corresponding input after adding filter
      if (type === 'experience') setExperienceFilter("");
      if (type === 'skill') setSkillFilter("");
      if (type === 'status') setStatusFilter("");
      if (type === 'matchScore') setMatchScoreFilter("");
    }
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setFilters([]);
    setSearchText("");
    setExperienceFilter("");
    setSkillFilter("");
    setStatusFilter("");
    setMatchScoreFilter("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      addFilter('search', searchText, `Search: ${searchText}`);
      setSearchText("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="block w-full pl-10 pr-3 py-2"
            placeholder="Search by name, skill, or keyword"
          />
        </form>
        <div className="flex items-center space-x-3">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="default" 
            className="inline-flex items-center"
            onClick={() => statusFilter && addFilter('status', statusFilter, `Status: ${statusFilter}`)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {filters.length > 0 && filters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="bg-neutral-100 text-neutral-800">
            {filter.label}
            <button className="ml-1 text-neutral-500 hover:text-neutral-700" onClick={() => removeFilter(index)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {filters.length > 0 && (
          <button 
            className="text-xs text-primary-600 hover:text-primary-800 font-medium ml-2"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <div>
          <Select value={experienceFilter} onValueChange={(value) => setExperienceFilter(value)}>
            <SelectTrigger className="min-w-[160px]">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Experience</SelectItem>
              <SelectItem value="0-2">0-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5-10">5-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={() => experienceFilter && addFilter(
              'experience', 
              experienceFilter,
              `Experience: ${experienceFilter}`
            )}
          >
            Add
          </Button>
        </div>

        <div>
          <Select value={skillFilter} onValueChange={(value) => setSkillFilter(value)}>
            <SelectTrigger className="min-w-[160px]">
              <SelectValue placeholder="Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Skill</SelectItem>
              {skillOptions.map((skill: string) => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={() => skillFilter && addFilter('skill', skillFilter, `Skill: ${skillFilter}`)}
          >
            Add
          </Button>
        </div>

        <div>
          <Select value={matchScoreFilter} onValueChange={(value) => setMatchScoreFilter(value)}>
            <SelectTrigger className="min-w-[160px]">
              <SelectValue placeholder="Match Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Score</SelectItem>
              <SelectItem value="90+">90% or higher</SelectItem>
              <SelectItem value="80+">80% or higher</SelectItem>
              <SelectItem value="70+">70% or higher</SelectItem>
              <SelectItem value="60+">60% or higher</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={() => matchScoreFilter && addFilter(
              'matchScore', 
              matchScoreFilter,
              `Match Score: ${matchScoreFilter}`
            )}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
