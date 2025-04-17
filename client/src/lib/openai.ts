import { apiRequest } from "./queryClient";

export interface AiAnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

export interface AiSummaryResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skills: Record<string, number>;
  experience: Record<string, any>;
  rating: number;
  recommendations: string;
}

export interface AiComparisonResponse {
  differentiators: string[];
  recommendation: string;
  keyDifferences: Record<string, { candidate1: string; candidate2: string }>;
}

export interface AiAssistantMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiInsightsResponse {
  trends: string;
  skillGapAnalysis: {
    skills: Record<string, number>;
    recommendations: string;
  };
}

export async function analyzeResume(data: AiAnalysisRequest): Promise<AiSummaryResponse> {
  const response = await apiRequest("POST", "/api/ai/analyze-resume", data);
  return await response.json();
}

export async function compareApplicants(applicantIds: number[]): Promise<AiComparisonResponse> {
  const response = await apiRequest("POST", "/api/ai/compare", { applicantIds });
  return await response.json();
}

export async function getApplicantInsights(jobId: number): Promise<AiInsightsResponse> {
  const response = await apiRequest("GET", `/api/ai/insights/${jobId}`);
  return await response.json();
}

export async function chatWithAssistant(
  messages: AiAssistantMessage[],
  jobId?: number
): Promise<{ response: string }> {
  const response = await apiRequest("POST", "/api/ai/chat", { messages, jobId });
  return await response.json();
}
