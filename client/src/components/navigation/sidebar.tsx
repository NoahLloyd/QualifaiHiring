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
        <Link href="/">
          <a
            className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
              isActive("/")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Home className="w-5 h-5 mr-2" />
            Overview
          </a>
        </Link>
        <Link href="/jobs">
          <a
            className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
              isActive("/jobs")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Briefcase className="w-5 h-5 mr-2" />
            Job Listings
          </a>
        </Link>

        <div className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          Applicants
        </div>
        <Link href="/applicants">
          <a
            className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
              isActive("/applicants") && !isActive("/applicants/shortlisted") && !isActive("/applicants/approved")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            All Applicants
          </a>
        </Link>
        <Link href="/applicants/shortlisted">
          <a
            className={`flex items-center justify-between px-3 py-2 mb-1 text-sm font-medium rounded-md ${
              isActive("/applicants/shortlisted")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Shortlisted
            </div>
            <span className="flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
              14
            </span>
          </a>
        </Link>
        <Link href="/applicants/approved">
          <a
            className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
              isActive("/applicants/approved")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            Approved
          </a>
        </Link>

        <div className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          Settings
        </div>
        <Link href="/settings/ai">
          <a
            className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
              isActive("/settings/ai")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            AI Settings
          </a>
        </Link>
        <Link href="/help">
          <a
            className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md ${
              isActive("/help")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <LifeBuoy className="w-5 h-5 mr-2" />
            Help & Support
          </a>
        </Link>
      </nav>
    </>
  );
}
