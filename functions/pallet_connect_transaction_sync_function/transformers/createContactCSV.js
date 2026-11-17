
const fs = require("fs");
const path = require("path");

const columns = [
    "Contact ID",
    "Contact Name",
    "Contact Type",
    "Company",
    "Address Line 1",
    "Address Line 2",
    "City / District",
    "State / Province",
    "Postal Code",
    "Country",
    "Salesperson"
];

function csvValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return `"${String(value).replace(/"/g, '""')}"`;
}

function createContactCsv(data) {
    const contacts = data.contacts || [];

    const rows = contacts.map(contact => {
        const details = contact.contact_contact_details || {};
        const city = details.cities || {};
        const province = city.provinces || {};

        return {
            "Contact ID": contact.id,
            "Contact Name": contact.name,
            "Contact Type": contact.contact_type || "",
            "Company": contact.is_company,
            "Address Line 1": details.contact_address_line_1,
            "Address Line 2": details.contact_address_line_2,
            "City / District": city.city,
            "State / Province": province.province,
            "Postal Code": details.contact_address_post_code,
            "Country": province.countries?.country,
            "Salesperson": details.sales_person_id
        };
    });

    const csv = [
        columns.join(","),
        ...rows.map(row =>
            columns.map(column => csvValue(row[column])).join(",")
        )
    ].join("\n");

    const exportsFolder = path.join(__dirname, "..", "exports");

    fs.mkdirSync(exportsFolder, { recursive: true });

    const filePath = path.join(exportsFolder, "contacts.csv");

    fs.writeFileSync(filePath, csv, "utf8");

    console.log(`Created contacts.csv with ${rows.length} contacts`);
}

module.exports = createContactCsv;

if (require.main === module) {
    const data = require("../exports/api_response.json");
    createContactCsv(data);
}
