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
    
    // Create three job listings
    const designJobListing = this.createJobListing({
      title: "Mid-Level Design Engineer",
      description: "We are looking for a talented mid-level design engineer to join our team. The ideal candidate will have strong experience in UI/UX design and be able to work collaboratively with developers.",
      requirements: "3-5 years of experience in UI/UX design. Proficiency in Figma, Sketch, or similar design tools. Experience with design systems. Knowledge of front-end technologies is a plus.",
      status: "active",
      companyId: company.id,
      hiringManagerId: 1,
    });

    const fullstackJobListing = this.createJobListing({
      title: "Senior Full-Stack Developer",
      description: "We're seeking an experienced full-stack developer to build scalable web applications. You'll work on both frontend and backend systems, collaborate with cross-functional teams, and help architect solutions.",
      requirements: "5+ years experience with modern JavaScript frameworks (React, Angular, or Vue). Proficiency in Node.js, Python, or similar backend technologies. Experience with databases, API design, and cloud infrastructure.",
      status: "active",
      companyId: company.id,
      hiringManagerId: 1,
    });

    const dataJobListing = this.createJobListing({
      title: "Data Scientist",
      description: "Join our data science team to analyze complex datasets and build predictive models. You'll work with stakeholders to understand business problems and develop AI/ML solutions.",
      requirements: "Master's or PhD in Computer Science, Statistics, or related field. 3+ years experience with machine learning, statistical analysis, and data visualization. Proficiency in Python and ML libraries (TensorFlow, PyTorch, scikit-learn).",
      status: "active",
      companyId: company.id,
      hiringManagerId: 1,
    });
    
    // Helper function to create random applicants
    const createRandomApplicants = (count: number, jobId: number, skillPool: string[], statusDistribution: Record<string, number>) => {
      const firstNames = ["Michael", "Sarah", "Raj", "Emily", "David", "Olivia", "James", "Sophia", "Liam", "Emma", "Noah", "Ava", "William", "Isabella", "Benjamin", "Charlotte", "Lucas", "Amelia", "Henry", "Harper", "Alexander", "Evelyn", "Mason", "Abigail", "Ethan", "Elizabeth", "Jacob", "Sofia", "Logan", "Avery", "Jackson", "Ella", "Daniel", "Scarlett", "Matthew", "Madison", "Samuel", "Victoria", "Sebastian", "Luna", "Jack", "Grace", "Owen", "Chloe", "John", "Lily", "Dylan", "Zoe", "Leo", "Nora", "Gabriel", "Hannah", "Carter", "Maya", "Isaac", "Layla", "Jason", "Aaron", "Tyler", "Ryan", "Zoe", "Nora", "Hannah", "Maya", "Aiden", "Wei", "Ming", "Jie", "Hui", "Yan", "Jose", "Maria", "Carlos", "Ana", "Miguel", "Takashi", "Akira", "Yuki", "Haruka", "Ji-Woo", "Min-Jun", "Ahmed", "Fatima", "Omar", "Priya", "Raj", "Ananya", "Arjun"];
      const lastNames = ["Chen", "Johnson", "Patel", "Rodriguez", "Kim", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis", "Young", "Walker", "Hall", "Allen", "Wright", "King", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Torres", "Parker", "Collins", "Edwards", "Stewart", "Flores", "Morris", "Nguyen", "Murphy", "Rivera", "Cook", "Rogers", "Morgan", "Peterson", "Cooper", "Reed", "Bailey", "Bell", "Gomez", "Kelly", "Howard", "Ward", "Cox", "Diaz", "Richardson", "Wood", "Watson", "Brooks", "Bennett", "Gray", "James", "Reyes", "Cruz", "Hughes", "Price", "Myers", "Long", "Foster", "Sanders", "Ross", "Morales", "Powell", "Sullivan", "Russell", "Ortiz", "Jenkins", "Gutierrez", "Perry", "Butler", "Barnes", "Fisher", "Wang", "Zhang", "Li", "Liu", "Yang", "Zhao", "Huang", "Wu", "Zhou", "Zhu", "Sun", "Ma", "Gao", "Hu", "Lin", "Luo", "Song", "Ye", "Lu", "Yao", "Xu", "Wei", "Qian", "Gupta", "Sharma", "Singh", "Kumar", "Das", "Yadav", "Reddy", "Patil", "Shukla", "Rao"];
      const domains = ["example.com", "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "mail.com", "company.com", "inbox.com", "live.com"];
      const educationTypes = ["B.S.", "B.A.", "M.S.", "M.A.", "Ph.D.", "MBA", "Associate's Degree"];
      const universities = ["Stanford University", "MIT", "UC Berkeley", "Harvard University", "Carnegie Mellon University", "California Institute of Technology", "Georgia Tech", "University of Washington", "UCLA", "University of Michigan", "NYU", "Cornell University", "University of Texas", "University of Illinois", "Princeton University", "University of Wisconsin", "Ohio State University", "University of Chicago", "Northwestern University", "UC San Diego", "University of Pennsylvania", "Yale University", "Columbia University", "Boston College", "University of North Carolina", "University of Florida", "Purdue University", "Rice University", "Duke University", "University of Virginia"];
      const fields = ["Computer Science", "Information Technology", "Software Engineering", "Human-Computer Interaction", "Data Science", "Machine Learning", "Artificial Intelligence", "Design", "Graphic Design", "Web Development", "Mobile Development", "UX/UI Design", "Interaction Design", "Business", "Marketing", "Finance", "Mathematics", "Statistics", "Physics", "Psychology", "Cognitive Science", "Communications"];
      const phonePrefix = ["123", "234", "345", "456", "567", "678", "789", "890", "901", "012"];
      const profilePics = [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        "https://images.unsplash.com/photo-1558203728-00f45181dd84?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        null
      ];
      
      const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
      const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
      const getRandomSkills = (pool: string[], count: number): string[] => {
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };
      
      // Distribute applicants by status based on provided distribution
      const statuses = Object.entries(statusDistribution).flatMap(([status, percentage]) => 
        Array(Math.floor(count * (percentage / 100))).fill(status)
      );
      
      // If we don't have exactly 'count' statuses due to rounding, fill the rest with "new"
      while (statuses.length < count) {
        statuses.push("new");
      }
      
      // Shuffle statuses
      statuses.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const name = `${firstName} ${lastName}`;
        const domain = getRandomElement(domains);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
        const phone = `555-${getRandomElement(phonePrefix)}-${getRandomInt(1000, 9999)}`;
        const experience = getRandomInt(1, 15);
        const educationType = getRandomElement(educationTypes);
        const field = getRandomElement(fields);
        const university = getRandomElement(universities);
        const education = `${educationType} in ${field}, ${university}`;
        const skillCount = getRandomInt(3, 6);
        const skills = getRandomSkills(skillPool, skillCount);
        const profilePicUrl = getRandomElement(profilePics);
        const matchScore = getRandomInt(60, 99);
        const status = statuses[i];
        
        const applicantData = {
          name,
          email,
          phone,
          experience,
          education,
          skills,
          profilePicUrl,
          matchScore,
          status
        };
        
        const applicant = this.createApplicant({
          ...applicantData,
          jobListingId: jobId,
          resumeUrl: null,
        });
        
        // Create AI analysis for each applicant
        this.createAiAnalysis({
          applicantId: applicant.id,
          summary: `${applicantData.name} is a ${applicantData.experience} year experienced professional with expertise in ${applicantData.skills.slice(0, 3).join(", ")}. ${applicantData.education}`,
          strengths: applicantData.skills.map(skill => `Strong ${skill} experience`),
          weaknesses: [
            "Could improve communication skills", 
            "Limited experience with newer technologies",
            "May need additional training in some areas",
            "Lacks leadership experience",
            "Documentation skills need improvement"
          ].slice(0, getRandomInt(1, 3)),
          skills: applicantData.skills.reduce((acc, skill) => ({ 
            ...acc, 
            [skill]: getRandomInt(5, 10) 
          }), {}),
          experience: {
            [getRandomInt(1, 2) === 1 ? "Senior Role" : "Previous Position"]: {
              company: "Previous Company",
              highlights: ["Led team projects", "Improved efficiency by 25%", "Implemented new technologies"]
            }
          },
          rating: applicantData.matchScore,
          recommendations: getRandomInt(1, 4) === 1 
            ? `${applicantData.name} has potential but may require additional training.` 
            : `${applicantData.name} would be a good fit for the team. Consider reviewing their portfolio in detail.`
        });
        
        // Create sample notes for each applicant
        if (getRandomInt(1, 3) > 1) { // 2/3 chance of having a note
          this.createApplicantNote({
            applicantId: applicant.id,
            content: `Initial review of ${applicantData.name}'s application looks promising. Strong background in ${applicantData.skills[0]}.`,
            userId: 1
          });
        }
      }
    };
    
    // Define skill pools for different job types
    const designSkills = [
      "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", 
      "Design Systems", "Wireframing", "Prototyping", "User Research", "Visual Design", 
      "Web Design", "Mobile Design", "Accessibility", "Typography", "Color Theory", 
      "Interaction Design", "Information Architecture", "Usability Testing", "User Flows",
      "Design Thinking", "CSS", "HTML", "Frontend Development", "Animation", "Icon Design",
      "Design Sprints", "Design Strategy", "Product Design", "Responsive Design"
    ];
    
    const developerSkills = [
      "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js", "Express", 
      "Python", "Django", "Flask", "Java", "Spring Boot", "C#", ".NET", "Ruby on Rails",
      "PHP", "Laravel", "Go", "Rust", "MongoDB", "PostgreSQL", "MySQL", "Redis", 
      "GraphQL", "REST API", "Docker", "Kubernetes", "AWS", "Azure", "GCP", 
      "CI/CD", "Git", "Testing", "TDD", "Microservices", "System Design", "Algorithms",
      "Data Structures", "Frontend", "Backend", "Full-stack", "Mobile Development",
      "React Native", "Flutter", "Swift", "Kotlin", "DevOps", "Security"
    ];
    
    const dataSkills = [
      "Python", "R", "SQL", "Machine Learning", "Deep Learning", "Natural Language Processing",
      "Computer Vision", "Data Visualization", "Statistical Analysis", "TensorFlow", "PyTorch",
      "Keras", "scikit-learn", "Pandas", "NumPy", "SciPy", "Matplotlib", "Tableau", "Power BI",
      "Big Data", "Hadoop", "Spark", "Data Mining", "Feature Engineering", "Model Deployment",
      "A/B Testing", "Hypothesis Testing", "Regression Analysis", "Classification", "Clustering",
      "Time Series Analysis", "Dimensionality Reduction", "Neural Networks", "Bayesian Methods",
      "Reinforcement Learning", "Data Cleaning", "ETL", "Data Pipelines", "Cloud Computing",
      "AWS", "Azure", "GCP", "Database Design", "NoSQL", "Data Ethics"
    ];
    
    // Create 175 design applicants
    createRandomApplicants(175, designJobListing.id, designSkills, {
      "new": 60,
      "shortlisted": 25,
      "approved": 10,
      "rejected": 5
    });
    
    // Create 195 developer applicants
    createRandomApplicants(195, fullstackJobListing.id, developerSkills, {
      "new": 55,
      "shortlisted": 30,
      "approved": 10,
      "rejected": 5
    });
    
    // Create 130 data science applicants
    createRandomApplicants(130, dataJobListing.id, dataSkills, {
      "new": 65,
      "shortlisted": 20,
      "approved": 10,
      "rejected": 5
    });
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
