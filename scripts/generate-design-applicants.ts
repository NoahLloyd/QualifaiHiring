import { storage } from '../server/storage';
import { InsertApplicant, InsertAiAnalysis } from '../shared/schema';

// Design engineer job has ID 1
const DESIGN_JOB_ID = 1;

// Design skills pool
const designSkills = [
  "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", 
  "Design Systems", "Wireframing", "Prototyping", "User Research", "Visual Design", 
  "Web Design", "Mobile Design", "Accessibility", "Typography", "Color Theory", 
  "Interaction Design", "Information Architecture", "Usability Testing", "User Flows",
  "Design Thinking", "CSS", "HTML", "Frontend Development", "Animation", "Icon Design",
  "Design Sprints", "Design Strategy", "Product Design", "Responsive Design"
];

// Design companies
const designCompanies = [
  "Adobe", "Figma", "InVision", "Canva", "Sketch", "Dribbble", "Airbnb Design",
  "Google Design", "Microsoft Design", "Apple Design", "Facebook Design", "Twitter Design",
  "Uber Design", "Shopify", "Dropbox Design", "Slack Design", "Mailchimp", "Atlassian",
  "DesignHub", "Creative Inc.", "DesignLab", "UXstudio", "PixelPerfect", "VisualCraft",
  "DesignWorks", "ArtifactDesign", "Blueprint UX", "Framer", "ProtoPie"
];

// Education institutions for designers
const designEducation = [
  "Rhode Island School of Design (RISD)",
  "Parsons School of Design",
  "California Institute of the Arts",
  "Pratt Institute",
  "School of Visual Arts",
  "Art Center College of Design",
  "Savannah College of Art and Design",
  "Yale School of Art",
  "Maryland Institute College of Art",
  "Carnegie Mellon School of Design",
  "California College of the Arts",
  "ArtEZ University of the Arts",
  "Aalto University",
  "Royal College of Art",
  "The Glasgow School of Art",
  "Central Saint Martins",
  "OCAD University",
  "Bauhaus University",
  "The Cooper Union",
  "Design Academy Eindhoven"
];

// Common design job titles
const designJobTitles = [
  "UI Designer", "UX Designer", "Product Designer", "Interaction Designer",
  "Visual Designer", "Web Designer", "Mobile Designer", "Graphic Designer",
  "UI/UX Designer", "Design Systems Designer", "Experience Designer",
  "Creative Director", "Art Director", "Design Lead", "Design Manager",
  "Senior Designer", "Junior Designer", "Design Intern", "Design Consultant",
  "Brand Designer", "Interface Designer", "UX Researcher", "Digital Designer",
  "UI Developer", "Frontend Designer", "Motion Designer", "Information Architect"
];

// Locations
const locations = [
  "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
  "Los Angeles, CA", "Chicago, IL", "Portland, OR", "Denver, CO", "Atlanta, GA",
  "Minneapolis, MN", "Washington, DC", "Dallas, TX", "San Diego, CA", "Philadelphia, PA",
  "London, UK", "Berlin, Germany", "Toronto, Canada", "Paris, France", "Amsterdam, Netherlands",
  "Sydney, Australia", "Tokyo, Japan", "Singapore", "Barcelona, Spain", "Stockholm, Sweden",
  "Copenhagen, Denmark", "Oslo, Norway", "Helsinki, Finland", "Zurich, Switzerland", "Dublin, Ireland"
];

// First names
const firstNames = [
  "Alex", "Jamie", "Casey", "Jordan", "Taylor", "Morgan", "Riley", "Avery", "Quinn", "Reese",
  "Dakota", "Skyler", "Hayden", "Emerson", "Phoenix", "Finley", "Elliot", "Rowan", "Kai", "Remy",
  "Harper", "Blake", "Cameron", "Charlie", "Devin", "Ezra", "Jesse", "Luca", "Noah", "Parker",
  "Peyton", "Robin", "Sam", "Shawn", "Sidney", "Tyler", "Wren", "Aaron", "Adrian", "Amari"
];

// Last names 
const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

// Random utilities
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "icloud.com", "me.com", "designer.com", "creative.io"];
  const domain = getRandomElement(domains);
  
  const emailFormats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${getRandomInt(1, 99)}@${domain}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`
  ];
  
  return getRandomElement(emailFormats);
}

function generatePhone(): string {
  const formats = [
    `(${getRandomInt(100, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
    `${getRandomInt(100, 999)}-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
    `+1 ${getRandomInt(100, 999)} ${getRandomInt(100, 999)} ${getRandomInt(1000, 9999)}`
  ];
  return getRandomElement(formats);
}

function generateSocialUrl(platform: string, firstName: string, lastName: string): string {
  const formats = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${getRandomInt(1, 99)}`,
    `${firstName.toLowerCase()}.design`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}`,
    `the${firstName.toLowerCase()}`,
    `design.${lastName.toLowerCase()}`
  ];
  const handle = getRandomElement(formats);
  
  switch (platform) {
    case 'linkedin':
      return `https://linkedin.com/in/${handle}`;
    case 'github':
      return `https://github.com/${handle}`;
    case 'portfolio':
      const domains = [".com", ".io", ".design", ".me", ".co", ".studio", ".work"];
      const domain = getRandomElement(domains);
      return `https://${handle}${domain}`;
    default:
      return '';
  }
}

function generateWorkHistory(experience: number, skillSet: string[]): any[] {
  // Generate 1-4 work experiences based on total years of experience
  const numJobs = Math.min(Math.ceil(experience / 2), 4);
  let remainingYears = experience;
  const workHistory = [];
  
  for (let i = 0; i < numJobs; i++) {
    const isCurrentJob = i === 0;
    let yearsAtJob = i === 0 
      ? Math.min(getRandomInt(1, 3), remainingYears)
      : Math.min(getRandomInt(1, remainingYears), remainingYears);
    
    remainingYears -= yearsAtJob;
    
    const company = getRandomElement(designCompanies);
    const jobTitle = getRandomElement(designJobTitles);
    const relevantSkills = getRandomElements(skillSet, 1, 3);
    
    // Generate start and end dates
    const endYear = isCurrentJob ? new Date().getFullYear() : new Date().getFullYear() - remainingYears;
    const startYear = endYear - yearsAtJob;
    
    workHistory.push({
      company,
      title: jobTitle,
      startDate: `${startYear}-${getRandomInt(1, 12).toString().padStart(2, '0')}`,
      endDate: isCurrentJob ? "Present" : `${endYear}-${getRandomInt(1, 12).toString().padStart(2, '0')}`,
      description: `${isCurrentJob ? "Currently working" : "Worked"} as a ${jobTitle} at ${company}, focusing on ${relevantSkills.join(", ")}.`,
      achievements: [
        `Created ${getRandomInt(3, 15)} design projects that increased user engagement by ${getRandomInt(10, 35)}%`,
        `Collaborated with ${getRandomInt(2, 8)} developers to implement designs`,
        `Led the redesign of ${getRandomInt(1, 5)} major features/products`
      ]
    });
  }
  
  return workHistory;
}

function generateEducationDetails(): any[] {
  const school = getRandomElement(designEducation);
  const degrees = [
    "Bachelor of Fine Arts in Graphic Design",
    "Bachelor of Design",
    "Master of Fine Arts in Design",
    "Bachelor of Arts in Visual Communication",
    "Master of Design",
    "Bachelor of Science in Interactive Design",
    "Bachelor of Arts in Digital Media Design",
    "Bachelor of Fine Arts in Digital Design",
    "Master of Arts in User Experience Design",
    "Bachelor of Fine Arts in Industrial Design"
  ];
  const degree = getRandomElement(degrees);
  
  const graduationYear = getRandomInt(2005, 2022);
  const startYear = graduationYear - 4;
  
  return [{
    institution: school,
    degree,
    field: degree.split(" in ")[1] || "Design",
    startDate: startYear.toString(),
    endDate: graduationYear.toString(),
    achievements: [
      `GPA: ${(getRandomInt(30, 40) / 10).toFixed(1)}/4.0`,
      `${getRandomElement(["President", "Member", "Vice President"])} of ${getRandomElement(["Design Club", "UX Society", "Student Design Association", "Digital Arts Club"])}`,
      `${getRandomElement(["Dean's List", "Honors Program", "Scholarship Recipient", "Design Award Winner"])}`
    ]
  }];
}

function generateProjects(skills: string[]): any[] {
  const numProjects = getRandomInt(2, 5);
  const projects = [];
  
  const projectTypes = [
    "Mobile App", "Website Redesign", "Branding", "UI Kit", "Design System",
    "E-commerce Platform", "Dashboard", "Social Media App", "Portfolio",
    "Landing Page", "Product Design", "Interactive Prototype", "Marketing Materials"
  ];
  
  for (let i = 0; i < numProjects; i++) {
    const projectType = getRandomElement(projectTypes);
    const relevantSkills = getRandomElements(skills, 1, 3);
    const year = getRandomInt(2018, 2024);
    
    projects.push({
      title: `${getRandomElement(["The", "A", ""])} ${projectType} for ${getRandomElement(["Client", "Personal", "Agency", "Startup", "Enterprise"])}`,
      description: `Designed ${projectType} using ${relevantSkills.join(", ")}. ${getRandomElement([
        "Focused on user experience and accessibility.",
        "Prioritized visual hierarchy and information architecture.",
        "Implemented responsive design principles.",
        "Created a cohesive visual language.",
        "Developed an intuitive navigation system."
      ])}`,
      year: year.toString(),
      link: Math.random() > 0.3 ? `https://behance.net/project${getRandomInt(10000, 99999)}` : undefined,
      skills: relevantSkills
    });
  }
  
  return projects;
}

function generateCertifications(): any[] {
  const certifications = [
    "Certified User Experience Professional",
    "Adobe Certified Expert",
    "Google UX Design Certificate",
    "Interaction Design Foundation Certification",
    "Figma Design Certification",
    "Human-Computer Interaction Certificate",
    "Web Accessibility Specialist",
    "Information Architecture Certification",
    "Design Thinking Certification",
    "Product Design Certification",
    "Design Leadership Certification",
    "UX Research Certification",
    "Visual Design Certification",
    "UI/UX Design Bootcamp",
    "Mobile Design Certification"
  ];
  
  const numCerts = getRandomInt(0, 3);
  const selectedCerts = [];
  
  for (let i = 0; i < numCerts; i++) {
    const cert = getRandomElement(certifications);
    const year = getRandomInt(2015, 2024);
    const issuers = ["Coursera", "Udemy", "LinkedIn Learning", "Interaction Design Foundation", "Nielsen Norman Group", "Google", "Adobe", "General Assembly", "Designlab"];
    
    selectedCerts.push({
      name: cert,
      issuer: getRandomElement(issuers),
      issueDate: year.toString(),
      expiryDate: (year + getRandomInt(1, 5)).toString(),
      credentialId: `CERT-${getRandomInt(10000, 99999)}`
    });
  }
  
  return selectedCerts;
}

function generateReferences(): any[] {
  if (Math.random() > 0.7) { // Only 30% have references
    return [];
  }
  
  const numReferences = getRandomInt(1, 3);
  const references = [];
  
  for (let i = 0; i < numReferences; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const company = getRandomElement(designCompanies);
    
    references.push({
      name: `${firstName} ${lastName}`,
      position: getRandomElement(["Design Director", "Creative Director", "Senior Designer", "Design Manager", "UX Lead", "Art Director", "Product Design Lead"]),
      company,
      email: generateEmail(firstName, lastName),
      phone: generatePhone()
    });
  }
  
  return references;
}

function generateBio(name: string, skills: string[], experience: number): string {
  const introTemplates = [
    `${name} is a passionate designer with ${experience} years of experience specializing in ${skills.slice(0, 3).join(", ")}.`,
    `An award-winning designer with ${experience} years in the industry, ${name} has developed expertise in ${skills.slice(0, 3).join(", ")}.`,
    `${name} is a creative problem-solver with ${experience} years of design experience and a focus on ${skills.slice(0, 3).join(", ")}.`,
    `With ${experience} years of professional experience, ${name} is a talented designer skilled in ${skills.slice(0, 3).join(", ")}.`,
    `${name} is a design professional with ${experience} years of experience crafting engaging experiences through ${skills.slice(0, 3).join(", ")}.`
  ];
  
  const middleTemplates = [
    `Their approach combines strategic thinking with visual excellence.`,
    `They have a keen eye for detail and a passion for creating intuitive interfaces.`,
    `Their work emphasizes clean aesthetics and user-centered design principles.`,
    `They excel at translating complex problems into simple, elegant solutions.`,
    `Their design philosophy centers on creating meaningful, accessible experiences.`
  ];
  
  const endTemplates = [
    `${name} is always exploring new design trends and technologies to stay at the cutting edge of the field.`,
    `When not designing, ${name} enjoys mentoring junior designers and contributing to the design community.`,
    `${name} brings enthusiasm and creativity to every project, consistently delivering results that exceed expectations.`,
    `${name} is passionate about creating designs that not only look beautiful but also solve real user problems.`,
    `${name} approaches each project with a blend of creativity, technical knowledge, and business acumen.`
  ];
  
  return `${getRandomElement(introTemplates)} ${getRandomElement(middleTemplates)} ${getRandomElement(endTemplates)}`;
}

async function generateApplicant(matchScoreRange: [number, number], status: string = "new"): Promise<void> {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const email = generateEmail(firstName, lastName);
  
  // Experience: more experience for higher match scores
  let experience: number;
  if (matchScoreRange[0] >= 95) { // Great fit
    experience = getRandomInt(5, 10);
  } else if (matchScoreRange[0] >= 51) { // Good fit
    experience = getRandomInt(3, 7);
  } else { // Not a good fit
    experience = getRandomInt(1, 4);
  }
  
  // Skills: more relevant skills for higher match scores
  const totalSkills = getRandomInt(5, 10);
  let relevantSkills: string[];
  
  if (matchScoreRange[0] >= 95) { // Great fit - most skills are design-focused
    relevantSkills = getRandomElements(designSkills, Math.floor(totalSkills * 0.8), totalSkills);
  } else if (matchScoreRange[0] >= 51) { // Good fit - mix of design skills
    relevantSkills = getRandomElements(designSkills, Math.floor(totalSkills * 0.6), Math.floor(totalSkills * 0.8));
  } else { // Not a good fit - fewer design skills
    relevantSkills = getRandomElements(designSkills, 1, Math.floor(totalSkills * 0.5));
  }
  
  // Generate a precise match score within the range
  const matchScore = getRandomInt(matchScoreRange[0], matchScoreRange[1]);
  
  // Generate educational background - great fits have more specific design education
  let educationDegree: string;
  if (matchScoreRange[0] >= 95) {
    educationDegree = getRandomElement([
      "Master of Fine Arts in Design",
      "Bachelor of Fine Arts in Graphic Design",
      "Master of Design",
      "Bachelor of Arts in User Experience Design"
    ]);
  } else if (matchScoreRange[0] >= 51) {
    educationDegree = getRandomElement([
      "Bachelor of Fine Arts in Design",
      "Bachelor of Arts in Visual Communication",
      "Bachelor of Design",
      "Bachelor of Science in Digital Media"
    ]);
  } else {
    educationDegree = getRandomElement([
      "Bachelor of Arts",
      "Bachelor of Science",
      "Associate Degree in Design",
      "Self-taught Designer",
      "Design Bootcamp Graduate"
    ]);
  }
  
  const workHistory = generateWorkHistory(experience, relevantSkills);
  const educationDetails = generateEducationDetails();
  const projects = generateProjects(relevantSkills);
  const certifications = generateCertifications();
  const references = generateReferences();
  const bio = generateBio(fullName, relevantSkills, experience);
  
  const applicantData: InsertApplicant = {
    name: fullName,
    email,
    phone: generatePhone(),
    experience,
    education: educationDegree,
    skills: relevantSkills,
    resumeUrl: `https://example.com/resumes/${firstName.toLowerCase()}_${lastName.toLowerCase()}_resume.pdf`,
    profilePicUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
    jobListingId: DESIGN_JOB_ID,
    status,
    linkedinUrl: generateSocialUrl('linkedin', firstName, lastName),
    githubUrl: Math.random() > 0.5 ? generateSocialUrl('github', firstName, lastName) : undefined,
    portfolioUrl: generateSocialUrl('portfolio', firstName, lastName),
    location: getRandomElement(locations),
    bio,
    workHistory,
    education_details: educationDetails,
    certifications,
    projects,
    references
  };
  
  try {
    // Create the applicant
    const applicant = await storage.createApplicant(applicantData);
    
    // Create AI analysis
    const analysis: InsertAiAnalysis = {
      applicantId: applicant.id,
      summary: `${fullName} is a ${experience} year experienced design professional with expertise in ${relevantSkills.slice(0, 3).join(", ")}. ${educationDegree}`,
      strengths: getRandomElements([
        `Strong ${relevantSkills[0]} skills`,
        `Excellent portfolio demonstrating ${relevantSkills[1]} expertise`,
        `Proven track record in ${relevantSkills[2]}`,
        `Great attention to detail`,
        `Strong visual design sensibility`,
        `Exceptional user-centered design approach`,
        `Excellent communication skills`,
        `Strong problem-solving abilities`,
        `Collaborative team player`,
        `Ability to work across multiple design disciplines`
      ], 3, 5),
      weaknesses: getRandomElements([
        `Limited experience with ${designSkills.filter(s => !relevantSkills.includes(s))[0]}`,
        `Could improve skills in ${designSkills.filter(s => !relevantSkills.includes(s))[1]}`,
        `Portfolio lacks examples of ${designSkills.filter(s => !relevantSkills.includes(s))[2]}`,
        `Less experience with design leadership`,
        `May need mentorship in strategic design thinking`,
        `Limited enterprise-level project experience`,
        `Could strengthen research methodologies`,
        `Limited experience with accessibility standards`,
        `Could improve documentation skills`
      ], matchScoreRange[0] >= 95 ? 1 : matchScoreRange[0] >= 51 ? 2 : 3, 
         matchScoreRange[0] >= 95 ? 2 : matchScoreRange[0] >= 51 ? 3 : 5),
      skills: relevantSkills.reduce((acc, skill) => ({ 
        ...acc, 
        [skill]: getRandomInt(matchScoreRange[0] >= 95 ? 8 : matchScoreRange[0] >= 51 ? 6 : 3, 
                            matchScoreRange[0] >= 95 ? 10 : matchScoreRange[0] >= 51 ? 8 : 6) 
      }), {}),
      experience: workHistory.reduce((acc, job, index) => ({
        ...acc,
        [job.title]: {
          company: job.company,
          duration: job.endDate === "Present" 
            ? `${new Date().getFullYear() - parseInt(job.startDate.split('-')[0])} years` 
            : `${parseInt(job.endDate.split('-')[0]) - parseInt(job.startDate.split('-')[0])} years`,
          highlights: job.achievements
        }
      }), {}),
      rating: matchScore,
      recommendations: matchScore >= 95
        ? `${fullName} would be an excellent fit for the Design Engineer position. Their expertise in ${relevantSkills.slice(0, 3).join(", ")} directly aligns with our needs. Recommend advancing to the interview stage immediately.`
        : matchScore >= 70
        ? `${fullName} has strong potential for the Design Engineer role. Their ${relevantSkills[0]} skills are impressive, though they may need additional growth in ${designSkills.filter(s => !relevantSkills.includes(s))[0]}. Recommend considering for an interview.`
        : `${fullName} has some design skills but may not be the best match for this specific Design Engineer position. Their background is more focused on ${relevantSkills[0]} rather than the core skills needed for this role.`
    };
    
    await storage.createAiAnalysis(analysis);
    
    // Create a note if match score is high
    if (matchScore >= 80) {
      await storage.createApplicantNote({
        applicantId: applicant.id,
        content: `Initial review of ${fullName}'s application looks promising. Strong background in ${relevantSkills[0]} and impressive portfolio. Consider scheduling an interview soon.`,
        userId: 1
      });
    }
    
    console.log(`Created applicant: ${fullName} (Match Score: ${matchScore}%)`);
  } catch (error) {
    console.error(`Error creating applicant ${fullName}:`, error);
  }
}

async function main() {
  // Generate 100 applicants divided into three groups
  try {
    console.log("Generating Design Engineer applicants...");
    
    // Generate 20 "Great fit" applicants (95-100% match)
    console.log("\nGenerating 'Great fit' applicants (95-100% match):");
    for (let i = 0; i < 20; i++) {
      await generateApplicant([95, 100], i < 5 ? "shortlisted" : "new");
    }
    
    // Generate 50 "Good fit" applicants (51-94% match)
    console.log("\nGenerating 'Good fit' applicants (51-94% match):");
    for (let i = 0; i < 50; i++) {
      await generateApplicant([51, 94], i < 10 ? "shortlisted" : i < 15 ? "approved" : i < 20 ? "rejected" : "new");
    }
    
    // Generate 30 "Not a good fit" applicants (30-50% match)
    console.log("\nGenerating 'Not a good fit' applicants (30-50% match):");
    for (let i = 0; i < 30; i++) {
      await generateApplicant([30, 50], i < 10 ? "rejected" : "new");
    }
    
    console.log("\nSuccessfully generated 100 applicants for the Design Engineer position!");
  } catch (error) {
    console.error("Error generating applicants:", error);
  }
}

main();