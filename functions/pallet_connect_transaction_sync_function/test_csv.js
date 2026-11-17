
/**
 * Paradigm Pallet - Analytics Data Export
 *
 * Output:
 * - analytics_transactions.csv
 * - analytics_transaction_details.csv
 * - analytics_contacts.csv
 * - analytics_daily_summary.csv
 * - api_response.json
 *
 * No additional npm packages required.
 */

const fs = require("fs");
const path = require("path");

//=================================================
// Helpers
//=================================================

function value(...values)
{
    for (const item of values)
    {
        if (item !== null && item !== undefined && item !== "")
        {
            return item;
        }
    }

    return null;
}

function number(valueToConvert)
{
    if (
        valueToConvert === null ||
        valueToConvert === undefined ||
        valueToConvert === ""
    )
    {
        return null;
    }

    const result = Number(valueToConvert);

    return Number.isFinite(result) ? result : null;
}

function csvEscape(input)
{
    if (input === null || input === undefined)
    {
        return "";
    }

    const text = typeof input === "object"
        ? JSON.stringify(input)
        : String(input);

    return `"${text.replace(/"/g, '""')}"`;
}

function writeCSV(outputDirectory, fileName, headers, rows)
{
    const filePath = path.join(outputDirectory, fileName);

    const lines = [
        headers.map(csvEscape).join(",")
    ];

    for (const row of rows)
    {
        lines.push(
            headers.map(header => csvEscape(row[header])).join(",")
        );
    }

    fs.writeFileSync(
        filePath,
        "\uFEFF" + lines.join("\r\n"),
        "utf8"
    );

    console.log(`Created ${fileName}: ${rows.length} rows`);

    return filePath;
}

function dateOnly(input)
{
    if (!input || String(input).startsWith("0000-00-00"))
    {
        return null;
    }

    return String(input).slice(0, 10);
}

function monthOf(input)
{
    const date = dateOnly(input);
    return date ? date.slice(0, 7) : null;
}

function yearOf(input)
{
    const date = dateOnly(input);
    return date ? date.slice(0, 4) : null;
}

function contactDetails(contact)
{
    const details = contact?.contact_contact_details;

    if (Array.isArray(details))
    {
        return details[0] || {};
    }

    return details || {};
}

//=================================================
// Export Function
//=================================================

function exportAnalyticsData({
    transactions,
    contacts,
    startDate,
    endDate
})
{
    //------------------------------------------------------
    // Validation

    if (!Array.isArray(transactions))
    {
        throw new Error("Transactions must be an array.");
    }

    if (!Array.isArray(contacts))
    {
        throw new Error("Contacts must be an array.");
    }

    //------------------------------------------------------
    // Output Directory

    const outputDirectory = path.join(__dirname, "exports");

    fs.mkdirSync(outputDirectory, {
        recursive: true
    });

    //------------------------------------------------------
    // Contact Lookup

    const contactLookup = new Map();

    for (const contact of contacts)
    {
        if (contact?.id !== null && contact?.id !== undefined)
        {
            contactLookup.set(String(contact.id), contact);
        }
    }

    //------------------------------------------------------
    // Contact Rows

    const contactRows = contacts.map(contact =>
    {
        const details = contactDetails(contact);
        const city = details.cities || {};
        const province = city.provinces || {};
        const country = province.countries || {};

        return {
            Contact_ID: contact.id,
            Contact_Name: contact.name,
            Parent_Contact_ID: contact.parent_contact_id,
            Location_Label: contact.location_label,

            Salesperson_ID: details.sales_person_id,
            Salesperson_Name: null,

            Contact_Email: details.contact_email,
            Contact_Person: details.contact_person,
            Contact_Phone: details.contact_tel,

            City: city.city,
            State_Province: province.province,
            Postal_Code: details.contact_address_post_code,
            Country: country.country,

            Is_Company: contact.is_company,
            Is_Deleted: contact.is_deleted,
            On_Hold: contact.on_hold
        };
    });

    //------------------------------------------------------
    // Collections

    const transactionRows = [];
    const detailRows = [];

    const seenTransactions = new Set();

    let duplicateCount = 0;
    let missingDetailCount = 0;

    //------------------------------------------------------
    // Process Transactions

    for (const transaction of transactions)
    {
        if (!transaction || typeof transaction !== "object")
        {
            continue;
        }

        const transactionID = transaction.id;
        const facilityID = transaction.site_id;

        //------------------------------------------------------
        // Deduplicate

        if (transactionID !== null &&
            transactionID !== undefined)
        {
            const key = `${facilityID ?? ""}:${transactionID}`;

            if (seenTransactions.has(key))
            {
                duplicateCount++;
                continue;
            }

            seenTransactions.add(key);
        }

        //------------------------------------------------------
        // Resolve Contact

        const contact = contactLookup.get(
            String(transaction.contact_id)
        ) || transaction.contacts || {};

        const details = contactDetails(contact);

        const contactName = value(
            transaction.contact_name,
            contact.name
        );

        const transactionDate = dateOnly(
            transaction.transaction_date
        );

        const transactionType = value(
            transaction.transaction_types?.transaction_type,
            transaction.transaction_type
        );

        //------------------------------------------------------
        // Transaction Header

        transactionRows.push({

            PC_Transaction_ID: transactionID,

            Facility_ID: facilityID,
            Facility_Name: value(
                transaction.sites?.site_name,
                transaction.site_name
            ),

            Contact_ID: transaction.contact_id,
            Contact_Name: contactName,

            Parent_Contact_ID: value(
                contact.parent_contact_id,
                transaction.contacts?.parent_contact_id
            ),

            Salesperson_ID: details.sales_person_id,
            Salesperson_Name: null,

            Transaction_Date: transactionDate,
            Transaction_Month: monthOf(transactionDate),
            Transaction_Year: yearOf(transactionDate),

            Transaction_Date_Time:
                transaction.transaction_date_time,

            Finalized_Date:
                dateOnly(transaction.finalized_date),

            Transaction_Type: transactionType,
            Transaction_Type_ID:
                transaction.transaction_types_id,

            Transaction_Status: transaction.status_text,

            Slip_Number:
                transaction.internal_reference_number,

            Invoice_Number:
                transaction.formatted_invoice_number,

            POD_Number:
                transaction.formatted_pod_number,

            Purchase_Order:
                transaction.order_number,

            Trailer_Number: value(
                transaction.trailer_unit_identifier_original,
                transaction.original_trailer_asset?.name
            ),

            State_Province:
                transaction.address_province,

            Parent_Transaction_ID:
                transaction.parent_transaction_header_id,

            Total_Quantity:
                number(transaction.sum),

            Total_Quantity_In:
                number(transaction.total_quantity_in),

            Total_Quantity_Out:
                number(transaction.total_quantity_out),

            Total_Non_Service_Quantity:
                number(transaction.total_non_service_quantity),

            Total_Service_Quantity:
                number(transaction.total_service_quantity),

            Net_Total_Quantity:
                number(transaction.net_total_quantity),

            Total_Value:
                number(transaction.total_value),

            Total_Tax:
                number(transaction.total_tax),

            Total_Amount:
                number(transaction.total_amnt_after_tax),

            Net_Total_Value:
                number(transaction.net_total_value),

            PC_Last_Updated:
                transaction.updated_at,

            PC_Is_Deleted:
                transaction.is_deleted,

            PC_Transaction_URL:
                transaction.url
        });

        //------------------------------------------------------
        // Transaction Details

        const lines = Array.isArray(transaction.transaction_details)
            ? transaction.transaction_details
            : [];

        if (lines.length === 0)
        {
            missingDetailCount++;
        }

        for (const detail of lines)
        {
            const stockItem = detail.stock_items || {};

            const stockItemName = value(
                stockItem.stock_item_full_name,
                stockItem.name
            );

            const quantity = number(detail.quantity);

            const unitPrice = number(value(
                detail.price_per_unit,
                detail.discounted_price_per_unit,
                detail.unit_price,
                detail.price
            ));

            const lineAmount = number(detail.total_price);

            detailRows.push({

                PC_Transaction_ID: transactionID,
                Detail_ID: detail.id,

                Facility_ID: facilityID,
                Facility_Name: value(
                    transaction.sites?.site_name,
                    transaction.site_name
                ),

                Contact_ID: transaction.contact_id,
                Contact_Name: contactName,

                Parent_Contact_ID:
                    contact.parent_contact_id,

                Salesperson_ID:
                    details.sales_person_id,

                Salesperson_Name: null,

                Transaction_Date: transactionDate,
                Transaction_Month: monthOf(transactionDate),
                Transaction_Year: yearOf(transactionDate),

                Transaction_Type: transactionType,
                Transaction_Status: transaction.status_text,

                Stock_Item_ID: value(
                    detail.stock_item_id,
                    stockItem.id
                ),

                Stock_Item_Name: stockItemName,

                // Requires approved Pallet Connect-to-Creator
                // category mapping.
                Item_Category: null,

                Quantity: quantity,
                Unit_Price: unitPrice,

                Line_Amount: lineAmount,

                Discount_Percent:
                    number(detail.discount_percent),

                Total_Discount:
                    number(detail.total_discount),

                Net_Quantity:
                    number(detail.net_quantity),

                Board_Feet:
                    number(detail.board_feet),

                Income_Account_Code:
                    detail.INCOME_ACCOUNT_CODE,

                Expense_Account_Code:
                    detail.EXPENSE_ACCOUNT_CODE,

                Detail_JSON: detail
            });
        }
    }

    //------------------------------------------------------
    // Daily Summary
    //
    // Grain:
    // Date + Facility + Customer + Type + Status + Item
    //
    // Financial values come from detail lines.
    // Header totals are NOT summed here to prevent
    // multiplying transaction totals by line count.
    //------------------------------------------------------

    const summaryMap = new Map();

    for (const detail of detailRows)
    {
        const keyParts = [
            detail.Transaction_Date,
            detail.Facility_ID,
            detail.Contact_ID,
            detail.Transaction_Type,
            detail.Transaction_Status,
            detail.Stock_Item_ID,
            detail.Stock_Item_Name
        ];

        const key = JSON.stringify(keyParts);

        if (!summaryMap.has(key))
        {
            summaryMap.set(key, {

                Transaction_Date: detail.Transaction_Date,
                Transaction_Month: detail.Transaction_Month,
                Transaction_Year: detail.Transaction_Year,

                Facility_ID: detail.Facility_ID,
                Facility_Name: detail.Facility_Name,

                Contact_ID: detail.Contact_ID,
                Contact_Name: detail.Contact_Name,

                Salesperson_ID: detail.Salesperson_ID,
                Salesperson_Name: null,

                Transaction_Type: detail.Transaction_Type,
                Transaction_Status: detail.Transaction_Status,

                Stock_Item_ID: detail.Stock_Item_ID,
                Stock_Item_Name: detail.Stock_Item_Name,
                Item_Category: detail.Item_Category,

                Transaction_Count: 0,
                Line_Count: 0,
                Total_Quantity: 0,
                Total_Line_Amount: 0
            });
        }

        const summary = summaryMap.get(key);

        summary.Line_Count++;

        summary.Total_Quantity += detail.Quantity ?? 0;
        summary.Total_Line_Amount += detail.Line_Amount ?? 0;
    }

    //------------------------------------------------------
    // Count Unique Transactions Per Summary Group

    const summaryTransactions = new Map();

    for (const detail of detailRows)
    {
        const key = JSON.stringify([
            detail.Transaction_Date,
            detail.Facility_ID,
            detail.Contact_ID,
            detail.Transaction_Type,
            detail.Transaction_Status,
            detail.Stock_Item_ID,
            detail.Stock_Item_Name
        ]);

        if (!summaryTransactions.has(key))
        {
            summaryTransactions.set(key, new Set());
        }

        summaryTransactions.get(key).add(
            `${detail.Facility_ID}:${detail.PC_Transaction_ID}`
        );
    }

    for (const [key, ids] of summaryTransactions)
    {
        summaryMap.get(key).Transaction_Count = ids.size;
    }

    const summaryRows = [...summaryMap.values()];

    //------------------------------------------------------
    // CSV Exports

    const files = [];

    const exportsToWrite = [
        {
            file: "analytics_transactions.csv",
            rows: transactionRows
        },
        {
            file: "analytics_transaction_details.csv",
            rows: detailRows
        },
        {
            file: "analytics_contacts.csv",
            rows: contactRows
        },
        {
            file: "analytics_daily_summary.csv",
            rows: summaryRows
        }
    ];

    for (const item of exportsToWrite)
    {
        const headers = item.rows.length > 0
            ? Object.keys(item.rows[0])
            : [];

        files.push(
            writeCSV(
                outputDirectory,
                item.file,
                headers,
                item.rows
            )
        );
    }

    //------------------------------------------------------
    // Preserve Original API Data

    const jsonFile = path.join(
        outputDirectory,
        "api_response.json"
    );

    fs.writeFileSync(
        jsonFile,
        JSON.stringify({
            startDate,
            endDate,
            contacts,
            transactions
        }, null, 2),
        "utf8"
    );

    files.push(jsonFile);

    //------------------------------------------------------
    // Preview

    console.log("\nTransaction Preview:");

    console.table(
        transactionRows.slice(0, 10).map(row => ({
            ID: row.PC_Transaction_ID,
            Customer: row.Contact_Name,
            Type: row.Transaction_Type,
            Status: row.Transaction_Status,
            Quantity: row.Total_Quantity,
            Amount: row.Total_Amount
        }))
    );

    console.log("\nStock Item Preview:");

    console.table(
        detailRows.slice(0, 10).map(row => ({
            Transaction: row.PC_Transaction_ID,
            Stock_Item: row.Stock_Item_Name,
            Quantity: row.Quantity,
            Unit_Price: row.Unit_Price,
            Amount: row.Line_Amount
        }))
    );

    //------------------------------------------------------
    // Validation Warnings

    if (missingDetailCount > 0)
    {
        console.warn(
            `${missingDetailCount} transactions have no detail lines.`
        );
    }

    if (duplicateCount > 0)
    {
        console.warn(
            `${duplicateCount} duplicate transactions removed.`
        );
    }

    //------------------------------------------------------
    // Return Results

    return {
        outputDirectory,
        files,
        counts: {
            Transactions: transactionRows.length,
            Transaction_Details: detailRows.length,
            Contacts: contactRows.length,
            Daily_Summary_Rows: summaryRows.length,
            Duplicates_Removed: duplicateCount,
            Transactions_Without_Details: missingDetailCount
        }
    };
}

//=================================================
// Exports
//=================================================

module.exports = {
    exportAnalyticsData
};
