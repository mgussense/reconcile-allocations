import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';

type ShortShip = {
    ORDERID: string;
    UPLOAD_DATE: string;
    SKUID: string;
    QTY_ORDERED: number;
    QTY_SHIPPED: number;
    SHORTED: number;
};
let parsedObject;
let temp = new Map();

(() => {
    const csvFilePath = path.resolve(__dirname, 'new.csv');

    const headers = ['ORDERID', 'UPLOAD_DATE', 'SKUID', 'QTY_ORDERED', 'QTY_SHIPPED', 'SHORTED'];

    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    parse(fileContent, {
        delimiter: ',',
        columns: headers,
        fromLine: 2,
        cast: (columnValue, context) => {
            if (context.column === 'QTY_ORDERED' || context.column ==='QTY_SHIPPED' || context.column ==='SHORTED') {
                return parseInt(columnValue, 10);
            }
            return columnValue;
        }
    }, (error, result: ShortShip[]) => {
        if (error) {
            console.error(error);
        }
        parsedObject = result;
        // console.log("parsedObject", parsedObject);

        parsedObject.forEach((e, i, a) => {
            const orderId = e.ORDERID;
            if (!temp.has(orderId)){
                temp.set(orderId, [{sku: e.SKUID, shorted: e.SHORTED}]);
            } else {
                // appends items to value of map
                let value = temp.get(orderId);
                temp.set(orderId, value.push({sku: e.SKUID, shorted: e.SHORTED}))
            }
        })

        for (const[k, v] of temp.entries()) {
            // per order
            // check if value.size > 1
            // get shorted sku
            // get units of the shorted sku that within the order
            // if # of the sku
        }
    });
})();
