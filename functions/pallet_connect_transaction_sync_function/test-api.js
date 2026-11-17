
/**
 * Paradigm Pallet - Analytics API Test
 *
 * Retrieves Pallet Connect transactions and contacts,
 * then generates Analytics-ready CSV tables.
 */

const PalletConnect_Getters = require("./clients/palletConnectGetters");
const PalletConnect_Auth = require("./clients/palletConnectAuth");
const { exportAnalyticsData } = require("./test_csv");

//=================================================
// Configuration
//=================================================

const startDate = "2026-10-27";
const endDate = "2026-10-28";

// Leave null to retrieve across facilities.
const facilityID = null;

//=================================================
// Main
//=================================================

async function main()
{
    try
    {
        //------------------------------------------------------
        // Authenticate

        console.log("Authenticating...");

        const token = await PalletConnect_Auth.authenticate();

        if (!token)
        {
            throw new Error("Authentication returned no token.");
        }

        console.log("Authentication Successful!");

        //------------------------------------------------------
        // Retrieve Contacts

        console.log("Retrieving Contacts...");

        const contacts = await PalletConnect_Getters.getContacts(token);

        if (!Array.isArray(contacts))
        {
            throw new Error("Contacts response is not an array.");
        }

        console.log("Contacts Retrieved:", contacts.length);

        //------------------------------------------------------
        // Retrieve Transactions

        console.log("--------------------------------------");
        console.log("Retrieving Transactions");
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);
        console.log("Facility:", facilityID ?? "All");
        console.log("--------------------------------------");

        console.time("Transaction Retrieval");

        const transactions =
            await PalletConnect_Getters.getAllTransactionsForAllContacts(
                token,
                startDate,
                endDate,
                facilityID
            );

        console.timeEnd("Transaction Retrieval");

        if (!Array.isArray(transactions))
        {
            throw new Error("Transactions response is not an array.");
        }

        console.log("Transactions Retrieved:", transactions.length);

        //------------------------------------------------------
        // Export Analytics Tables

        console.log("--------------------------------------");
        console.log("Exporting Analytics Tables...");
        console.log("--------------------------------------");

        const result = exportAnalyticsData({
            transactions,
            contacts,
            startDate,
            endDate
        });

        //------------------------------------------------------
        // Results

        console.log("--------------------------------------");
        console.log("Analytics Export Complete");
        console.log("--------------------------------------");

        console.table(result.counts);

        console.log("Output Directory:", result.outputDirectory);

        console.log("Files Created:");
        for (const file of result.files)
        {
            console.log(" -", file);
        }
    }
    catch (error)
    {
        console.error("ERROR:", error);
        process.exitCode = 1;
    }
}

main();
