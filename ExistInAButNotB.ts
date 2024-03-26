import * as fs from 'fs';
import * as path from 'path';

const fileA = 'fileA.txt';
const fileB = 'fileB.txt';
const outputFile = 'uniqueInAButNotB.txt';

const readLines = (filePath: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Error reading file ${filePath}: ${err.message}`);
                return;
            }
            resolve(data.split('\n').filter(line => line.trim() !== ''));
        });
    });
};

const findUnique = async () => {
    try {
        const listA = await readLines(fileA);
        const listB = await readLines(fileB);
        const unique = listA.filter(value => !listB.includes(value));

        fs.writeFile(outputFile, unique.join('\n'), 'utf8', (err) => {
            if (err) {
                console.error(`Error writing to file: ${err.message}`);
                return;
            }
            console.log(`Unique values written to ${outputFile}`);
        });
    } catch (err) {
        console.error(err);
    }
};

findUnique();
