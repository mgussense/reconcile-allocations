import * as fs from 'fs';

function readAndParseFile(filename: string): string[] {
    const data = fs.readFileSync(filename, 'utf-8');
    // Assuming each entry is on a new line, you can modify this based on your file format
    return data.split('\n').map(entry => entry.trim());
}

function findUniqueEntries(fileA: string[], fileB: string[]): string[] {
    const setA = new Set(fileA);
    const setB = new Set(fileB);

    // Find entries that are unique to fileA
    const uniqueEntries = fileA.filter(entry => !setB.has(entry));

    return uniqueEntries;
}

function writeToFile(filename: string, data: string[]): void {
    const content = data.join('\n');
    fs.writeFileSync(filename, content, 'utf-8');
}

// Read files A.txt and B.txt
const fileA = readAndParseFile('A.txt');
const fileB = readAndParseFile('B.txt');

// Find unique entries in fileA
const uniqueEntries = findUniqueEntries(fileA, fileB);

// Write unique entries to unique.txt
writeToFile('unique.txt', uniqueEntries);

console.log('Unique entries have been written to unique.txt');
