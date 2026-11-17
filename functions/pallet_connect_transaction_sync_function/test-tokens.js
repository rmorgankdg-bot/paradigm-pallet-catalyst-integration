
require("dotenv").config();

async function testRefreshToken(name, refreshToken) {
    console.log(`\nTesting ${name} refresh token...`);

    if (!refreshToken) {
        console.log(`${name}: Missing refresh token`);
        return;
    }

    const params = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token"
    });

    try {
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

        if (response.ok && data.access_token) {
            console.log(`${name}: SUCCESS`);
            console.log("Access token generated successfully.");
            console.log("Expires in:", data.expires_in, "seconds");
        } else {
            console.log(`${name}: FAILED`);
            console.log("Error:", data.error);
            console.log("Description:", data.error_description || "None");
        }
    } catch (error) {
        console.log(`${name}: REQUEST FAILED`);
        console.log(error.message);
    }
}

async function main() {
    await testRefreshToken(
        "Creator",
        process.env.ZOHO_REFRESH_TOKEN
    );

    await testRefreshToken(
        "Analytics",
        process.env.ZOHO_ANALYTICS_REFRESH_TOKEN
    );
}

main();
