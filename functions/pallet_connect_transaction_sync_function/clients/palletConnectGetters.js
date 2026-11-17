
// Retrieves data from Pallet Connect API

// -----------------------------------------------
// Variable Assignment
const baseURL = "https://sf1api.palletconnect.com/api";

//=================================================
// Retrieve All Contacts from Pallet Connect API
//=================================================
async function getContacts(token)
{
    const contactsURL = `${baseURL}/secure/contacts`; // Contact Request URL
    const contactsResponse = await fetch(contactsURL, {method: "GET", headers: {Authorization: `Bearer ${token}`}}); // Get Contacts API Call
    const contactResultsJSON = await contactsResponse.json(); // Contact Response Handling
    //-------------------------------------------------------------------------------------
    // console.log("Contact Results: ", contactResultsJSON);
    // Error Case
    if (!contactsResponse.ok || contactResultsJSON.success !== 1)
    {
        throw new Error(`Contact Request Failed (HTTP ${contactsResponse.status}): ${contactResultsJSON.message || "Unknown error"}`);
    }
    // Success Case
    return contactResultsJSON.data;
}

//=================================================
// Retrieve All Facilities from Pallet Connect API
//=================================================
async function getFacilities(token)
{
    const facilitiesURL = `${baseURL}/secure/facility_list`; // Facility Request URL
    const facilitiesResponse = await fetch(facilitiesURL, {method: "GET", headers: {Authorization: `Bearer ${token}`}}); // Get Facilities API Call
    const facilityResultsJSON = await facilitiesResponse.json(); // Facility Response Handling
    //-------------------------------------------------------------------------------------
    //console.log("Facilities Results: ", facilityResultsJSON);  
    // Error Case
    if (!facilitiesResponse.ok)
    {
        throw new Error(`Facility Request Failed (HTTP ${facilitiesResponse.status})`);
    }
    if (!Array.isArray(facilityResultsJSON))
    {
        throw new Error("Unexpected facility response format.");
    }
    // Success Case
    return facilityResultsJSON;
}

//=================================================
// Retrieve Transactions from Pallet Connect API
//=================================================
async function getTransactions(token, contactID, startDate, endDate, facilityID = null, offset = 0, limit = 20)
{
    // ------------------------------------------------
    // Transaction Request Parameters
    const parameters = new URLSearchParams();
    parameters.append("contact_id", contactID);
    parameters.append("offset", offset);
    parameters.append("limit", limit);

    if (startDate)
    {
        parameters.append("start_date", startDate);
    }

    if (endDate)
    {
        parameters.append("end_date", endDate);
    }

    if (facilityID !== null)
    {
        parameters.append("facility_id", facilityID);
    }

    // ------------------------------------------------
    // Retrieve Transactions
    const transactionsURL = `${baseURL}/secure/transactions/search?${parameters.toString()}`; // Transaction Request URL
    const transactionsResponse = await fetch(transactionsURL, {method: "GET", headers: {Authorization: `Bearer ${token}`}}); // Get Transactions API Call
    const transactionResultsJSON = await transactionsResponse.json(); // Transaction Response Handling
    //-------------------------------------------------------------------------------------
    //console.log("Transaction Results: ", transactionResultsJSON);  
    // Error Case
    if (!transactionsResponse.ok || transactionResultsJSON.success !== 1)
    {
        throw new Error(`Transaction Request Failed (HTTP ${transactionsResponse.status}): ${transactionResultsJSON.message || "Unknown error"}`);
    }
    // Success Case
    return transactionResultsJSON.data;
}

//=================================================
// Retrieve Transaction Details from Pallet Connect API
//=================================================
async function getTransactionByReference(token, referenceNumber)
{
    const transactionURL = `${baseURL}/secure/transactions/get/${encodeURIComponent(referenceNumber)}`; // Transaction Request URL
    const transactionResponse = await fetch(transactionURL, {method: "GET", headers: {Authorization: `Bearer ${token}`}}); // Get Transaction API Call
    const transactionResultJSON = await transactionResponse.json(); // Transaction Response Handling
    //-------------------------------------------------------------------------------------
    // console.log("Transaction Details Results: ", transactionResultJSON);  
    // Error Case
    if (!transactionResponse.ok || transactionResultJSON.success !== 1)
    {
        throw new Error(`Transaction Detail Request Failed (HTTP ${transactionResponse.status}): ${transactionResultJSON.message || "Unknown error"}`);
    }
    // Success Case
    return transactionResultJSON.data;
}

//=================================================
// Retrieve All Transactions from Pallet Connect API
//=================================================
async function getAllTransactions(token, contactID, startDate, endDate, facilityID = null)
{
    const allTransactions = [];
    const limit = 20;
    let offset = 0;

    while (true)
    {
        const transactions = await getTransactions(
            token,
            contactID,
            startDate,
            endDate,
            facilityID,
            offset,
            limit
        );

        allTransactions.push(...transactions);

        console.log(`Retrieved ${transactions.length} transactions at offset ${offset}`);

        if (transactions.length < limit)
        {
            break;
        }

        offset += limit;
    }

    return allTransactions;
}


 //=================================================
 // Retrieve Transactions Without Contact ID (Test)
 //=================================================
 async function getTransactionsWithoutContact(token, startDate, endDate, facilityID = null, offset = 0, limit = 20)
 {
     // ------------------------------------------------
     // Transaction Request Parameters
     const parameters = new URLSearchParams();
     parameters.append("offset", offset);
     parameters.append("limit", limit);

     if (startDate)
     {
         parameters.append("start_date", startDate);
     }

     if (endDate)
     {
         parameters.append("end_date", endDate);
     }

     if (facilityID !== null)
     {
         parameters.append("facility_id", facilityID);
     }

     // ------------------------------------------------
     // Retrieve Transactions
     const transactionsURL = `${baseURL}/secure/transactions/search?${parameters.toString()}`;
     const transactionsResponse = await fetch(transactionsURL, {method: "GET", headers: {Authorization: `Bearer ${token}`}});
     const transactionResultsJSON = await transactionsResponse.json();
     //-------------------------------------------------------------------------------------
     console.log("Transaction Request URL:", transactionsURL);
     console.log("Transaction Response:", JSON.stringify(transactionResultsJSON, null, 2));

     // Error Case
     if (!transactionsResponse.ok || transactionResultsJSON.success !== 1)
     {
         throw new Error(`Transaction Request Without Contact Failed (HTTP ${transactionsResponse.status}): ${transactionResultsJSON.message || "Unknown error"}`);
     }

     // Success Case
     if (!Array.isArray(transactionResultsJSON.data))
     {
         throw new Error("Unexpected transaction response format.");
     }

     return transactionResultsJSON.data;
 }

 //=================================================
 // Retrieve All Transactions Without Contact ID
 //=================================================
 async function getAllTransactionsWithoutContact(token, startDate, endDate, facilityID = null)
 {
     const allTransactions = [];
     const limit = 20;
     let offset = 0;

     while (true)
     {
         const transactions = await getTransactionsWithoutContact(
             token,
             startDate,
             endDate,
             facilityID,
             offset,
             limit
         );

         allTransactions.push(...transactions);

         console.log(`Retrieved ${transactions.length} transactions at offset ${offset}`);

         if (transactions.length < limit)
         {
             break;
         }

         offset += limit;
     }

     return allTransactions;
 }

 //=================================================
 // Retrieve All Transactions for All Contacts
 //=================================================
//=================================================
// Retrieve All Transactions for All Contacts
//=================================================
async function getAllTransactionsForAllContacts(token, startDate, endDate, facilityID = null)
{
    // ------------------------------------------------
    // Retrieve Contacts
    const contacts = await getContacts(token);
    const allTransactions = [];

    console.log(`Contacts Retrieved: ${contacts.length}`);

    // ------------------------------------------------
    // Retrieve Transactions for Each Contact
    for (const contact of contacts)
    {
        const contactID = contact.id;

        if (contactID === null || contactID === undefined)
        {
            console.log("Skipping contact without ID:", contact);
            continue;
        }

        console.log(`Retrieving transactions for Contact ID: ${contactID}`);

        let transactions;
        let attempts = 0;
        const maxAttempts = 5;

        while (true)
        {
            try
            {
                transactions = await getAllTransactions(
                    token,
                    contactID,
                    startDate,
                    endDate,
                    facilityID
                );

                break;
            }
            catch (error)
            {
                attempts++;

                if (!error.message.includes("429") || attempts >= maxAttempts)
                {
                    throw error;
                }

                const waitTime = Math.min(35000 * (2 ** (attempts - 1)), 120000);

                console.log(`Rate limit reached. Waiting ${waitTime / 1000} seconds before retry ${attempts}/${maxAttempts}...`);

                await delay(waitTime);
            }
        }

        allTransactions.push(...transactions);

        console.log(`Contact ${contactID}: ${transactions.length} transactions retrieved`);

        // ------------------------------------------------
        // Delay Between Contacts
        await delay(100);
    }

    return allTransactions;
}
 //=================================================
// Delay API Requests
//=================================================
async function delay(milliseconds)
{
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
 
//=================================================
// Export Functions
//=================================================
module.exports = {
    getContacts,
    getFacilities,
    getTransactions,
    getTransactionByReference,
    getAllTransactions,
    getTransactionsWithoutContact,
    getAllTransactionsWithoutContact,
    getAllTransactionsForAllContacts,
    delay
};