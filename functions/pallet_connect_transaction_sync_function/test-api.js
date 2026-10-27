
// Tests Pallet Connect API Getters

const PalletConnect_Getters = require("./clients/palletConnectGetters");
const PalletConnect_Auth = require("./clients/palletConnectAuth");

//=================================================
// Test Pallet Connect API Getters
//=================================================
async function main()
{
    try
    {
        // ------------------------------------------------
        // Authenticate
        const token = await PalletConnect_Auth.authenticate();
        console.log("Authentication Successful!");

        // ------------------------------------------------
        // Retrieve Contacts
        const contacts = await PalletConnect_Getters.getContacts(token);
        console.log("Contacts Retrieved:", contacts.length);
        console.log("First Contact:", JSON.stringify(contacts[0] ?? null, null, 2));

        // ------------------------------------------------
        // Retrieve Facilities
        const facilities = await PalletConnect_Getters.getFacilities(token);
        console.log("Facilities Retrieved:", facilities.length);
        console.log("First Facility:", JSON.stringify(facilities[0] ?? null, null, 2));

        // ------------------------------------------------
        // Retrieve Transactions
        const contactID = 549;
        const startDate = "2026-01-01";
        const endDate = "2026-10-27";

        const transactions = await PalletConnect_Getters.getTransactions(token, contactID, startDate, endDate);
        console.log("Transactions Retrieved:", transactions.length);
        console.log("First Transaction:", JSON.stringify(transactions[0] ?? null, null, 2));
    }
    catch (error)
    {
        console.error("ERROR:", error.message);
        process.exitCode = 1;
    }
}

main();
