import { useLocation, Link } from "wouter";
import { 
  Home, Briefcase, Users, MessagesSquare, Search, User, FileText,
  BarChart2, Cog, HelpCircle, X
} from "lucide-react";
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
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10z" />
              <path d="M12 12v6" />
              <path d="M12 8v.01" />
            </svg>
          </div>
          <span className="ml-2 text-lg font-semibold text-neutral-800">Snapchat Qualifai</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="w-6 h-6 text-neutral-500" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-4">
        <div className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
          DASHBOARD
        </div>

        <div className="space-y-1">
          <div className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
            isActive("/") ? "text-blue-700 font-medium" : "text-neutral-700"
          }`} onClick={() => window.location.href = "/"}>
            <Home className="w-5 h-5 mr-3" />
            Overview
          </div>

          <div className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
            isActive("/jobs") ? "text-blue-700 font-medium" : "text-neutral-700"
          }`} onClick={() => window.location.href = "/jobs"}>
            <Briefcase className="w-5 h-5 mr-3" />
            Job Listings
          </div>

          <div className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
            isActive("/meetings") ? "text-blue-700 font-medium" : "text-neutral-700"
          }`} onClick={() => window.location.href = "/meetings"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Meetings
          </div>

          <div className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer ${
            isActive("/messages") ? "text-blue-700 font-medium" : "text-neutral-700"
          }`} onClick={() => window.location.href = "/messages"}>
            <div className="flex items-center">
              <MessagesSquare className="w-5 h-5 mr-3" />
              Messages
            </div>
            <span className="flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              3
            </span>
          </div>
        </div>

        <div className="mt-8 mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
          APPLICANTS
        </div>

        <div className="space-y-1">
          <div 
            className={`flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer ${
              isActive("/applicants/review") ? "text-blue-700 font-medium" : "text-neutral-700"
            }`}
            onClick={() => window.location.href = "/applicants/review"}
          >
            <div className="flex items-center">
              <Search className="w-5 h-5 mr-3" />
              Needs review
            </div>
            <span className="flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-red-100 text-red-800">
              14
            </span>
          </div>

          <div 
            className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
              isActive("/applicants/interviewing") ? "text-blue-700 font-medium" : "text-neutral-700"
            }`}
            onClick={() => window.location.href = "/applicants/interviewing"}
          >
            <User className="w-5 h-5 mr-3" />
            Interviewing
          </div>

          <div 
            className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
              isActive("/applicants/referrals") ? "text-blue-700 font-medium" : "text-neutral-700"
            }`}
            onClick={() => window.location.href = "/applicants/referrals"}
          >
            <FileText className="w-5 h-5 mr-3" />
            Referrals
          </div>

          <div 
            className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
              isActive("/compare") ? "text-blue-700 font-medium" : "text-neutral-700"
            }`}
            onClick={() => window.location.href = "/compare"}
          >
            <BarChart2 className="w-5 h-5 mr-3" />
            AI Compare
          </div>
        </div>

        <div className="mt-8 mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
          SETTINGS
        </div>

        <div className="space-y-1">
          <div 
            className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
              isActive("/settings") ? "text-blue-700 font-medium" : "text-neutral-700"
            }`}
            onClick={() => window.location.href = "/settings"}
          >
            <Cog className="w-5 h-5 mr-3" />
            Settings
          </div>

          <div 
            className={`flex items-center px-2 py-2 text-sm rounded-md cursor-pointer ${
              isActive("/help") ? "text-blue-700 font-medium" : "text-neutral-700"
            }`}
            onClick={() => window.location.href = "/help"}
          >
            <HelpCircle className="w-5 h-5 mr-3" />
            Help & Support
          </div>
        </div>
      </nav>
    </>
  );
}
