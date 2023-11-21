import * as fs from 'fs';

// Function to select 79 unique rows based on FIELD003 with the most recent TIMESTMP
function selectUniqueRows(filePath: string) {
    // Read the CSV file
    const csvData = fs.readFileSync(filePath, 'utf-8');

    // Split the CSV data into rows
    const rows = csvData.trim().split('\n');

    // Create a map to store the latest TIMESTMP for each FIELD003
    const latestTimestamps = new Map<string, string>();

    // Iterate through each row
    for (const row of rows) {
        // Split the row into columns
        const [field003, field009, timestmp] = row.trim().split('\t');

        // Check if the FIELD003 is already present in the map
        if (latestTimestamps.has(field003)) {
            // Get the current latest TIMESTMP for the FIELD003
            const currentLatestTimestamp = latestTimestamps.get(field003)!;

            // Compare the current TIMESTMP with the stored latest TIMESTMP
            if (timestmp > currentLatestTimestamp) {
                // Update the latest TIMESTMP for the FIELD003
                latestTimestamps.set(field003, timestmp);
            }
        } else {
            // If the FIELD003 is not present in the map, add it with the current TIMESTMP
            latestTimestamps.set(field003, timestmp);
        }
    }

    // Create an array to store the selected rows
    const selectedRows = [];

    // Iterate through each row again
    for (const row of rows) {
        // Split the row into columns
        const [field003, field009, timestmp] = row.trim().split('\t');

        // Check if the current row has the latest TIMESTMP for the FIELD003
        if (latestTimestamps.get(field003) === timestmp) {
            // Add the row to the selected rows array
            selectedRows.push(row);
        }
    }

    // Take the first 79 rows from the selected rows array
    const uniqueRows = selectedRows.slice(0, 79);

    // Join the unique rows with newlines
    const uniqueData = uniqueRows.join('\n');

    // Write the unique data to the output CSV file
    fs.writeFileSync('itslate.csv', uniqueData, 'utf-8');

    console.log('Unique rows selected successfully. Output saved to output.csv');
}

// Provide the path to the CSV file
const filePath = 'okok.csv';

// Call the function to select 79 unique rows and save the output in output.csv
selectUniqueRows(filePath);
