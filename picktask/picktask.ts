import fs from 'fs';
import csv from 'csv-parser';
import { format } from 'date-fns';
import path from 'path';

// Define the input CSV file path
const inputCsvPath = './input/pickt1652.csv';

// Extract the base name of the input CSV file
const baseFileName = path.basename(inputCsvPath, path.extname(inputCsvPath));

// Construct the output file paths based on the input file name
const resultCsvPath = `./output/result-${baseFileName}.csv`;
const agedOrdersCsvPath = `./agedOrders/agedOrders-${baseFileName}.csv`;

// Initialize counters and arrays
let totalRows = 0;
let pickTasksGenerated = 0;
let agedOrders = 0;
const agedOrdersRows: string[] = [];

// Create a stream to read the CSV
fs.createReadStream(inputCsvPath)
    .pipe(csv())
    .on('data', (data) => {
        totalRows++;
        if (data['Pick Task']) pickTasksGenerated++;
        const pickTaskCreateTime = new Date(data['Pick Task - Create Time']);
        const priorityTime = new Date(data['Priority Time']);
        if (pickTaskCreateTime > priorityTime) {
            agedOrders++;
            agedOrdersRows.push(JSON.stringify(data));
        }
    })
    .on('end', () => {
        // Write to the result CSV
        fs.writeFileSync(resultCsvPath, `volume,${totalRows}\npick tasks generated,${pickTasksGenerated}\naged orders,${agedOrders}`);

        // Write the aged-orders.csv
        if (agedOrdersRows.length > 0) {
            const headers = Object.keys(JSON.parse(agedOrdersRows[0]));
            fs.writeFileSync(agedOrdersCsvPath, headers.join(',') + '\n' + agedOrdersRows.map(row => JSON.parse(row)).map(row => headers.map(header => row[header]).join(',')).join('\n'));
        } else {
            fs.writeFileSync(agedOrdersCsvPath, "No aged orders found.");
        }

        console.log('CSV processing complete.');
    });
