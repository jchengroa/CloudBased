/*
 * Export Tool
 * Utility for generating CSV files formatted specifically for ERPNext data importing.
 * Handles the 4-row header requirement and UTF-8 encoding.
 */

window.ExportTool = (function () {

    // helper: safely escape cell values for CSV compatibility
    function escapeCell(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // wrap in quotes if there's a comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    // helper: turn a 2D array into a CSV string
    function buildCsv(rows) {
        return rows
            .map(row => row.map(escapeCell).join(','))
            .join('\r\n');
    }

    // helper: trigger a browser download with UTF-8 BOM
    function downloadCsv(csvString, filename) {
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // exports inventory as "Item" DocType (Item List)
    // Note: Column A is left blank so ERPNext treats these as new entries
    function exportItemMaster(inventoryData) {
        if (!inventoryData || inventoryData.length === 0) {
            alert('No inventory data to export.');
            return;
        }

        // ERPNext 4-row header: Entry Type, Label, Db Key, Metadata
        const headerRow1 = ['', 'Item', 'Item', 'Item', 'Item', 'Item'];
        const headerRow2 = ['ID', 'Item Code', 'Item Name', 'Item Group', 'Stock UOM', 'Is Stock Item'];
        const headerRow3 = ['name', 'item_code', 'item_name', 'item_group', 'stock_uom', 'is_stock_item'];
        const headerRow4 = ['', 'Link', 'Data', 'Link', 'Link', 'Check'];

        const dataRows = inventoryData.map(item => [
            '',                          // blank ID = new record
            item.id       || '',         // item_code
            item.name     || '',         // item_name
            item.category || 'Products', // item_group
            item.uom      || 'Nos',      // stock_uom
            1                            // is_stock_item flag
        ]);

        const csv = buildCsv([headerRow1, headerRow2, headerRow3, headerRow4, ...dataRows]);
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadCsv(csv, `erpnext_item_list_${timestamp}.csv`);
    }

    // exports current quantities as "Stock Reconciliation" DocType
    // valuation_rate is left empty for the user to fill manually before importing
    function exportStockRecon(inventoryData) {
        if (!inventoryData || inventoryData.length === 0) {
            alert('No inventory data to export.');
            return;
        }

        // ERPNext 4-row header: Entry Type, Label, Db Key, Metadata
        const headerRow1 = ['', 'Stock Reconciliation Item', 'Stock Reconciliation Item', 'Stock Reconciliation Item', 'Stock Reconciliation Item'];
        const headerRow2 = ['ID', 'Item Code', 'Warehouse', 'Quantity', 'Valuation Rate'];
        const headerRow3 = ['name', 'item_code', 'warehouse', 'qty', 'valuation_rate'];
        const headerRow4 = ['', 'Link', 'Link', 'Float', 'Currency'];

        const dataRows = inventoryData.map(item => [
            '',                         // blank ID = new record
            item.id        || '',       // item_code
            item.warehouse || '',       // warehouse
            item.quantity  ?? '',       // qty
            ''                          // valuation_rate (fill in ERPNext)
        ]);

        const csv = buildCsv([headerRow1, headerRow2, headerRow3, headerRow4, ...dataRows]);
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadCsv(csv, `erpnext_stock_recon_${timestamp}.csv`);
    }

    return {
        exportItemMaster,
        exportStockRecon
    };

})();
