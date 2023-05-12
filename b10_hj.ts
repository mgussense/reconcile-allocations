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

// Usage example
const b10 = 'hjCutover/b10.csv';
const b17 = 'hjCutover/b17.csv';
let b10Object: CSVRow[];
let b17Object: CSVRow[];
let b10map = new Map<string, string>();
let b17map = new Map<string, string>();
let missing:string[] = [];
let extra:string[]  = [];

parseCSVFiles(b10, b17)
    .then((csvObjects: CSVObject[]) => {
        console.log('CSV files parsed successfully!');
        console.log('Parsed CSV Objects:');
        b10Object = csvObjects[0].file1Rows;
        b17Object = csvObjects[1].file2Rows;
        console.log(b10Object);
        console.log(b17Object);

        b10Object.forEach((row, i, a) => {
            const {orderId, status} = row;
            b10map.set(orderId, status);
        })
        b17Object.forEach((row, i, a) => {
            const {orderId, status} = row;
            b17map.set(orderId, status);
        })

        for (const[k,v] of b10map.entries()) {
            if (!b17map.has(k)){
                missing.push(k);
            }
        }
        for (const[k,v] of b17map.entries()) {
            if (!b10map.has(k)){
                extra.push(k);
            }
        }
        console.log(missing);
        console.log(extra);
    })
    .catch((error) => {
        console.error('An error occurred:', error);
    });


