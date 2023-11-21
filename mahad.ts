import * as fs from 'fs';

const inputFilePath = 'prod.txt';
const outputFilePath = 'ors-failures.txt';

// Read the input file
fs.readFile(inputFilePath, 'utf8', (error, data) => {
    if (error) {
        console.error('Error reading the input file:', error);
        return;
    }

    // Split the file content into an array of rows
    const rows = data.split('\n');

    // Wrap each row in single quotes and join them with a comma
    const wrappedRows = rows.map(row => `'${row.trim()}'`).join(',\n');

    // Write the wrapped rows to the output file
    fs.writeFile(outputFilePath, wrappedRows, 'utf8', error => {
        if (error) {
            console.error('Error writing the output file:', error);
            return;
        }

        console.log('Output file created successfully!');
    });
});
