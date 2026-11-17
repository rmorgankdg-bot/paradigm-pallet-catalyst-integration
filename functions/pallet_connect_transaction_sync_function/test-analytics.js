
require("dotenv").config();

const analytics = require("./clients/zohoAnalyticsClient");

async function test() {
    try {
        console.log("Starting Analytics sync test...");

        await analytics.uploadContacts();
        await analytics.uploadTransactions();

        console.log("Analytics sync completed successfully.");
    } catch (error) {
        console.error("Analytics sync failed:", error.message);
    }
}

test();
