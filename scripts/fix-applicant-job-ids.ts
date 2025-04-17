import { storage } from '../server/storage';

async function fixApplicantJobIds() {
  try {
    console.log("Starting to fix applicant job IDs...");
    
    // Get all applicants
    const applicants = await storage.getAllApplicants();
    console.log(`Found ${applicants.length} total applicants`);
    
    // Count applicants with missing jobListingId
    const missingJobId = applicants.filter(a => a.jobListingId === undefined);
    console.log(`Found ${missingJobId.length} applicants with missing jobListingId`);
    
    // Fix applicants: assign them to Design Engineer job (ID 1)
    for (const applicant of missingJobId) {
      console.log(`Fixing applicant ${applicant.id}: ${applicant.name}`);
      await storage.updateApplicantJob(applicant.id, 1);
    }
    
    console.log("Finished fixing applicant job IDs");
    
    // Verify fix worked
    const applicantsAfterFix = await storage.getAllApplicants();
    const stillMissingJobId = applicantsAfterFix.filter(a => a.jobListingId === undefined);
    console.log(`After fix: ${stillMissingJobId.length} applicants still have missing jobListingId`);
    
    // Count applicants per job
    const job1Count = applicantsAfterFix.filter(a => a.jobListingId === 1).length;
    const job2Count = applicantsAfterFix.filter(a => a.jobListingId === 2).length;
    const job3Count = applicantsAfterFix.filter(a => a.jobListingId === 3).length;
    
    console.log(`Job 1 (Design Engineer): ${job1Count} applicants`);
    console.log(`Job 2 (Full-Stack Developer): ${job2Count} applicants`);
    console.log(`Job 3 (Data Scientist): ${job3Count} applicants`);
    
  } catch (error) {
    console.error("Error fixing applicant job IDs:", error);
  }
}

// Run the function
fixApplicantJobIds().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});