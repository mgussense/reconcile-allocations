import * as fs from 'fs';
import { parse } from 'csv-parse';

interface CSVRow {
    orderId: string;
    status: string;
    date: string;
}

interface CSVObject {
    [key: string]: CSVRow[];
}

async function parseCSV(filePath: string): Promise<CSVRow[]> {
    return new Promise<CSVRow[]>((resolve, reject) => {
        const rows: CSVRow[] = [];

        fs.createReadStream(filePath)
            .pipe(parse({ columns: true }))
            .on('data', (data: CSVRow) => {
                rows.push(data);
            })
            .on('error', (error: Error) => {
                reject(error);
            })
            .on('end', () => {
                resolve(rows);
            });
    });
}

async function parseCSVFiles(file1: string, file2: string): Promise<CSVObject[]> {
    const csvObjects: CSVObject[] = [];

    try {
        const file1Rows = await parseCSV(file1);
        const file2Rows = await parseCSV(file2);

        const csvObject1: CSVObject = { file1Rows };
        const csvObject2: CSVObject = { file2Rows };

        csvObjects.push(csvObject1, csvObject2);
    } catch (error) {
        console.error('An error occurred while parsing CSV files:', error);
    }

    return csvObjects;
}

// Function to write an array to a text file
function writeArrayToFile(filename: string, array: any[]) {
    const content = array.join('\n');

    fs.writeFile(filename, content, (err) => {
        if (err) {
            console.error('An error occurred while writing the file:', err);
        } else {
            console.log(`Array successfully written to ${filename}`);
        }
    });
}

// Usage example
const wms = 'hjCutover/wms.csv';
const hqm = 'hjCutover/hqm.csv';
let wmsObject: CSVRow[];
let hqmObject: CSVRow[];
let wmsmap = new Map<string, string>();
let hqmmap = new Map<string, string>();
let missing:string[] = [];
let extra:string[]  = [];

parseCSVFiles(wms, hqm)
    .then((csvObjects: CSVObject[]) => {
        console.log('CSV files parsed successfully!');
        console.log('Parsed CSV Objects:');
        wmsObject = csvObjects[0].file1Rows;
        hqmObject = csvObjects[1].file2Rows;
        console.log(wmsObject);
        console.log(hqmObject);

        wmsObject.forEach((row, i, a) => {
            const {orderId, status} = row;
            wmsmap.set(orderId, status);
        })
        hqmObject.forEach((row, i, a) => {
            const {orderId, status} = row;
            hqmmap.set(orderId, status);
        })

        for (const[k,v] of wmsmap.entries()) {
            if (!hqmmap.has(k)){
                missing.push(k);
            }
        }
        for (const[k,v] of hqmmap.entries()) {
            if (!wmsmap.has(k)){
                extra.push(k);
            }
        }
        console.log("Orders that were unable to process: ", missing);
        console.log("Orders that were not recorded before rollout: ", extra);

        writeArrayToFile('orders_not_processed.txt', missing);
        writeArrayToFile('orders_not_recorded_before_rollout.txt', extra);
    })
    .catch((error) => {
        console.error('An error occurred:', error);
    });


