require("dotenv").config()
// -----------------------------------------------
// Variable Assignment
const baseURL = "https://sf1api.palletconnect.com/api";
const apiKey = process.env.PALLET_CONNECT_API_KEY;
//=================================================
// Authenticate with Pallet Connect API
//=================================================
async function authenticate() {
    // Check API Key
    if (!apiKey)
    {
        throw new Error ("API key missing from .env. Access at https://paradigmpallet.palletconnect.com/#api_manager");
    }
    // Create form data type to store API Key
    const apiForm = new FormData();
    apiForm.append("key", apiKey);
    // ------------------------------------------------
    // Authenticate API Call
    //----------------------
    const authenticationResponse = await fetch(`${baseURL}/validate_key`,{method: "POST", body: apiForm});
    const authenticationResultJSON = await authenticationResponse.json();
    // ------------------------------------------------
    // Error Handling
    //-------------------
    // No Token Case
    if (authenticationResultJSON.success !== 1 || !authenticationResultJSON.token)
    {
        throw new Error(`Authentication Failed: ${authenticationResultJSON.message || "No token returned"}`);
    }
    // Success Case
    return authenticationResultJSON.token;
}

//=================================================
// Retrieve Contacts from Pallet Connect API
//=================================================
async function getContacts(token)
{
    //-------------------------------------------------
    // Contact Request Parameters
    // ------------------------------------------------
    const offset = 0; // How many records to skip before returning results
    const limit = 20; // Max contacts returned in 1 API request
    const contactsURL = `${baseURL}/secure/contacts?offset=${offset}&limit=${limit}`; // URL for API excluding search parameters to hopefully get ALL contacts
    const contactsResponse = await fetch(contactsURL, {method: "GET", headers: {Authorization:`Bearer ${token}`}}); // Get Contacts API Call
    const contactResultsJSON = await contactsResponse.json(); // Format as JSON
    //-------------------------------------------------
    // Error Handling
    // ------------------------------------------------
    // Error Case
    if (!contactsResponse.ok || contactResultsJSON.success !== 1)
    {
        throw new Error(`Contact Request Failed (HTTP ${contactsResponse.status}): ${contactResultsJSON.message || "Unknown error"}`);
    }
    //Success Case
    return contactResultsJSON.data;
}

//=================================================
// Execute Contact Retrieval Test
//=================================================
async function main()
{
    try
    {
        // Authenticate
        const token = await authenticate();
        // Retreive Contacts
        const contacts = await getContacts(token);
        // Log Results
        console.log("All Contacts:", contacts);
    }
    catch (error)
    {
        console.error("ERROR:", error.message);
        process.exitCode = 1;
    }
    
}

//=================================================
// Run Script
//=================================================
main();