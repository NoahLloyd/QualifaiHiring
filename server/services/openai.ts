import OpenAI from "openai";
import type { AiSummaryResponse, AiComparisonResponse, AiAssistantMessage, AiInsightsResponse } from "@/lib/openai";
import type { JobListing, Applicant } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-api-key"
});

export interface ResumeAnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

// Analyze resume and generate AI summary response with enhanced semantic reasoning
export async function analyzeResume(data: ResumeAnalysisRequest): Promise<AiSummaryResponse> {
  try {
    const { resumeText, jobDescription } = data;
    
    // First, extract key requirements and skills from the job description using NLU
    const jobAnalysisResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing job descriptions and extracting key requirements. 
          Use semantic understanding to identify not just explicit skills but also implicit requirements and responsibilities.`
        },
        {
          role: "user",
          content: `
          Extract the key requirements, skills, experiences, and qualifications from this job description.
          Focus on technical skills, soft skills, experience level, educational requirements, and key responsibilities.
          
          Job Description: 
          ${jobDescription}
          
          Provide your analysis in JSON format:
          {
            "core_skills": ["skill1", "skill2", ...],
            "secondary_skills": ["skill1", "skill2", ...],
            "experience_requirements": ["requirement1", "requirement2", ...], 
            "key_responsibilities": ["responsibility1", "responsibility2", ...],
            "education_requirements": ["education1", "education2", ...],
            "domain_knowledge": ["domain1", "domain2", ...]
          }
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse job analysis response
    const jobAnalysisContent = jobAnalysisResponse.choices[0].message.content;
    const jobRequirements = JSON.parse(jobAnalysisContent || "{}");
    
    // Now, analyze the resume against these extracted requirements with semantic reasoning
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert HR AI assistant that performs deep semantic analysis of candidate qualifications against job requirements. 
          
          APPROACH TO SEMANTIC REASONING:
          1. Use contextual understanding to identify skills and experiences, even when not explicitly stated
          2. Recognize equivalent skills and technologies that serve similar purposes
          3. Evaluate depth of experience, not just presence of keywords
          4. Consider how transferable skills from different domains might apply to this role
          5. Assess potential for growth and adaptation based on learning trajectory
          
          IMPORTANT ETHICAL GUIDELINES:
          1. Completely ignore any demographic information including name, gender, age, race, ethnicity, nationality, or any other protected characteristic
          2. Base your analysis solely on skills, qualifications, experience, and education
          3. Do not make assumptions about the candidate based on their name or background
          4. Evaluate technical skills and domain knowledge objectively
          5. Explicitly avoid any language that could introduce bias in your assessment
          6. Treat all candidates equally regardless of demographic information`
        },
        {
          role: "user",
          content: `
          Job Requirements Analysis:
          ${JSON.stringify(jobRequirements, null, 2)}
          
          Resume:
          ${resumeText}
          
          Analyze this candidate using semantic reasoning to understand their qualifications beyond just keyword matching.
          Look for evidence of skills and experiences that might be described in different terms but are semantically equivalent.
          
          Provide a detailed analysis in JSON format with the following structure:
          {
            "summary": "A concise overview of the candidate's fit for the role (1-2 paragraphs)",
            "strengths": ["List of 3-5 candidate strengths relevant to the job"],
            "weaknesses": ["List of 2-3 areas where the candidate might not meet job requirements"],
            "skills": {"skill_name": rating_out_of_10, ...},
            "experience": {"job_title": {"company": "company_name", "highlights": ["achievement1", "achievement2"]}},
            "rating": match_score_out_of_10,
            "recommendations": "Specific recommendations for the hiring manager"
          }
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the candidate analysis response
    const content = response.choices[0].message.content;
    const parsedAnalysis = JSON.parse(content || "{}") as AiSummaryResponse;
    
    // Calculate final score, ensuring it's out of 100
    const rating = Math.min(parsedAnalysis.rating * 10, 100);
    
    // Ensure all required fields are present
    return {
      summary: parsedAnalysis.summary || "No summary provided.",
      strengths: parsedAnalysis.strengths || [],
      weaknesses: parsedAnalysis.weaknesses || [],
      skills: parsedAnalysis.skills || {},
      experience: parsedAnalysis.experience || {},
      rating: rating || 50,
      recommendations: parsedAnalysis.recommendations || ""
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    // Return a default response in case of error
    return {
      summary: "Unable to analyze resume due to an error.",
      strengths: ["Not available due to analysis error"],
      weaknesses: ["Not available due to analysis error"],
      skills: {},
      experience: {},
      rating: 50,
      recommendations: "Please retry the analysis."
    };
  }
}

// Compare applicants and highlight differences
export async function compareApplicants(applicants: any[]): Promise<AiComparisonResponse> {
  try {
    // Extract relevant data from applicants
    const applicantsData = applicants.map(applicant => ({
      id: applicant.id,
      name: applicant.name,
      experience: applicant.experience,
      education: applicant.education,
      skills: applicant.skills,
      matchScore: applicant.matchScore,
      workHistory: applicant.workHistory || [],
      projects: applicant.projects || [],
      aiAnalysis: applicant.aiAnalysis || {}
    }));
    
    console.log("Generating enhanced semantic comparison for applicants:", applicantsData.map(a => a.name).join(", "));
    
    // Use the OpenAI API for enhanced semantic analysis
    const useMockData = false;
    
    if (!useMockData) {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an expert HR AI assistant that performs deep semantic comparison of candidates using NLU capabilities.
            
            APPROACH TO SEMANTIC COMPARISON:
            1. Identify meaningful patterns and differences beyond surface-level keyword comparisons
            2. Recognize complementary skill sets and how they might benefit different aspects of the role
            3. Analyze career trajectories and potential growth paths based on past progression
            4. Consider skill transferability across different domains and technologies
            5. Evaluate depth vs breadth of expertise and how it relates to different role requirements
            
            IMPORTANT ETHICAL GUIDELINES:
            1. Completely ignore any demographic information including name, gender, age, race, ethnicity, nationality, or any other protected characteristic
            2. Base your analysis solely on skills, qualifications, experience, and education
            3. Do not make assumptions about candidates based on their names or background
            4. Evaluate technical skills and domain knowledge objectively
            5. Explicitly avoid any language that could introduce bias in your assessment
            6. Treat all candidates equally regardless of demographic information`
          },
          {
            role: "user",
            content: `
            Compare the following candidates using advanced semantic reasoning to look beyond just keywords.
            Analyze how their skills and experiences might semantically relate to potential job requirements,
            even when different terminology is used.
            
            Candidate Data:
            ${JSON.stringify(applicantsData, null, 2)}
            
            Provide a detailed semantic comparison in JSON format with the following structure:
            {
              "differentiators": ["List of 3-4 key areas that most meaningfully differentiate the candidates"],
              "recommendation": "A thoughtful recommendation highlighting each candidate's unique strengths",
              "keyDifferences": {
                "experience_quality": {"candidate1": "analysis of depth/quality of experience", "candidate2": "..."},
                "skill_relevance": {"candidate1": "analysis of how skills align with modern needs", "candidate2": "..."},
                "growth_trajectory": {"candidate1": "analysis of learning/growth pattern", "candidate2": "..."},
                "work_approach": {"candidate1": "inferred work style and approach", "candidate2": "..."}
              }
            }
            `
          }
        ],
        response_format: { type: "json_object" }
      });
  
      // Parse the response
      const content = response.choices[0].message.content;
      const parsedComparison = JSON.parse(content || "{}") as AiComparisonResponse;
      
      // Ensure all required fields are present
      return {
        differentiators: parsedComparison.differentiators || [],
        recommendation: parsedComparison.recommendation || "No recommendation provided.",
        keyDifferences: parsedComparison.keyDifferences || {}
      };
    } else {
      // Generate a detailed mock comparison based on actual candidate data
      const candidate1 = applicantsData[0];
      const candidate2 = applicantsData[1] || { 
        name: "Second Candidate", 
        experience: 5, 
        education: "BS in Computer Science",
        skills: ["JavaScript", "React", "Node.js"],
        matchScore: 75
      };
      
      // Calculate which candidate has more experience
      const experienceDiff = (candidate1.experience || 0) - (candidate2.experience || 0);
      const expText = experienceDiff > 0 
        ? `${candidate1.name} has ${Math.abs(experienceDiff)} more years of experience` 
        : experienceDiff < 0 
          ? `${candidate2.name} has ${Math.abs(experienceDiff)} more years of experience`
          : "Both candidates have equal experience";
          
      // Compare skills
      const c1Skills = candidate1.skills || [];
      const c2Skills = candidate2.skills || [];
      const uniqueC1Skills = c1Skills.filter(s => !c2Skills.includes(s));
      const uniqueC2Skills = c2Skills.filter(s => !c1Skills.includes(s));
      const commonSkills = c1Skills.filter(s => c2Skills.includes(s));
      
      // Compare match scores
      const scoreDiff = (candidate1.matchScore || 0) - (candidate2.matchScore || 0);
      const scoreText = scoreDiff > 0 
        ? `${candidate1.name} has a higher match score by ${Math.abs(scoreDiff)} points` 
        : scoreDiff < 0 
          ? `${candidate2.name} has a higher match score by ${Math.abs(scoreDiff)} points`
          : "Both candidates have equal match scores";
          
      // Generate mock response
      return {
        differentiators: [
          expText,
          scoreText,
          `${candidate1.name} specializes in ${uniqueC1Skills.slice(0, 2).join(", ")} while ${candidate2.name} brings expertise in ${uniqueC2Skills.slice(0, 2).join(", ")}`
        ],
        recommendation: `Based on the analysis, ${candidate1.matchScore > candidate2.matchScore ? candidate1.name : candidate2.name} appears to be the stronger candidate overall with ${Math.max(candidate1.matchScore || 0, candidate2.matchScore || 0)}% match to the job requirements. However, consider ${candidate1.matchScore <= candidate2.matchScore ? candidate1.name : candidate2.name} if specific skills like ${(candidate1.matchScore <= candidate2.matchScore ? uniqueC1Skills : uniqueC2Skills).slice(0, 2).join(", ")} are more important for this role.`,
        keyDifferences: {
          experience: {
            candidate1: `${candidate1.experience} years of professional experience, primarily in ${c1Skills.slice(0, 2).join(", ")}`,
            candidate2: `${candidate2.experience} years of professional experience, focused on ${c2Skills.slice(0, 2).join(", ")}`
          },
          education: {
            candidate1: candidate1.education || "Not specified",
            candidate2: candidate2.education || "Not specified"
          },
          technicalSkills: {
            candidate1: `Proficient in ${c1Skills.join(", ")}`,
            candidate2: `Skilled with ${c2Skills.join(", ")}`
          },
          softSkills: {
            candidate1: `Strong communication and problem-solving abilities`,
            candidate2: `Excellent teamwork and adaptability`
          }
        }
      };
    }
  } catch (error) {
    console.error("Error comparing applicants:", error);
    // Return a default response in case of error
    return {
      differentiators: ["Error in analysis"],
      recommendation: "Unable to compare applicants due to an error. Please try again.",
      keyDifferences: {}
    };
  }
}

// Generate skill gap analysis using enhanced semantic reasoning
export async function generateSkillGapAnalysis(job: JobListing, applicants: Applicant[]): Promise<any> {
  try {
    // Extract skills from applicants
    const allSkills = new Set<string>();
    applicants.forEach(applicant => {
      if (applicant.skills) {
        applicant.skills.forEach(skill => allSkills.add(skill));
      }
    });
    
    // Count how many applicants have each skill
    const skillCounts: Record<string, number> = {};
    allSkills.forEach(skill => {
      skillCounts[skill] = applicants.filter(
        applicant => applicant.skills && applicant.skills.includes(skill)
      ).length;
    });
    
    // Calculate percentage
    const skillPercentages: Record<string, number> = {};
    Object.entries(skillCounts).forEach(([skill, count]) => {
      skillPercentages[skill] = Math.round((count / applicants.length) * 100);
    });
    
    // First, extract implied and explicit skill requirements from the job description
    const jobAnalysisResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing job descriptions and extracting both explicit and implicit skill requirements.
          Use semantic understanding to identify skills that may be described using different terminology.`
        },
        {
          role: "user",
          content: `
          Extract both the explicit skills directly mentioned in the job posting and the implicit skills that would be necessary
          to perform the job successfully, even if not directly mentioned.
          
          Job Title: ${job.title}
          Job Description: ${job.description}
          Job Requirements: ${job.requirements}
          
          Provide the results in JSON format:
          {
            "explicit_skills": ["skill1", "skill2", ...],
            "implicit_skills": ["skill1", "skill2", ...],
            "skill_importance": {"skill1": "high|medium|low", "skill2": "high|medium|low", ...},
            "skill_categories": {"technical": ["skill1", "skill2"], "soft": ["skill3"], "domain": ["skill4"]}
          }
          `
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse job analysis
    const jobAnalysisContent = jobAnalysisResponse.choices[0].message.content;
    const jobSkillAnalysis = JSON.parse(jobAnalysisContent || "{}");
    
    // Now perform skill gap analysis with semantic understanding
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert HR AI assistant that performs deep semantic analysis of skill gaps using NLU capabilities.
          
          APPROACH TO SEMANTIC ANALYSIS:
          1. Look beyond exact skill name matches to identify semantic equivalents
          2. Understand skill relationships and how different skills might compensate for others
          3. Consider skill transferability across domains
          4. Identify emerging skills that might be valuable but rare
          5. Recognize skill clusters and patterns that indicate capability gaps
          
          IMPORTANT ETHICAL GUIDELINES:
          1. Completely ignore any demographic information including names, gender, age, race, ethnicity, nationality, or other protected characteristics
          2. Base your analysis solely on skills, qualifications, and job requirements
          3. Do not make assumptions based on demographic information
          4. Evaluate technical skills and domain knowledge objectively
          5. Explicitly avoid any language that could introduce bias in your assessment`
        },
        {
          role: "user",
          content: `
          Job Title: ${job.title}
          Job Description: ${job.description}
          Job Requirements: ${job.requirements}
          
          Job Skill Analysis:
          ${JSON.stringify(jobSkillAnalysis, null, 2)}
          
          Candidate Skill Distribution:
          ${JSON.stringify(skillPercentages, null, 2)}
          
          Perform a semantic skill gap analysis that looks beyond exact skill matches. Consider:
          1. Skills in the applicant pool that might semantically fulfill requirements even if named differently
          2. Skills that are critically missing based on job requirements
          3. Skill combinations that might compensate for missing individual skills
          4. Emerging skills that are rare but high-value
          
          Provide your analysis in JSON format:
          {
            "critical_gaps": ["gap1", "gap2", ...],
            "semantic_matches": {"required_skill": ["alternative_skill1", "alternative_skill2"]},
            "skill_recommendations": "Detailed recommendations for addressing skill gaps",
            "sourcing_strategy": "Recommendations for finding candidates with missing skills"
          }
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    const parsedAnalysis = JSON.parse(content || "{}");
    
    // Combine skill percentages with semantic analysis
    return {
      skills: skillPercentages,
      criticalGaps: parsedAnalysis.critical_gaps || [],
      semanticMatches: parsedAnalysis.semantic_matches || {},
      recommendations: parsedAnalysis.skill_recommendations || "No recommendations available.",
      sourcingStrategy: parsedAnalysis.sourcing_strategy || "No sourcing strategy available."
    };
  } catch (error) {
    console.error("Error generating skill gap analysis:", error);
    return {
      skills: {},
      recommendations: "Unable to generate skill gap analysis due to an error. Please try again."
    };
  }
}

// Generate insights from applicant data using enhanced semantic reasoning
export async function generateApplicantInsights(job: JobListing, applicants: Applicant[]): Promise<any> {
  try {
    // Extract basic stats
    const averageExperience = applicants.reduce((sum, applicant) => sum + (applicant.experience || 0), 0) / applicants.length;
    const matchScores = applicants.map(applicant => applicant.matchScore || 0);
    const averageMatchScore = matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length;
    
    // Status breakdown
    const statusCounts: Record<string, number> = {
      new: 0,
      shortlisted: 0,
      approved: 0,
      rejected: 0
    };
    
    applicants.forEach(applicant => {
      if (statusCounts[applicant.status]) {
        statusCounts[applicant.status]++;
      }
    });
    
    // Extract sample of applicant data for analysis
    // Limit to 10 applicants to stay within token limits
    const applicantSample = applicants.slice(0, 10).map(applicant => ({
      experience: applicant.experience,
      skills: applicant.skills,
      education: applicant.education,
      matchScore: applicant.matchScore
    }));
    
    // Use NLU to generate semantic insights about the applicant pool
    const insightsResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst that uses semantic reasoning to identify patterns and insights 
          from applicant data. Look beyond surface-level statistics to find meaningful insights.`
        },
        {
          role: "user",
          content: `
          Analyze this applicant pool for a job position using natural language understanding to identify
          patterns, trends, and insights that might not be obvious from basic statistics.
          
          Job Title: ${job.title}
          Job Description: ${job.description}
          
          Applicant Stats:
          - Total Applicants: ${applicants.length}
          - Average Experience: ${Math.round(averageExperience * 10) / 10} years
          - Average Match Score: ${Math.round(averageMatchScore)}%
          
          Sample of Applicant Data (limited to 10 for analysis):
          ${JSON.stringify(applicantSample, null, 2)}
          
          Generate semantic insights about this applicant pool in JSON format:
          {
            "key_insights": ["insight1", "insight2", "insight3"],
            "skill_trends": "Analysis of skill patterns and emerging trends",
            "experience_distribution": "Analysis of experience patterns",
            "hidden_patterns": "Patterns that might not be obvious from statistics alone",
            "recommendations": "Strategic recommendations based on applicant pool analysis"
          }
          `
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse insights
    const insightsContent = insightsResponse.choices[0].message.content;
    const parsedInsights = JSON.parse(insightsContent || "{}");
    
    // Application trend data
    const data = [
      { name: "Jan", value: 12 },
      { name: "Feb", value: 19 },
      { name: "Mar", value: 25 },
      { name: "Apr", value: 32 },
      { name: "May", value: 58 },
      { name: "Jun", value: 76 },
      { name: "Jul", value: 90 },
      { name: "Aug", value: 73 },
      { name: "Sep", value: 45 },
      { name: "Oct", value: 33 },
      { name: "Nov", value: 21 },
      { name: "Dec", value: 15 }
    ];
    
    const stats = {
      totalApplicants: applicants.length,
      averageExperience: Math.round(averageExperience * 10) / 10,
      averageMatchScore: Math.round(averageMatchScore),
      topMatchScore: Math.max(...matchScores),
      statusBreakdown: statusCounts
    };
    
    return {
      ...data,
      stats,
      insights: {
        keyInsights: parsedInsights.key_insights || [],
        skillTrends: parsedInsights.skill_trends || "No skill trends identified.",
        experienceDistribution: parsedInsights.experience_distribution || "No experience distribution insights available.",
        hiddenPatterns: parsedInsights.hidden_patterns || "No hidden patterns identified.",
        recommendations: parsedInsights.recommendations || "No recommendations available."
      }
    };
  } catch (error) {
    console.error("Error generating applicant insights:", error);
    return [
      { name: "Error", value: 0 }
    ];
  }
}

// Get AI assistant chat response with enhanced NLU capabilities
export async function getChatResponse(messages: AiAssistantMessage[], jobContext: string = ""): Promise<string> {
  try {
    // Prepare system message with job context if available
    let systemContent = `You are an advanced AI hiring assistant that helps hiring managers review job applicants, generate insights, and make hiring decisions using advanced semantic reasoning.
    
    APPROACH TO SEMANTIC REASONING:
    1. Use contextual understanding to identify skills and experiences, even when not explicitly stated
    2. Recognize equivalent skills and technologies that serve similar purposes 
    3. Evaluate depth of expertise rather than just presence of keywords
    4. Consider how transferable skills from different domains might apply to hiring contexts
    5. Understand implicit patterns in candidate qualifications and job requirements

    IMPORTANT ETHICAL GUIDELINES:
    1. Completely ignore any demographic information including names, gender, age, race, ethnicity, nationality, or other protected characteristics
    2. Base your analysis solely on skills, qualifications, experience, and education
    3. Do not make assumptions based on demographic information
    4. Evaluate technical skills and domain knowledge objectively
    5. Explicitly avoid any language that could introduce bias in your assessment
    6. Remove all demographic mentions from your analysis completely`;
    
    if (jobContext) {
      systemContent += "\n\nHere is additional context about the job posting:\n" + jobContext;
    }
    
    // Add or replace system message
    const systemMessageExists = messages.some(msg => msg.role === "system");
    const processedMessages = systemMessageExists 
      ? messages.map(msg => msg.role === "system" ? { role: msg.role, content: systemContent } : msg)
      : [{ role: "system", content: systemContent }, ...messages];
    
    // If there's only a system message and no user messages, add a default user message
    if (processedMessages.length === 1 && processedMessages[0].role === "system") {
      processedMessages.push({
        role: "user",
        content: "Hello, I'm looking for assistance with reviewing job applicants. Can you help me?"
      });
    }
    
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: processedMessages as any,
      max_tokens: 1000, 
      temperature: 0.7 // Slightly creative but mostly focused responses
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I encountered an error while processing your request. Please try again later.";
  }
}
