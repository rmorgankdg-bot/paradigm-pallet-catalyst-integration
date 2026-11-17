
const fs = require("fs");
const path = require("path");

const columns = [
    "PC Transaction ID",
    "PC Transaction Type",
    "Imported Transaction Date",
    "Transaction Date",
    "Slip Number",
    "Purchase Order",
    "State/Province",
    "Contact ID",
    "Contact Name",
    "Trailer Number",
    "Total Quantity",
    "Total Amount"
];

function csvValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return `"${String(value).replace(/"/g, '""')}"`;
}

function createTransactionCsv(data) {
    const transactions = data.transactions || [];

    const rows = transactions.map(transaction => {
        return {
            "PC Transaction ID": transaction.id,
            "PC Transaction Type": transaction.transaction_types?.transaction_type,
            "Imported Transaction Date": transaction.transaction_date_time,
            "Transaction Date": transaction.transaction_date,
            "Slip Number": transaction.ref_number,
            "Purchase Order": transaction.order_number,
            "State/Province": transaction.address_province,
            "Contact ID": transaction.contact_id,
            "Contact Name": transaction.contact_name,
            "Trailer Number": transaction.original_trailer_number || transaction.new_trailer_number,
            "Total Quantity": transaction.net_total_quantity,
            "Total Amount": transaction.net_total_value
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

    const filePath = path.join(exportsFolder, "transactions.csv");

    fs.writeFileSync(filePath, csv, "utf8");

    console.log(`Created transactions.csv with ${rows.length} transactions`);
}

module.exports = createTransactionCsv;

if (require.main === module) {
    const data = require("../exports/api_response.json");
    createTransactionCsv(data);
}
