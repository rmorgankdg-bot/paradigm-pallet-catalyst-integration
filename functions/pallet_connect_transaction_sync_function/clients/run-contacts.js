const {authenticate, getContacts} = require("./palletConnectClient");

//=================================================
// Execute Contact Retrieval
//=================================================
async function main()
{
    try
    {
        const token = await authenticate();
        const contacts = await getContacts(token);

        console.log("Contacts Retrieved:", contacts.length);
        console.log("First Contact:", JSON.stringify(contacts[0] ?? null, null, 2));
    }
    catch (error)
    {
        console.error("ERROR:", error.message);
    }
}

main();