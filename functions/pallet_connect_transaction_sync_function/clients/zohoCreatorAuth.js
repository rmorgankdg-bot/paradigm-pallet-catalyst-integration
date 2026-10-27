
// Authenticates with Zoho Creator API

require("dotenv").config({path: require("path").resolve(__dirname, "../.env")});

// -----------------------------------------------
// Variable Assignment
const accountsURL = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
const clientID = process.env.ZOHO_CLIENT_ID;
const clientSecret = process.env.ZOHO_CLIENT_SECRET;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

//=================================================
// Get Zoho OAuth Access Token
//=================================================
async function authenticate()
{
    // ------------------------------------------------
    // Validate Credentials
    if (!clientID || !clientSecret || !refreshToken)
    {
        throw new Error("Zoho OAuth credentials missing from environment variables.");
    }

    // ------------------------------------------------
    // Authentication Payload
    const parameters = new URLSearchParams();
    parameters.append("refresh_token", refreshToken);
    parameters.append("client_id", clientID);
    parameters.append("client_secret", clientSecret);
    parameters.append("grant_type", "refresh_token");

    // ------------------------------------------------
    // Authenticate
    const authenticationResponse = await fetch(`${accountsURL}/oauth/v2/token`,
    {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: parameters
    });

    const authenticationResultJSON = await authenticationResponse.json();

    // ------------------------------------------------
    // Error Case
    if (!authenticationResponse.ok || !authenticationResultJSON.access_token)
    {
        throw new Error(`Zoho Authentication Failed: ${JSON.stringify(authenticationResultJSON)}`);
    }

    // Success Case
    return authenticationResultJSON.access_token;
}

//=================================================
// Export Functions
//=================================================
module.exports = { authenticate };
