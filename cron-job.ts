//firstly you have to installed node-shedule npm package and export it in the file 
import * as schedule from "node-schedule"; //"node-schedule": "^2.1.1",
import { UserPlanModel } from "../models/userPlan.model";
import { softDeleteAllMaps } from "./cancelledSubscription";
class job {
	constructor() {}

	// Shop code refresh at every second
	public shopRefresh() {
		// Define rule to run every day at a specific time (e.g., 12:00 AM)
		const rule = new schedule.RecurrenceRule();
		rule.hour = 0; // 0 represents 12:00 AM
		rule.minute = 0; // 0 represents 12:00 AM
		// Schedule job to run every second
		schedule.scheduleJob(rule, async function() {
			console.log("run every 12:00 AM");
			// Fetch all users
			const userPlans = await UserPlanModel.find();
			const now = new Date();

			for (const userPlan of userPlans) {
				// Check if the endDate has passed
				if (userPlan.endDate && userPlan.endDate < now) {
					userPlan.isActive = false;
					await userPlan.save();
					// Delete the user's maps
					softDeleteAllMaps(userPlan.email);
				}
			}
		});
	}
}
export default new job();

//then import in index.ts file where a create server code is written and use it 
import job from "../src/helpers/cron-job";
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	job.shopRefresh();
});
