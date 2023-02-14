import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';
// import { CsvDataService } from "./objectToCsv";

type ShortShip = {
    ORDERID: string;
    UPLOAD_DATE: string;
    SKUID: string;
    QTY_ORDERED: number;
    QTY_SHIPPED: number;
    SHORTED: number;
};
type SkuInfoObject = {
    sku: string;
    abandonedCount: number;
    shippedCount: number;
    date: string;
}

export type ReconciledResult = {
    SKU: string;
    COUNT_TO_RECONCILE: number;
    SHIPPED_COUNT: number;
    ABANDONED_COUNT: number;
    ORDER_ID: string;
    DATE: string;
}
let parsedObject: ShortShip[];
let skusToReconcile: ReconciledResult[] = [];
/**
 * key: orderId
 * value: skuInfoObject[]
 * skuInfoObject: {sku: string, abandonedCount: number, shippedCount: number}
 * abandonedCount = total units of a sku for an order that were abandoned
 * shippedCount = total units of a sku for an order that were shipped
 **/
let map = new Map<string, SkuInfoObject[]>();

/** EXAMPLE USE CASE
 * Order contains 5 units of the same sku
 * 3 is shipped/short shipped, 2 abandoned
 * before bug fix, IMS is only notified of 1 unallocation due to duplicate dedupId
 * we want to compute the actual total unallocation required for reconciliation = #shortShipped - 1
 **/

(() => {
    /** convert csv to object **/
    const csvFilePath = path.resolve(__dirname, 'allocation_raw.csv');
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

        /** use case validation starts here **/
        parsedObject.forEach((e, i, a) => {
            const orderId = e.ORDERID;
            const currentSku = e.SKUID;
            if (!map.has(orderId)){
                map.set(orderId, [{sku: e.SKUID, abandonedCount: e.SHORTED, shippedCount: e.QTY_SHIPPED, date: e.UPLOAD_DATE}]);
            } else {
                // @ts-ignore
                let listOfSkusForAnOrder: SkuInfoObject[] = map.get(orderId);
                const skuExists = listOfSkusForAnOrder.some((s) => s.sku === currentSku);
                // if sku already in map = inc totalCount, check if SHORTED = 1, inc abandonedCount
                // SHORTED col definition: 1 = abandoned, 0 = not shorted/shipped
                if (skuExists){
                    const indexToUpdate = listOfSkusForAnOrder.findIndex((s) => s.sku === currentSku);
                    // if sku already exists in map, then update sku object instance in values of map
                    listOfSkusForAnOrder[indexToUpdate] = {
                        sku: e.SKUID,
                        abandonedCount: e.SHORTED + listOfSkusForAnOrder[indexToUpdate].abandonedCount,
                        shippedCount: e.QTY_SHIPPED + listOfSkusForAnOrder[indexToUpdate].shippedCount,
                        date: e.UPLOAD_DATE
                    };
                    map.set(orderId, listOfSkusForAnOrder);
                } else {
                    // if sku info for a given order doesn't exit in map, we append a new sku object instance
                    // @ts-ignore
                    listOfSkusForAnOrder.push({sku: e.SKUID, abandonedCount: e.SHORTED, shippedCount: e.QTY_SHIPPED, date: e.UPLOAD_DATE});
                    map.set(orderId, listOfSkusForAnOrder);
                }
            }
        })

        for (const[k, v] of map.entries()) {
            // ignore single line item orders
            if (v.length <= 1) continue;
            // look for skus with shipped quantity >= 2
            const temp = v.filter((s: {sku: string; abandonedCount: number; shippedCount: number; date: string}) => s.shippedCount >= 2)
                .map(({ sku, abandonedCount, shippedCount , date}) => (
                    skusToReconcile.push({
                        SKU: sku,
                        COUNT_TO_RECONCILE: shippedCount - 1,
                        SHIPPED_COUNT: shippedCount,
                        ABANDONED_COUNT: abandonedCount,
                        ORDER_ID: k,
                        DATE: date
                    })));
        }
        console.log(JSON.stringify(skusToReconcile));
        // CsvDataService.exportToCsv('result.csv', skusToReconcile);
    });
})();


