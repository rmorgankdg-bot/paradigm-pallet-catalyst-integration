
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
// Export Functions
//=================================================
module.exports = {
    getContacts,
    getFacilities,
    getTransactions,
    getTransactionByReference
};
