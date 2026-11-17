
const fs = require("fs");
const path = require("path");

const workspaceId = "3245739000000007003";
const contactViewId = "3245739000000154002";
const transactionViewId = "3245739000000154044";

const analyticsUrl = "https://analyticsapi.zoho.com";
const accountsUrl = "https://accounts.zoho.com";


async function getAccessToken() {
    const params = new URLSearchParams({
        refresh_token: process.env.ZOHO_ANALYTICS_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token"
    });

    const response = await fetch(
        `${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        }
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        if (data.error === "Access Denied") {
            throw new Error(
                "Zoho OAuth rate limit reached. Stop testing and retry later."
            );
        }

        throw new Error(
            `Analytics authentication failed: ${JSON.stringify(data)}`
        );
    }

    return data.access_token;
}


async function uploadCsv(fileName, viewId, matchingColumn) {
    const filePath = path.join(__dirname, "..", "exports", fileName);

    if (!fs.existsSync(filePath)) {
        throw new Error(`CSV file not found: ${filePath}`);
    }

    const csv = fs.readFileSync(filePath, "utf8");

    if (csv.trim().split(/\r?\n/).length < 2) {
        throw new Error(`${fileName} contains no records. Import cancelled.`);
    }

    const columns = csv.split(/\r?\n/)[0]
        .replace(/^\uFEFF/, "")
        .split(",");

    if (!columns.includes(matchingColumn)) {
        throw new Error(`Missing matching column: ${matchingColumn}`);
    }

    const config = {
        importType: "updateadd",
        fileType: "csv",
        autoIdentify: true,
        onError: "abort",
        matchingColumns: [matchingColumn],
        selectedColumns: columns
    };

    const accessToken = await getAccessToken();

    const url = new URL(
        `${analyticsUrl}/restapi/v2/workspaces/${workspaceId}/views/${viewId}/data`
    );

    url.searchParams.set("CONFIG", JSON.stringify(config));

    const form = new FormData();
    form.append("FILE", new Blob([csv], { type: "text/csv" }), fileName);

    console.log(`Uploading ${fileName} to Zoho Analytics...`);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "ZANALYTICS-ORGID": process.env.ZOHO_ANALYTICS_ORG_ID
        },
        body: form
    });

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
        throw new Error(`Analytics import failed: ${JSON.stringify(result)}`);
    }

    const summary = result.data?.importSummary || {};

    console.log(`${fileName} import completed.`);
    console.log(`Total rows: ${summary.totalRowCount}`);
    console.log(`Successful rows: ${summary.successRowCount}`);
    console.log(`Warnings: ${summary.warnings || 0}`);

    return result;
}

async function uploadContacts() {
    return uploadCsv("contacts.csv", contactViewId, "Contact ID");
}

async function uploadTransactions() {
    return uploadCsv("transactions.csv", transactionViewId, "PC Transaction ID");
}

module.exports = {
    uploadContacts,
    uploadTransactions
};
