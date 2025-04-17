import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertJobListingSchema, 
  insertApplicantSchema, 
  insertApplicantNoteSchema,
  insertAiAnalysisSchema
} from "@shared/schema";
import { 
  analyzeResume, 
  compareApplicants, 
  generateSkillGapAnalysis, 
  getChatResponse, 
  generateApplicantInsights 
} from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    req.session?.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/me", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Failed to get user information" });
    }
  });

  // Dashboard metrics route
  app.get("/api/dashboard/metrics", async (_req, res) => {
    try {
      // Count total applicants
      const totalApplicants = await storage.countApplicants();
      
      // Count top tier applicants (match score >= 80)
      const topTierCount = await storage.countApplicantsByMatchScore(80);
      
      // Count waitlist (status = new)
      const waitlistCount = await storage.countApplicantsByStatus("new");
      
      // Calculate percentage
      const topTierPercentage = totalApplicants > 0 
        ? Math.round((topTierCount / totalApplicants) * 100) 
        : 0;
      
      res.json({
        totalApplicants,
        topTierCount,
        topTierPercentage,
        waitlistCount
      });
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ message: "Failed to get dashboard metrics" });
    }
  });

  // Jobs routes
  app.get("/api/jobs", async (_req, res) => {
    try {
      const jobs = await storage.getAllJobListings();
      
      // Add applicant count to each job
      const jobsWithApplicantCount = await Promise.all(
        jobs.map(async (job) => {
          const applicantsCount = await storage.countApplicantsByJobId(job.id);
          return { ...job, applicantsCount };
        })
      );
      
      res.json(jobsWithApplicantCount);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to get job listings" });
    }
  });
  
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getJobListing(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get applicant count
      const applicantsCount = await storage.countApplicantsByJobId(jobId);
      
      res.json({ ...job, applicantsCount });
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ message: "Failed to get job listing" });
    }
  });
  
  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobListingSchema.parse(req.body);
      const newJob = await storage.createJobListing(jobData);
      res.status(201).json(newJob);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  // Applicants routes
  app.get("/api/applicants", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      let applicants;
      
      if (status) {
        applicants = await storage.getApplicantsByStatus(status);
      } else {
        applicants = await storage.getAllApplicants();
      }
      
      // Ensure all applicants have jobListingId
      const applicantsWithJobId = await Promise.all(applicants.map(async applicant => {
        if (applicant.jobListingId === undefined) {
          console.log(`Fixing applicant ${applicant.id} with missing jobListingId`);
          // Update the applicant in storage too
          const updatedApplicant = {
            ...applicant,
            jobListingId: 1 // Default to job 1 if missing
          };
          
          // Update the storage
          await storage.updateApplicantJob(applicant.id, 1);
          
          return updatedApplicant;
        }
        return applicant;
      }));
      
      res.json(applicantsWithJobId);
    } catch (error) {
      console.error("Get applicants error:", error);
      res.status(500).json({ message: "Failed to get applicants" });
    }
  });
  
  app.get("/api/applicants/details", async (req, res) => {
    try {
      const idsParam = req.query.ids;
      
      if (!idsParam) {
        return res.status(400).json({ message: "Applicant IDs are required (use ?ids=1,2,3)" });
      }
      
      // Handle different formats of IDs:
      // 1. Single ID (ids=123)
      // 2. Array of IDs from query (?ids=1&ids=2&ids=3)
      // 3. Comma-separated IDs (?ids=1,2,3)
      let ids: number[] = [];
      
      if (Array.isArray(idsParam)) {
        // Handle array format from query params
        ids = idsParam.map(id => parseInt(id as string)).filter(id => !isNaN(id));
      } else if ((idsParam as string).includes(',')) {
        // Handle comma-separated string
        ids = (idsParam as string).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      } else {
        // Handle single ID
        const parsedId = parseInt(idsParam as string);
        if (!isNaN(parsedId)) {
          ids = [parsedId];
        }
      }
      
      if (ids.length === 0) {
        return res.status(400).json({ message: "No valid applicant IDs provided" });
      }
      
      console.log("Fetching details for applicants:", ids);
      
      const applicants = await storage.getApplicantsByIds(ids);
      
      // Get AI analysis for each applicant
      const enrichedApplicants = await Promise.all(
        applicants.map(async (applicant) => {
          const aiAnalysis = await storage.getAiAnalysisByApplicantId(applicant.id);
          return { ...applicant, aiAnalysis };
        })
      );
      
      res.json(enrichedApplicants);
    } catch (error) {
      console.error("Get applicant details error:", error);
      res.status(500).json({ message: "Failed to get applicant details" });
    }
  });
  
  app.get("/api/applicants/:id", async (req, res) => {
    try {
      const applicantId = parseInt(req.params.id);
      
      if (isNaN(applicantId)) {
        return res.status(400).json({ message: "Invalid applicant ID" });
      }
      
      const applicant = await storage.getApplicant(applicantId);
      
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }
      
      // Make sure jobListingId is always included in the response
      if (applicant.jobListingId === undefined) {
        console.log("Warning: Applicant missing jobListingId:", applicantId);
        // Fix: add a default jobListingId
        const applicantWithJobId = {
          ...applicant,
          jobListingId: 1 // Default to job 1 if missing
        };
        res.json(applicantWithJobId);
      } else {
        res.json(applicant);
      }
    } catch (error) {
      console.error("Get applicant error:", error);
      res.status(500).json({ message: "Failed to get applicant" });
    }
  });
  
  app.get("/api/applicants/:id/job", async (req, res) => {
    try {
      const applicantId = parseInt(req.params.id);
      
      if (isNaN(applicantId)) {
        return res.status(400).json({ message: "Invalid applicant ID" });
      }
      
      const applicant = await storage.getApplicant(applicantId);
      
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }
      
      // Make sure applicant has a jobListingId
      const jobId = applicant.jobListingId || 1; // Default to job 1 if missing
      
      const job = await storage.getJobListing(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Get applicant job error:", error);
      res.status(500).json({ message: "Failed to get applicant job information" });
    }
  });
  
  app.patch("/api/applicants/:id/status", async (req, res) => {
    try {
      const applicantId = parseInt(req.params.id);
      
      if (isNaN(applicantId)) {
        return res.status(400).json({ message: "Invalid applicant ID" });
      }
      
      const { status } = req.body;
      
      if (!status || !["new", "shortlisted", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updated = await storage.updateApplicantStatus(applicantId, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Applicant not found" });
      }
      
      res.json({ message: "Status updated successfully", status });
    } catch (error) {
      console.error("Update applicant status error:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });
  
  app.post("/api/applicants", async (req, res) => {
    try {
      const applicantData = insertApplicantSchema.parse(req.body);
      const newApplicant = await storage.createApplicant(applicantData);
      
      // If resume is provided, analyze it
      if (newApplicant.resumeUrl) {
        // In a real app, extract text from resumeUrl
        // For this implementation, let's assume we have a resume text
        const resumeText = "Sample resume text for " + newApplicant.name; 
        
        // Get job description
        const job = await storage.getJobListing(newApplicant.jobListingId);
        
        if (job) {
          const analysis = await analyzeResume({ 
            resumeText, 
            jobDescription: job.description + "\n" + job.requirements 
          });
          
          // Save AI analysis
          await storage.createAiAnalysis({
            applicantId: newApplicant.id,
            summary: analysis.summary,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            skills: analysis.skills,
            experience: analysis.experience,
            rating: analysis.rating,
            recommendations: analysis.recommendations
          });
          
          // Update match score based on AI rating
          await storage.updateApplicantMatchScore(newApplicant.id, analysis.rating);
        }
      }
      
      res.status(201).json(newApplicant);
    } catch (error) {
      console.error("Create applicant error:", error);
      res.status(400).json({ message: "Invalid applicant data" });
    }
  });
  
  // Applicant Notes routes
  app.get("/api/applicants/:id/notes", async (req, res) => {
    try {
      const applicantId = parseInt(req.params.id);
      
      if (isNaN(applicantId)) {
        return res.status(400).json({ message: "Invalid applicant ID" });
      }
      
      const notes = await storage.getNotesByApplicantId(applicantId);
      
      // Get user info for each note
      const notesWithUser = await Promise.all(
        notes.map(async (note) => {
          const user = await storage.getUser(note.userId);
          return { ...note, user: user ? { id: user.id, fullName: user.fullName } : null };
        })
      );
      
      res.json(notesWithUser);
    } catch (error) {
      console.error("Get applicant notes error:", error);
      res.status(500).json({ message: "Failed to get applicant notes" });
    }
  });
  
  app.post("/api/applicants/:id/notes", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const applicantId = parseInt(req.params.id);
      
      if (isNaN(applicantId)) {
        return res.status(400).json({ message: "Invalid applicant ID" });
      }
      
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Note content is required" });
      }
      
      const note = await storage.createApplicantNote({
        applicantId,
        content,
        userId: req.session.userId
      });
      
      // Get user info for the note
      const user = await storage.getUser(note.userId);
      
      res.status(201).json({
        ...note,
        user: user ? { id: user.id, fullName: user.fullName } : null
      });
    } catch (error) {
      console.error("Create applicant note error:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });
  
  // AI Analysis routes
  app.get("/api/applicants/:id/ai-analysis", async (req, res) => {
    try {
      const applicantId = parseInt(req.params.id);
      
      if (isNaN(applicantId)) {
        return res.status(400).json({ message: "Invalid applicant ID" });
      }
      
      const analysis = await storage.getAiAnalysisByApplicantId(applicantId);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Get AI analysis error:", error);
      res.status(500).json({ message: "Failed to get AI analysis" });
    }
  });
  
  // Job applicants route
  app.get("/api/jobs/:id/applicants", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const status = req.query.status as string | undefined;
      let applicants;
      
      if (status) {
        applicants = await storage.getApplicantsByJobIdAndStatus(jobId, status);
      } else {
        applicants = await storage.getApplicantsByJobId(jobId);
      }
      
      // Explicitly include the jobListingId in each applicant object
      const applicantsWithJobId = applicants.map(applicant => ({
        ...applicant,
        jobListingId: jobId
      }));
      
      res.json(applicantsWithJobId);
    } catch (error) {
      console.error("Get job applicants error:", error);
      res.status(500).json({ message: "Failed to get job applicants" });
    }
  });
  
  // Top picks route
  app.get("/api/top-picks", async (_req, res) => {
    try {
      // Get top 5 applicants by match score
      const topPicks = await storage.getTopApplicantsByMatchScore(5);
      
      // Get AI analysis for each applicant
      const topPicksWithAnalysis = await Promise.all(
        topPicks.map(async (applicant) => {
          const aiAnalysis = await storage.getAiAnalysisByApplicantId(applicant.id);
          const summary = aiAnalysis?.summary || null;
          return { ...applicant, summary };
        })
      );
      
      res.json(topPicksWithAnalysis);
    } catch (error) {
      console.error("Get top picks error:", error);
      res.status(500).json({ message: "Failed to get top picks" });
    }
  });
  
  app.get("/api/jobs/:id/top-picks", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      // Get top 5 applicants by match score for a specific job
      const topPicks = await storage.getTopApplicantsByJobIdAndMatchScore(jobId, 5);
      
      // Get AI analysis for each applicant
      const topPicksWithAnalysis = await Promise.all(
        topPicks.map(async (applicant) => {
          const aiAnalysis = await storage.getAiAnalysisByApplicantId(applicant.id);
          const summary = aiAnalysis?.summary || null;
          return { ...applicant, summary };
        })
      );
      
      res.json(topPicksWithAnalysis);
    } catch (error) {
      console.error("Get job top picks error:", error);
      res.status(500).json({ message: "Failed to get job top picks" });
    }
  });
  
  // Skills route
  app.get("/api/skills", async (_req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      console.error("Get skills error:", error);
      res.status(500).json({ message: "Failed to get skills" });
    }
  });
  
  app.get("/api/jobs/:id/skills", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const skills = await storage.getSkillsByJobId(jobId);
      res.json(skills);
    } catch (error) {
      console.error("Get job skills error:", error);
      res.status(500).json({ message: "Failed to get job skills" });
    }
  });
  
  // Application trends
  app.get("/api/application-trends", async (_req, res) => {
    try {
      const trends = await storage.getApplicationTrends();
      res.json(trends);
    } catch (error) {
      console.error("Get application trends error:", error);
      res.status(500).json({ message: "Failed to get application trends" });
    }
  });
  
  app.get("/api/jobs/:id/application-trends", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const trends = await storage.getApplicationTrendsByJobId(jobId);
      res.json(trends);
    } catch (error) {
      console.error("Get job application trends error:", error);
      res.status(500).json({ message: "Failed to get job application trends" });
    }
  });
  
  // Skill gap analysis
  app.get("/api/jobs/:id/skill-gap-analysis", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      // Get job details
      const job = await storage.getJobListing(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get all applicants for this job
      const applicants = await storage.getApplicantsByJobId(jobId);
      
      // Get skill distribution
      const skillData = await generateSkillGapAnalysis(job, applicants);
      
      res.json(skillData);
    } catch (error) {
      console.error("Get skill gap analysis error:", error);
      res.status(500).json({ message: "Failed to get skill gap analysis" });
    }
  });
  
  // AI insights
  app.get("/api/jobs/:id/application-insights", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      // Get job details
      const job = await storage.getJobListing(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get all applicants for this job
      const applicants = await storage.getApplicantsByJobId(jobId);
      
      // Generate application insights
      const insights = await generateApplicantInsights(job, applicants);
      
      res.json(insights);
    } catch (error) {
      console.error("Get application insights error:", error);
      res.status(500).json({ message: "Failed to get application insights" });
    }
  });
  
  // Skills distribution
  app.get("/api/jobs/:id/skills-distribution", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const distribution = await storage.getSkillsDistributionByJobId(jobId);
      res.json(distribution);
    } catch (error) {
      console.error("Get skills distribution error:", error);
      res.status(500).json({ message: "Failed to get skills distribution" });
    }
  });
  
  // AI chat assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, jobId } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages are required" });
      }
      
      let jobContext = "";
      
      // If jobId is provided, add job context
      if (jobId) {
        const job = await storage.getJobListing(jobId);
        if (job) {
          jobContext = `Job Title: ${job.title}\nJob Description: ${job.description}\nRequirements: ${job.requirements}`;
        }
      }
      
      const response = await getChatResponse(messages, jobContext);
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to get AI chat response" });
    }
  });
  
  // AI analysis routes
  app.post("/api/ai/analyze-resume", async (req, res) => {
    try {
      const { resumeText, jobDescription } = req.body;
      
      if (!resumeText || !jobDescription) {
        return res.status(400).json({ message: "Resume text and job description are required" });
      }
      
      const analysis = await analyzeResume({ resumeText, jobDescription });
      res.json(analysis);
    } catch (error) {
      console.error("Resume analysis error:", error);
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });
  
  app.post("/api/ai/compare", async (req, res) => {
    try {
      const { applicantIds } = req.body;
      
      if (!applicantIds || !Array.isArray(applicantIds) || applicantIds.length < 2) {
        return res.status(400).json({ message: "At least two applicant IDs are required" });
      }
      
      const applicants = await storage.getApplicantsByIds(applicantIds);
      
      if (applicants.length !== applicantIds.length) {
        return res.status(404).json({ message: "One or more applicants not found" });
      }
      
      // Get AI analysis for each applicant
      const applicantsWithAnalysis = await Promise.all(
        applicants.map(async (applicant) => {
          const aiAnalysis = await storage.getAiAnalysisByApplicantId(applicant.id);
          return { ...applicant, aiAnalysis };
        })
      );
      
      const comparison = await compareApplicants(applicantsWithAnalysis);
      res.json(comparison);
    } catch (error) {
      console.error("Applicant comparison error:", error);
      res.status(500).json({ message: "Failed to compare applicants" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
