
require("dotenv").config({path: require("path").resolve(__dirname, "../.env")});

// -----------------------------------------------
// Variable Assignment
const baseURL = process.env.ZOHO_CREATOR_API_URL || "https://www.zohoapis.com/creator/v2.1/data";
const accountOwner = process.env.ZOHO_CREATOR_OWNER;
const applicationName = process.env.ZOHO_CREATOR_APP;

//=================================================
// Get Records from Creator Report
//=================================================
async function getRecords(token, reportName, from = 1, limit = 200, criteria = null)
{
    // ------------------------------------------------
    // Validate Configuration
    if (!accountOwner || !applicationName)
    {
        throw new Error("Zoho Creator owner or application name missing from environment variables.");
    }

    // ------------------------------------------------
    // Request Parameters
    const parameters = new URLSearchParams();
    parameters.append("from", from.toString());
    parameters.append("limit", limit.toString());

    if (criteria)
    {
        parameters.append("criteria", criteria);
    }

    // ------------------------------------------------
    // Get Records
    const recordsURL = `${baseURL}/${encodeURIComponent(accountOwner)}/${encodeURIComponent(applicationName)}/report/${encodeURIComponent(reportName)}?${parameters.toString()}`;

    const recordsResponse = await fetch(recordsURL,
    {
        method: "GET",
        headers:
        {
            "Authorization": `Zoho-oauthtoken ${token}`
        }
    });

    const recordsResultJSON = await recordsResponse.json();

    // ------------------------------------------------
    // Error Case
    if (!recordsResponse.ok || (recordsResultJSON.code !== 3000 && recordsResultJSON.code !== 3100))
    {
        throw new Error(`Creator Records Request Failed (HTTP ${recordsResponse.status}): ${JSON.stringify(recordsResultJSON)}`);
    }

    // ------------------------------------------------
    // Success Case
    if (recordsResultJSON.code === 3100)
    {
        return [];
    }

    return recordsResultJSON.data || [];
}

//=================================================
// Get Record by Creator ID
//=================================================
async function getRecordByID(token, reportName, recordID)
{
    // ------------------------------------------------
    // Validate Configuration
    if (!accountOwner || !applicationName)
    {
        throw new Error("Zoho Creator owner or application name missing from environment variables.");
    }

    // ------------------------------------------------
    // Get Record
    const recordURL = `${baseURL}/${encodeURIComponent(accountOwner)}/${encodeURIComponent(applicationName)}/report/${encodeURIComponent(reportName)}/${encodeURIComponent(recordID)}`;

    const recordResponse = await fetch(recordURL,
    {
        method: "GET",
        headers:
        {
            "Authorization": `Zoho-oauthtoken ${token}`
        }
    });

    const recordResultJSON = await recordResponse.json();

    // ------------------------------------------------
    // Error Case
    if (!recordResponse.ok || recordResultJSON.code !== 3000)
    {
        throw new Error(`Creator Record Request Failed (HTTP ${recordResponse.status}): ${JSON.stringify(recordResultJSON)}`);
    }

    // ------------------------------------------------
    // Success Case
    return recordResultJSON.data;
}

//=================================================
// Get Records by Criteria
//=================================================
async function getRecordsByCriteria(token, reportName, criteria, from = 1, limit = 200)
{
    return await getRecords(token, reportName, from, limit, criteria);
}

//=================================================
// Get All Records from Creator Report
//=================================================
async function getAllRecords(token, reportName, criteria = null)
{
    // ------------------------------------------------
    // Variable Assignment
    const allRecords = [];
    const limit = 200;
    let from = 1;

    // ------------------------------------------------
    // Get Records in Batches
    while (true)
    {
        const records = await getRecords(token, reportName, from, limit, criteria);

        allRecords.push(...records);

        if (records.length < limit)
        {
            break;
        }

        from += limit;
    }

    // ------------------------------------------------
    // Success Case
    return allRecords;
}

//=================================================
// Export Functions
//=================================================
module.exports = {
    getRecords,
    getRecordByID,
    getRecordsByCriteria,
    getAllRecords
};
