import { 
  users, type User, type InsertUser,
  companies, type Company, type InsertCompany,
  jobListings, type JobListing, type InsertJobListing,
  applicants, type Applicant, type InsertApplicant,
  applicantNotes, type ApplicantNote, type InsertApplicantNote,
  aiAnalysis, type AiAnalysis, type InsertAiAnalysis
} from "@shared/schema";

// Interface with all CRUD methods we need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Job listing methods
  getJobListing(id: number): Promise<JobListing | undefined>;
  getAllJobListings(): Promise<JobListing[]>;
  createJobListing(jobListing: InsertJobListing): Promise<JobListing>;
  
  // Applicant methods
  getApplicant(id: number): Promise<Applicant | undefined>;
  getAllApplicants(): Promise<Applicant[]>;
  getApplicantsByIds(ids: number[]): Promise<Applicant[]>;
  getApplicantsByStatus(status: string): Promise<Applicant[]>;
  getApplicantsByJobId(jobId: number): Promise<Applicant[]>;
  getApplicantsByJobIdAndStatus(jobId: number, status: string): Promise<Applicant[]>;
  getTopApplicantsByMatchScore(limit: number): Promise<Applicant[]>;
  getTopApplicantsByJobIdAndMatchScore(jobId: number, limit: number): Promise<Applicant[]>;
  createApplicant(applicant: InsertApplicant): Promise<Applicant>;
  updateApplicantStatus(id: number, status: string): Promise<boolean>;
  updateApplicantMatchScore(id: number, matchScore: number): Promise<boolean>;
  countApplicants(): Promise<number>;
  countApplicantsByMatchScore(minScore: number): Promise<number>;
  countApplicantsByStatus(status: string): Promise<number>;
  countApplicantsByJobId(jobId: number): Promise<number>;
  
  // Applicant note methods
  getNotesByApplicantId(applicantId: number): Promise<ApplicantNote[]>;
  createApplicantNote(note: InsertApplicantNote): Promise<ApplicantNote>;
  
  // AI analysis methods
  getAiAnalysisByApplicantId(applicantId: number): Promise<AiAnalysis | undefined>;
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  
  // Skills methods
  getAllSkills(): Promise<string[]>;
  getSkillsByJobId(jobId: number): Promise<string[]>;
  getSkillsDistributionByJobId(jobId: number): Promise<{name: string, value: number}[]>;
  
  // Application trends methods
  getApplicationTrends(): Promise<{name: string, value: number}[]>;
  getApplicationTrendsByJobId(jobId: number): Promise<{name: string, value: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private jobListings: Map<number, JobListing>;
  private applicants: Map<number, Applicant>;
  private applicantNotes: Map<number, ApplicantNote>;
  private aiAnalyses: Map<number, AiAnalysis>;
  
  private userIdCounter: number;
  private companyIdCounter: number;
  private jobListingIdCounter: number;
  private applicantIdCounter: number;
  private noteIdCounter: number;
  private aiAnalysisIdCounter: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.jobListings = new Map();
    this.applicants = new Map();
    this.applicantNotes = new Map();
    this.aiAnalyses = new Map();
    
    this.userIdCounter = 1;
    this.companyIdCounter = 1;
    this.jobListingIdCounter = 1;
    this.applicantIdCounter = 1;
    this.noteIdCounter = 1;
    this.aiAnalysisIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  // Helper method to initialize sample data
  private initializeSampleData() {
    // Create a company
    const company = this.createCompany({
      name: "TechCorp",
      domain: "techcorp.com"
    });
    
    // Create a user (hiring manager)
    this.createUser({
      username: "katy",
      password: "password",
      fullName: "Katy Johnson",
      email: "katy@techcorp.com",
      role: "hiring_manager",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      companyId: company.id
    });
    
    // Create a job listing
    const jobListing = this.createJobListing({
      title: "Mid-Level Design Engineer",
      description: "We are looking for a talented mid-level design engineer to join our team. The ideal candidate will have strong experience in UI/UX design and be able to work collaboratively with developers.",
      requirements: "3-5 years of experience in UI/UX design. Proficiency in Figma, Sketch, or similar design tools. Experience with design systems. Knowledge of front-end technologies is a plus.",
      status: "active",
      companyId: company.id,
      hiringManagerId: 1,
    });
    
    // Create sample applicants
    const applicants = [
      {
        name: "Michael Chen",
        email: "michael.chen@example.com",
        phone: "555-123-4567",
        experience: 5,
        education: "B.A. in Interaction Design, California Institute of Design",
        skills: ["Design Systems", "Figma", "UI/UX", "Prototyping"],
        profilePicUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        matchScore: 98,
        status: "shortlisted"
      },
      {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "555-987-6543",
        experience: 4,
        education: "M.S. in Human-Computer Interaction, Stanford University",
        skills: ["Product Design", "Sketch", "User Research", "Prototyping"],
        profilePicUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        matchScore: 95,
        status: "shortlisted"
      },
      {
        name: "Raj Patel",
        email: "raj.patel@example.com",
        phone: "555-456-7890",
        experience: 6,
        education: "B.S. in Computer Science, UC Berkeley",
        skills: ["Visual Design", "Front-end", "Adobe Creative Suite"],
        profilePicUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        matchScore: 93,
        status: "new"
      },
      // Add more sample applicants to reach around 400 total
      // We'll just add a few more for the implementation, but in a real scenario we'd have 400
      {
        name: "Emily Rodriguez",
        email: "emily.r@example.com",
        phone: "555-789-0123",
        experience: 3,
        education: "B.A. in Graphic Design, Rhode Island School of Design",
        skills: ["UI Design", "Illustrator", "InDesign"],
        matchScore: 88,
        status: "new"
      },
      {
        name: "David Kim",
        email: "david.kim@example.com",
        phone: "555-234-5678",
        experience: 7,
        education: "M.F.A. in Design, Yale University",
        skills: ["Design Leadership", "UX Strategy", "Design Thinking"],
        matchScore: 85,
        status: "new"
      }
    ];
    
    // Create the applicants
    for (const applicantData of applicants) {
      const applicant = this.createApplicant({
        ...applicantData,
        jobListingId: jobListing.id,
        resumeUrl: null,
      });
      
      // Create AI analysis for each applicant
      this.createAiAnalysis({
        applicantId: applicant.id,
        summary: `${applicantData.name} is a ${applicantData.experience} year experienced designer with expertise in ${applicantData.skills.join(", ")}. ${applicantData.education}`,
        strengths: applicantData.skills.map(skill => `Strong ${skill} experience`),
        weaknesses: ["Could improve communication skills", "Limited experience with newer technologies"],
        skills: applicantData.skills.reduce((acc, skill) => ({ ...acc, [skill]: Math.floor(Math.random() * 3) + 7 }), {}),
        experience: {
          "Senior Designer": {
            company: "Previous Company",
            highlights: ["Led design team", "Created design system"]
          }
        },
        rating: applicantData.matchScore,
        recommendations: `${applicantData.name} would be a good fit for the design team. Consider reviewing their portfolio in detail.`
      });
      
      // Create sample notes for each applicant
      this.createApplicantNote({
        applicantId: applicant.id,
        content: `Initial review of ${applicantData.name}'s application looks promising. Strong background in ${applicantData.skills[0]}.`,
        userId: 1
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }
  
  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async createCompany(companyData: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const company: Company = { ...companyData, id };
    this.companies.set(id, company);
    return company;
  }
  
  // Job listing methods
  async getJobListing(id: number): Promise<JobListing | undefined> {
    return this.jobListings.get(id);
  }
  
  async getAllJobListings(): Promise<JobListing[]> {
    return Array.from(this.jobListings.values());
  }
  
  async createJobListing(jobListingData: InsertJobListing): Promise<JobListing> {
    const id = this.jobListingIdCounter++;
    const timestamp = new Date();
    const jobListing: JobListing = { 
      ...jobListingData, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.jobListings.set(id, jobListing);
    return jobListing;
  }
  
  // Applicant methods
  async getApplicant(id: number): Promise<Applicant | undefined> {
    return this.applicants.get(id);
  }
  
  async getAllApplicants(): Promise<Applicant[]> {
    return Array.from(this.applicants.values());
  }
  
  async getApplicantsByIds(ids: number[]): Promise<Applicant[]> {
    return ids
      .map(id => this.applicants.get(id))
      .filter((applicant): applicant is Applicant => applicant !== undefined);
  }
  
  async getApplicantsByStatus(status: string): Promise<Applicant[]> {
    return Array.from(this.applicants.values()).filter(
      applicant => applicant.status === status
    );
  }
  
  async getApplicantsByJobId(jobId: number): Promise<Applicant[]> {
    return Array.from(this.applicants.values()).filter(
      applicant => applicant.jobListingId === jobId
    );
  }
  
  async getApplicantsByJobIdAndStatus(jobId: number, status: string): Promise<Applicant[]> {
    return Array.from(this.applicants.values()).filter(
      applicant => applicant.jobListingId === jobId && applicant.status === status
    );
  }
  
  async getTopApplicantsByMatchScore(limit: number): Promise<Applicant[]> {
    return Array.from(this.applicants.values())
      .filter(applicant => applicant.matchScore !== null && applicant.matchScore !== undefined)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, limit);
  }
  
  async getTopApplicantsByJobIdAndMatchScore(jobId: number, limit: number): Promise<Applicant[]> {
    return Array.from(this.applicants.values())
      .filter(applicant => 
        applicant.jobListingId === jobId && 
        applicant.matchScore !== null && 
        applicant.matchScore !== undefined
      )
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, limit);
  }
  
  async createApplicant(applicantData: InsertApplicant): Promise<Applicant> {
    const id = this.applicantIdCounter++;
    const timestamp = new Date();
    const applicant: Applicant = { 
      ...applicantData, 
      id, 
      createdAt: timestamp 
    };
    this.applicants.set(id, applicant);
    return applicant;
  }
  
  async updateApplicantStatus(id: number, status: string): Promise<boolean> {
    const applicant = this.applicants.get(id);
    
    if (!applicant) {
      return false;
    }
    
    applicant.status = status;
    this.applicants.set(id, applicant);
    return true;
  }
  
  async updateApplicantMatchScore(id: number, matchScore: number): Promise<boolean> {
    const applicant = this.applicants.get(id);
    
    if (!applicant) {
      return false;
    }
    
    applicant.matchScore = matchScore;
    this.applicants.set(id, applicant);
    return true;
  }
  
  async countApplicants(): Promise<number> {
    return this.applicants.size;
  }
  
  async countApplicantsByMatchScore(minScore: number): Promise<number> {
    return Array.from(this.applicants.values()).filter(
      applicant => (applicant.matchScore || 0) >= minScore
    ).length;
  }
  
  async countApplicantsByStatus(status: string): Promise<number> {
    return Array.from(this.applicants.values()).filter(
      applicant => applicant.status === status
    ).length;
  }
  
  async countApplicantsByJobId(jobId: number): Promise<number> {
    return Array.from(this.applicants.values()).filter(
      applicant => applicant.jobListingId === jobId
    ).length;
  }
  
  // Applicant note methods
  async getNotesByApplicantId(applicantId: number): Promise<ApplicantNote[]> {
    return Array.from(this.applicantNotes.values())
      .filter(note => note.applicantId === applicantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createApplicantNote(noteData: InsertApplicantNote): Promise<ApplicantNote> {
    const id = this.noteIdCounter++;
    const timestamp = new Date();
    const note: ApplicantNote = { 
      ...noteData, 
      id, 
      createdAt: timestamp 
    };
    this.applicantNotes.set(id, note);
    return note;
  }
  
  // AI analysis methods
  async getAiAnalysisByApplicantId(applicantId: number): Promise<AiAnalysis | undefined> {
    return Array.from(this.aiAnalyses.values()).find(
      analysis => analysis.applicantId === applicantId
    );
  }
  
  async createAiAnalysis(analysisData: InsertAiAnalysis): Promise<AiAnalysis> {
    const id = this.aiAnalysisIdCounter++;
    const timestamp = new Date();
    const analysis: AiAnalysis = { 
      ...analysisData, 
      id, 
      createdAt: timestamp 
    };
    this.aiAnalyses.set(id, analysis);
    return analysis;
  }
  
  // Skills methods
  async getAllSkills(): Promise<string[]> {
    // Extract all unique skills from applicants
    const skillsSet = new Set<string>();
    
    Array.from(this.applicants.values()).forEach(applicant => {
      if (applicant.skills) {
        applicant.skills.forEach(skill => skillsSet.add(skill));
      }
    });
    
    return Array.from(skillsSet);
  }
  
  async getSkillsByJobId(jobId: number): Promise<string[]> {
    // Extract all unique skills from applicants for a specific job
    const skillsSet = new Set<string>();
    
    Array.from(this.applicants.values())
      .filter(applicant => applicant.jobListingId === jobId)
      .forEach(applicant => {
        if (applicant.skills) {
          applicant.skills.forEach(skill => skillsSet.add(skill));
        }
      });
    
    return Array.from(skillsSet);
  }
  
  async getSkillsDistributionByJobId(jobId: number): Promise<{name: string, value: number}[]> {
    // Get applicants for this job
    const applicants = await this.getApplicantsByJobId(jobId);
    
    // Count skills
    const skillCounts: Record<string, number> = {};
    
    applicants.forEach(applicant => {
      if (applicant.skills) {
        applicant.skills.forEach(skill => {
          if (skillCounts[skill]) {
            skillCounts[skill]++;
          } else {
            skillCounts[skill] = 1;
          }
        });
      }
    });
    
    // Convert to array format
    return Object.entries(skillCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }
  
  // Application trends methods
  async getApplicationTrends(): Promise<{name: string, value: number}[]> {
    // In a real app, this would analyze application dates
    // For this implementation, we'll return mock data
    return [
      { name: "Monday", value: 45 },
      { name: "Tuesday", value: 112 },
      { name: "Wednesday", value: 86 },
      { name: "Thursday", value: 94 },
      { name: "Friday", value: 63 },
      { name: "Saturday", value: 0 },
      { name: "Sunday", value: 0 }
    ];
  }
  
  async getApplicationTrendsByJobId(jobId: number): Promise<{name: string, value: number}[]> {
    // In a real app, this would analyze application dates for a specific job
    // For this implementation, we'll return mock data based on the job ID
    return [
      { name: "Monday", value: 35 + (jobId % 10) },
      { name: "Tuesday", value: 102 + (jobId % 10) },
      { name: "Wednesday", value: 76 + (jobId % 10) },
      { name: "Thursday", value: 84 + (jobId % 10) },
      { name: "Friday", value: 53 + (jobId % 10) },
      { name: "Saturday", value: 0 },
      { name: "Sunday", value: 0 }
    ];
  }
}

export const storage = new MemStorage();
