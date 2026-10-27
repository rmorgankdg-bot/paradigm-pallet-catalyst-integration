// Authenticates with Pallet Connect API

require("dotenv").config({path: require("path").resolve(__dirname, "../.env")});

// -----------------------------------------------
// Variable Assignment
const baseURL = "https://sf1api.palletconnect.com/api";
const apiKey = process.env.PALLET_CONNECT_API_KEY;

//=================================================
// Get API Token
//=================================================
async function authenticate()
{
    // -----------------------------------------------
    // Authentication Payload
    //-------------------------------------------------
    if (!apiKey)
    {
        throw new Error("API key missing from environment variables.");
    }

    const apiForm = new FormData();
    apiForm.append("key", apiKey);
    // ------------------------------------------------
    // Authenticate Response Handling
    //-------------------------------------------------
    const authenticationResponse = await fetch(`${baseURL}/validate_key`, {method: "POST", body: apiForm});
    const authenticationResultJSON = await authenticationResponse.json();
    // Error Case
    if (!authenticationResponse.ok)
    {
        throw new Error(`Authentication HTTP Error: ${authenticationResponse.status}`);
    }
    // No Token Case
    if (authenticationResultJSON.success !== 1 || !authenticationResultJSON.token)
    {
        throw new Error(`Authentication Failed: ${authenticationResultJSON.message || "No token returned"}`);
    }
    // Success Case
    return authenticationResultJSON.token;
}

//=================================================
// Export Functions
//=================================================
module.exports = { authenticate };