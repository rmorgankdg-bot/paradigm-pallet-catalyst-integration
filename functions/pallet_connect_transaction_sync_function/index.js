const { zcAuth } = require('@zcatalyst/auth');
const { Cache } = require('@zcatalyst/cache');

/**
 * 
 * @param {import("./types/job").JobRequest} jobRequest 
 * @param {import("./types/job").Context} context 
 */
//------------------------------------------------------
// Catalyst Job Function - Main Execution
//------------------------------------------------------
module.exports = async (jobRequest, context) => {
	//------------------------------------------------------
	// Initialize Catalyst Application
	//------------------------------------------------------
	console.log('Hello from index.js');
	// Initialize Catalyst application using the job context
	const app = await zcAuth.init(context);
	//------------------------------------------------------
	// Initialize Catalyst Cache
	//------------------------------------------------------
	// Catalyst Cache provides temporary, fast-access storage
	// for frequently used data, reducing repeated API calls
	// and database queries.
	//------------------------------------------------------
	const cache = new Cache(); // Initialize Cache instance
	const cacheResponse = await cache.getAllSegment(); // Retrieve all available cache segments	
	console.log('Cache Response:', cacheResponse); // Log cache response
	//------------------------------------------------------
	// Retrieve Job Request Information
	//------------------------------------------------------
	const projectDetails = jobRequest.getProjectDetails(); // Retrieve current Catalyst project details
	const jobDetails = jobRequest.getJobDetails(); // Retrieve current job details
	const jobMetaDetails = jobRequest.getJobMetaDetails(); // Retrieve current job metadata
	const getJobCapacityAttributes = jobRequest.getJobCapacityAttributes(); // Retrieve current job capacity attributes
	//------------------------------------------------------
	// Retrieve Job Parameters
	//------------------------------------------------------

	// Expected job input structure:
	// {
	//     job_details: {
	//         job_meta_details: {
	//             params: {
	//                 key: 'value'
	//             }
	//         }
	//     }
	// }
	const allJobParams = jobRequest.getAllJobParams(); // Retrieve all parameters supplied to the job
	const jobParam = jobRequest.getJobParam('key'); // Retrieve a specific parameter by key

	//------------------------------------------------------
	// Complete Job Execution
	//------------------------------------------------------
	context.closeWithSuccess(); // Close the job with a successful execution status
	// context.closeWithFailure(); // Close the job with a failed execution status
};
		