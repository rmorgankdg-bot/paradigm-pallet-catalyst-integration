
const Creator_Auth = require("./clients/zohoCreatorAuth");
const Creator_Getters = require("./clients/zohoCreatorGetters");

//=================================================
// Test Zoho Creator Getters
//=================================================
async function main()
{
    let failedTests = 0;

    // ------------------------------------------------
    // Helper Function for Individual Tests
    async function runTest(testName, testFunction)
    {
        console.log(`\n========== ${testName} ==========`);

        try
        {
            await testFunction();
            console.log("Result: PASSED");
        }
        catch (error)
        {
            failedTests++;
            console.error("Result: FAILED");
            console.error("Error:", error.message);
        }
    }

    try
    {
        // ------------------------------------------------
        // Authenticate
        const token = await Creator_Auth.authenticate();
        console.log("Zoho Creator Authentication Successful!");

        // ------------------------------------------------
        // Report Names from Creator DS File
        const contactsReport = "All_Contacts";
        const transactionsReport = "All_Transactions";
        const logsReport = "All_App_Logs";

        //=================================================
        // Test 1: Get Contacts
        //=================================================
        await runTest("GET CONTACTS", async function()
        {
            const contacts = await Creator_Getters.getRecords(
                token, contactsReport, 1, 5
            );

            console.log("Contacts Retrieved:", contacts.length);

            for (const contact of contacts)
            {
                console.log({
                    ID: contact.ID,
                    Contact_Name: contact.Contact_Name,
                    Contact_ID: contact.Contact_ID,
                    Contact_Type: contact.Contact_Type,
                    Facility_ID: contact.Facility_ID,
                    Facility_Name: contact.Facility_Name
                });
            }
        });

        //=================================================
        // Test 2: Get Contact by Creator ID
        //=================================================
        await runTest("GET CONTACT BY ID", async function()
        {
            const contacts = await Creator_Getters.getRecords(
                token, contactsReport, 1, 1
            );

            if (contacts.length === 0)
            {
                console.log("SKIPPED: No contacts available.");
                return;
            }

            const recordID = contacts[0].ID;

            if (!recordID)
            {
                throw new Error("Contact record does not contain a Creator ID.");
            }

            const contact = await Creator_Getters.getRecordByID(
                token, contactsReport, recordID
            );

            console.log("Creator Record ID:", recordID);
            console.log("Contact:", JSON.stringify({
                ID: contact.ID,
                Contact_Name: contact.Contact_Name,
                Contact_ID: contact.Contact_ID,
                Contact_Type: contact.Contact_Type,
                Facility_ID: contact.Facility_ID,
                Facility_Name: contact.Facility_Name
            }, null, 2));
        });

        //=================================================
        // Test 3: Get Contact by Pallet Connect Contact ID
        //=================================================
        await runTest("GET CONTACT BY CRITERIA", async function()
        {
            const contacts = await Creator_Getters.getRecords(
                token, contactsReport, 1, 1
            );

            if (contacts.length === 0)
            {
                console.log("SKIPPED: No contacts available.");
                return;
            }

            const contactID = contacts[0].Contact_ID;

            if (!contactID)
            {
                console.log("SKIPPED: First contact has no Contact_ID.");
                return;
            }

            const escapedID = String(contactID)
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"');

            const criteria = `(Contact_ID == "${escapedID}")`;

            const matchingContacts = await Creator_Getters.getRecordsByCriteria(
                token, contactsReport, criteria, 1, 10
            );

            console.log("Criteria:", criteria);
            console.log("Matching Contacts:", matchingContacts.length);

            for (const contact of matchingContacts)
            {
                console.log({
                    ID: contact.ID,
                    Contact_Name: contact.Contact_Name,
                    Contact_ID: contact.Contact_ID,
                    Facility_ID: contact.Facility_ID
                });
            }
        });

        //=================================================
        // Test 4: Get Transactions
        //=================================================
        await runTest("GET TRANSACTIONS", async function()
        {
            const transactions = await Creator_Getters.getRecords(
                token, transactionsReport, 1, 5
            );

            console.log("Transactions Retrieved:", transactions.length);

            for (const transaction of transactions.slice(0, 5))
            {
                console.log({
                    ID: transaction.ID,
                    Slip_Number: transaction.Slip_Number,
                    Transaction_Date: transaction.Transaction_Date,
                    Contact_ID: transaction.Contact_ID,
                    Contact_Name: transaction.Contact_Name,
                    Transaction_Type: transaction.Transaction_Type,
                    PC_Transaction_Type: transaction.PC_Transaction_Type,
                    Total_Quantity: transaction.Total_Quantity,
                    Total_Amount: transaction.Total_Amount
                });
            }
        });

        //=================================================
        // Test 5: Get Transaction by Creator ID
        //=================================================
        await runTest("GET TRANSACTION BY ID", async function()
        {
            const transactions = await Creator_Getters.getRecords(
                token, transactionsReport, 1, 1
            );

            if (transactions.length === 0)
            {
                console.log("SKIPPED: No transactions available.");
                return;
            }

            const recordID = transactions[0].ID;

            if (!recordID)
            {
                throw new Error("Transaction record has no Creator ID.");
            }

            const transaction = await Creator_Getters.getRecordByID(
                token, transactionsReport, recordID
            );
            
            console.log("Actual Records Returned:", transactions.length);

            console.log("Transaction:", JSON.stringify({
                ID: transaction.ID,
                Slip_Number: transaction.Slip_Number,
                Transaction_Date: transaction.Transaction_Date,
                Contact_ID: transaction.Contact_ID,
                Contact_Name: transaction.Contact_Name,
                PC_Transaction_Type: transaction.PC_Transaction_Type,
                Total_Quantity: transaction.Total_Quantity,
                Total_Amount: transaction.Total_Amount
            }, null, 2));
        });

        //=================================================
        // Test 6: Get Transactions by Contact ID
        //=================================================
        await runTest("GET TRANSACTIONS BY CONTACT", async function()
        {
            const transactions = await Creator_Getters.getRecords(
                token, transactionsReport, 1, 5
            );

            const sample = transactions.find(
                transaction => transaction.Contact_ID
            );

            if (!sample)
            {
                console.log("SKIPPED: No transactions with Contact_ID.");
                return;
            }

            const escapedID = String(sample.Contact_ID)
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"');

            const criteria = `(Contact_ID == "${escapedID}")`;

            const matchingTransactions = await Creator_Getters.getRecordsByCriteria(
                token, transactionsReport, criteria, 1, 10
            );

            console.log("Criteria:", criteria);
            console.log("Matching Transactions:", matchingTransactions.length);

            for (const transaction of matchingTransactions)
            {
                console.log({
                    ID: transaction.ID,
                    Slip_Number: transaction.Slip_Number,
                    Contact_ID: transaction.Contact_ID,
                    Transaction_Date: transaction.Transaction_Date,
                    Total_Amount: transaction.Total_Amount
                });
            }
        });

        //=================================================
        // Test 7: Get All Contacts
        //=================================================
        await runTest("GET ALL CONTACTS", async function()
        {
            const allContacts = await Creator_Getters.getAllRecords(
                token, contactsReport
            );

            console.log("Total Creator Contacts:", allContacts.length);

            console.log("First 3 Contacts:");

            for (const contact of allContacts.slice(0, 3))
            {
                console.log({
                    ID: contact.ID,
                    Contact_Name: contact.Contact_Name,
                    Contact_ID: contact.Contact_ID,
                    Facility_ID: contact.Facility_ID
                });
            }

            const uniqueContactIDs = new Set(
                allContacts
                    .map(contact => contact.Contact_ID)
                    .filter(id => id !== null && id !== undefined && id !== "")
            );

            console.log("Unique Pallet Connect Contact IDs:", uniqueContactIDs.size);
        });

        //=================================================
        // Test 8: Get Application Logs
        //=================================================
        await runTest("GET APPLICATION LOGS", async function()
        {
            const logs = await Creator_Getters.getRecords(
                token, logsReport, 1, 3
            );

            console.log("Logs Retrieved:", logs.length);

            for (const log of logs)
            {
                console.log({
                    ID: log.ID,
                    Log_Name: log.Log_Name,
                    Source: log.Source,
                    Added_Time: log.Added_Time
                });
            }

            // Intentionally not printing Log_Message or Data
            // because logs may contain sensitive information.
        });

        //=================================================
        // Test Complete
        //=================================================
        console.log("\n==================================");
        console.log("ZOHO CREATOR GETTER TESTS COMPLETE");
        console.log("Failed Tests:", failedTests);
        console.log("==================================");

        if (failedTests > 0)
        {
            process.exitCode = 1;
        }
    }
    catch (error)
    {
        console.error("\nAUTHENTICATION / SETUP ERROR:", error.message);
        process.exitCode = 1;
    }
}

main();
