import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("hiring_manager"),
  avatarUrl: text("avatar_url"),
  companyId: integer("company_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  avatarUrl: true,
  companyId: true,
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  domain: true,
});

export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  status: text("status").notNull().default("active"),
  companyId: integer("company_id").notNull(),
  hiringManagerId: integer("hiring_manager_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJobListingSchema = createInsertSchema(jobListings).pick({
  title: true,
  description: true,
  requirements: true,
  status: true,
  companyId: true,
  hiringManagerId: true,
});

export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  experience: integer("experience"), // in years
  education: text("education"),
  skills: text("skills").array(),
  resumeUrl: text("resume_url"),
  profilePicUrl: text("profile_pic_url"),
  jobListingId: integer("job_listing_id").notNull(),
  status: text("status").notNull().default("new"), // new, shortlisted, rejected, approved
  matchScore: integer("match_score"), // 0-100 percentage match
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApplicantSchema = createInsertSchema(applicants).pick({
  name: true,
  email: true,
  phone: true,
  experience: true,
  education: true,
  skills: true,
  resumeUrl: true,
  profilePicUrl: true,
  jobListingId: true,
  status: true,
});

export const applicantNotes = pgTable("applicant_notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  applicantId: integer("applicant_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApplicantNoteSchema = createInsertSchema(applicantNotes).pick({
  content: true,
  applicantId: true,
  userId: true,
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull(),
  summary: text("summary").notNull(),
  strengths: text("strengths").array(),
  weaknesses: text("weaknesses").array(),
  skills: json("skills").notNull(),
  experience: json("experience").notNull(),
  rating: integer("rating").notNull(), // 0-100
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).pick({
  applicantId: true,
  summary: true,
  strengths: true,
  weaknesses: true,
  skills: true,
  experience: true,
  rating: true,
  recommendations: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertJobListing = z.infer<typeof insertJobListingSchema>;
export type JobListing = typeof jobListings.$inferSelect;

export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type Applicant = typeof applicants.$inferSelect;

export type InsertApplicantNote = z.infer<typeof insertApplicantNoteSchema>;
export type ApplicantNote = typeof applicantNotes.$inferSelect;

export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;
