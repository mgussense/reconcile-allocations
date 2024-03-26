import * as fs from 'fs';
import csv from 'csv-parser';
import { write } from 'fast-csv';

// File paths
const inputCsvPath = './input/order4.csv';
const outputCsvPath = `./output/result-order4.csv`;

// Array to hold filtered rows
const filteredRows: any[] = [];

// Read the CSV and filter rows
fs.createReadStream(inputCsvPath)
    .pipe(csv())
    .on('data', (row) => {
        const createTime = new Date(row['Create Time']);
        const requiredDespatchTime = new Date(row['Required Despatch Time']);

        if (createTime > requiredDespatchTime) {
            filteredRows.push(row);
        }
    })
    .on('end', () => {
        if (filteredRows.length > 0) {
            // Write the filtered rows to a new CSV file
            const writeStream = fs.createWriteStream(outputCsvPath);
            writeStream.on('finish', () => console.log('Result CSV file has been written.'));

            write(filteredRows, { headers: true }).pipe(writeStream);
        } else {
            console.log('No rows meet the condition.');
        }
    });
