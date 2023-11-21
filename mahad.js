"use strict";
exports.__esModule = true;
var fs = require("fs");
var inputFilePath = 'prod.txt';
var outputFilePath = 'margaret.txt';
// Read the input file
fs.readFile(inputFilePath, 'utf8', function (error, data) {
    if (error) {
        console.error('Error reading the input file:', error);
        return;
    }
    // Split the file content into an array of rows
    var rows = data.split('\n');
    // Wrap each row in single quotes and join them with a comma
    var wrappedRows = rows.map(function (row) { return "'" + row.trim() + "'"; }).join(',\n');
    // Write the wrapped rows to the output file
    fs.writeFile(outputFilePath, wrappedRows, 'utf8', function (error) {
        if (error) {
            console.error('Error writing the output file:', error);
            return;
        }
        console.log('Output file created successfully!');
    });
});
