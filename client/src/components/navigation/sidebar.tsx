import { useLocation, Link } from "wouter";
import { Home, Briefcase, Users, CheckSquare, X, Settings, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  // Helper to check if the current path matches a given path
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Company Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary-500 text-white">
            <Users className="w-5 h-5" />
          </div>
          <span className="ml-2 text-lg font-semibold text-neutral-800">ApplicantAI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="w-6 h-6 text-neutral-500" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-4">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          Dashboard
        </div>
        <Button
          variant="ghost"
          className={`flex w-full justify-start items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/")
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          asChild
        >
          <Link href="/">
            <Home className="w-5 h-5 mr-2" />
            Overview
          </Link>
        </Button>
        <Button
          variant="ghost"
          className={`flex w-full justify-start items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/jobs")
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          asChild
        >
          <Link href="/jobs">
            <Briefcase className="w-5 h-5 mr-2" />
            Job Listings
          </Link>
        </Button>

        <div className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          Applicants
        </div>
        
        <Button
          variant="ghost"
          className={`flex w-full justify-start items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/applicants") && !isActive("/applicants/shortlisted") && !isActive("/applicants/approved")
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          asChild
        >
          <Link href="/applicants">
            <Users className="w-5 h-5 mr-2" />
            All Applicants
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex w-full justify-between items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/applicants/shortlisted")
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          asChild
        >
          <Link href="/applicants/shortlisted">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Shortlisted
            </div>
            <span className="flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
              14
            </span>
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex w-full justify-start items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/applicants/approved")
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          asChild
        >
          <Link href="/applicants/approved">
            <CheckSquare className="w-5 h-5 mr-2" />
            Approved
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex w-full justify-start items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/compare")
              ? "bg-primary-50 text-primary-700 border border-primary-200"
              : "text-neutral-700 hover:bg-neutral-100 border border-dashed border-neutral-200"
          }`}
          asChild
        >
          <Link href="/compare">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              <path d="M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              <path d="M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              <path d="M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              <path d="M15 5h-3a9 9 0 0 0-9 9v0"/>
              <path d="M21 5h-3a9 9 0 0 0-6 2.3"/>
              <path d="M3 17v-2"/>
              <path d="M21 17v-2"/>
            </svg>
            Compare Candidates
          </Link>
        </Button>

        <div className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          Settings
        </div>
        
        <Button
          variant="ghost"
          className={`flex w-full justify-start items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/settings/ai")
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          asChild
        >
          <Link href="/settings/ai">
            <Settings className="w-5 h-5 mr-2" />
            AI Settings
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex w-full justify-start items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
            isActive("/help")
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          asChild
        >
          <Link href="/help">
            <LifeBuoy className="w-5 h-5 mr-2" />
            Help & Support
          </Link>
        </Button>
      </nav>
    </>
  );
}
