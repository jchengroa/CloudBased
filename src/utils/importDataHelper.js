/**
 * Workbook import normalization helper.
 * Converts the Innobake workbook into inventory masters + movement logs
 * without trusting spreadsheet stock-on-hand columns as source of truth.
 */
(function() {
    const SHEET_ALIASES = {
        inventory: ['inventory'],
        items: ['items', 'item master', 'item'],
        receive: ['receive', 'received', 'arrivals', 'arrival', 'input'],
        out: ['out', 'shipments', 'shipment', 'output', 'stock out']
    };

    const normalizeText = (value) => String(value || '').trim();
    const normalizeKey = (value) => normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
    const isBlank = (value) => value === null || value === undefined || normalizeText(value) === '' || value === '#';

    const toNumber = (value) => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const cleaned = normalizeText(value).replace(/,/g, '');
        if (!cleaned || cleaned === '#') return 0;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const findHeaderValue = (row, aliases) => {
        const keys = Object.keys(row);
        const normalizedAliases = aliases.map(normalizeKey);
        const match = keys.find((key) => normalizedAliases.includes(normalizeKey(key)));
        return match ? row[match] : undefined;
    };

    const findSheetName = (sheetNames, aliases) => {
        const normalizedAliases = aliases.map(normalizeKey);
        return sheetNames.find((name) => normalizedAliases.includes(normalizeKey(name))) || null;
    };

    const sheetToObjects = (worksheet) => {
        if (!worksheet) return [];
        return window.XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: true
        }).filter((row) => Object.values(row).some((value) => !isBlank(value)));
    };

    const inferWorkbookYear = (workbookName) => {
        const match = String(workbookName || '').match(/\b(20\d{2})\b/);
        return match ? Number(match[1]) : new Date().getFullYear();
    };

    const parseDateValue = (value, workbookYear, warnings, contextLabel) => {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value.toISOString().split('T')[0];
        }

        if (typeof value === 'number' && Number.isFinite(value) && window.XLSX?.SSF?.parse_date_code) {
            const parsed = window.XLSX.SSF.parse_date_code(value);
            if (parsed?.y && parsed?.m && parsed?.d) {
                return new Date(parsed.y, parsed.m - 1, parsed.d).toISOString().split('T')[0];
            }
        }

        const text = normalizeText(value);
        if (!text) return '';

        const fullDate = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (fullDate) {
            let [, month, day, year] = fullDate;
            let numericYear = Number(year);
            if (numericYear < 100) numericYear += 2000;
            return new Date(numericYear, Number(month) - 1, Number(day)).toISOString().split('T')[0];
        }

        const monthDay = text.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
        if (monthDay) {
            const [, month, day] = monthDay;
            warnings.push(`${contextLabel}: interpreted partial date "${text}" as ${workbookYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}.`);
            return new Date(workbookYear, Number(month) - 1, Number(day)).toISOString().split('T')[0];
        }

        const native = new Date(text);
        if (!Number.isNaN(native.getTime())) {
            return native.toISOString().split('T')[0];
        }

        warnings.push(`${contextLabel}: could not parse date "${text}". The row will use today's date when saved.`);
        return '';
    };

    const makeTransactionId = (prefix, itemCode, date, index) => {
        const safeCode = normalizeText(itemCode) || 'UNKNOWN';
        const safeDate = normalizeText(date) || 'UNDATED';
        return `${prefix}-${safeCode}-${safeDate}-${String(index + 1).padStart(4, '0')}`;
    };

    const buildInventoryMap = (itemRows, inventoryRows) => {
        const inventoryMap = new Map();

        itemRows.forEach((row) => {
            const itemCode = normalizeText(findHeaderValue(row, ['itemcode', 'code']));
            if (!itemCode) return;

            inventoryMap.set(itemCode, {
                id: itemCode,
                itemCode,
                name: normalizeText(findHeaderValue(row, ['itemname', 'name'])) || itemCode,
                description: normalizeText(findHeaderValue(row, ['description', 'desc'])),
                category: normalizeText(findHeaderValue(row, ['itemgroup', 'category', 'group'])),
                uom: normalizeText(findHeaderValue(row, ['uom', 'unitofmeasure'])),
                optimalStock: 0,
                quantity: 0,
                isRestocked: 'No'
            });
        });

        inventoryRows.forEach((row) => {
            const itemCode = normalizeText(findHeaderValue(row, ['itemcode', 'code'])) || normalizeText(row.__firstColumn);
            if (!itemCode) return;

            const current = inventoryMap.get(itemCode) || {
                id: itemCode,
                itemCode,
                name: itemCode,
                description: '',
                category: '',
                uom: '',
                optimalStock: 0,
                quantity: 0,
                isRestocked: 'No'
            };

            const description = normalizeText(findHeaderValue(row, ['weightpcperqty', 'description', 'itemname', 'name']));
            const uom = normalizeText(findHeaderValue(row, ['uom', 'uom1', 'unitofmeasure']));

            inventoryMap.set(itemCode, {
                ...current,
                description: current.description || description,
                name: current.name === itemCode && description ? description : current.name,
                uom: current.uom || uom
            });
        });

        return inventoryMap;
    };

    const buildLogs = (rows, type, workbookYear, warnings) => {
        const prefix = type === 'input' ? 'IMP-IN' : 'IMP-OUT';
        return rows.reduce((logs, row, index) => {
            const itemCode = normalizeText(findHeaderValue(row, ['itemcode', 'code'])) || normalizeText(row['__firstColumn']);
            const itemName = normalizeText(findHeaderValue(row, ['itemname', 'name']));
            const description = normalizeText(findHeaderValue(row, ['description', 'desc']));
            const quantity = toNumber(findHeaderValue(row, type === 'input'
                ? ['qty', 'quantity', 'qtyreceived', 'qtyexpanded', 'quantityexpanded']
                : ['quantity', 'qty', 'quantityexpanded']));
            const date = parseDateValue(findHeaderValue(row, ['date']), workbookYear, warnings, `${type === 'input' ? 'Receive' : 'Out'} row ${index + 2}`);
            const supplier = normalizeText(findHeaderValue(row, ['company', 'supplier']));
            const batchLot = normalizeText(findHeaderValue(row, ['batchlot', 'lotno', 'lot', 'batch']));

            if (!itemCode || quantity <= 0) return logs;

            logs.push({
                transactionId: makeTransactionId(prefix, itemCode, date, index),
                itemCode,
                name: itemName || itemCode,
                description,
                quantity,
                date,
                supplier,
                batchLot,
                user: 'System'
            });
            return logs;
        }, []);
    };

    const addFirstColumnAlias = (rows) => {
        return rows.map((row) => {
            const entries = Object.entries(row);
            const firstValue = entries.length > 0 ? entries[0][1] : '';
            return { ...row, __firstColumn: firstValue };
        });
    };

    const applyDerivedQuantities = (inventoryMap, inputLogs, outputLogs) => {
        const totals = new Map();

        inputLogs.forEach((log) => {
            totals.set(log.itemCode, (totals.get(log.itemCode) || 0) + (parseFloat(log.quantity) || 0));
        });
        outputLogs.forEach((log) => {
            totals.set(log.itemCode, (totals.get(log.itemCode) || 0) - (parseFloat(log.quantity) || 0));
        });

        inventoryMap.forEach((item, itemCode) => {
            inventoryMap.set(itemCode, {
                ...item,
                quantity: totals.get(itemCode) || 0
            });
        });

        totals.forEach((quantity, itemCode) => {
            if (!inventoryMap.has(itemCode)) {
                inventoryMap.set(itemCode, {
                    id: itemCode,
                    itemCode,
                    name: itemCode,
                    description: '',
                    category: '',
                    uom: '',
                    optimalStock: 0,
                    quantity,
                    isRestocked: 'No'
                });
            }
        });
    };

    const compareByKey = (currentItems, importedItems, keyFields) => {
        const currentMap = new Map();
        currentItems.forEach((item) => {
            const key = keyFields.map((field) => normalizeText(item[field])).find(Boolean);
            if (key) currentMap.set(key, item);
        });

        const stats = { added: [], updated: [], unchanged: 0 };

        importedItems.forEach((item) => {
            const key = keyFields.map((field) => normalizeText(item[field])).find(Boolean);
            if (!key) return;

            const existing = currentMap.get(key);
            if (!existing) {
                stats.added.push(item);
                return;
            }

            const changes = Object.keys(item).reduce((list, field) => {
                const nextValue = item[field] ?? '';
                const prevValue = existing[field] ?? '';
                if (String(nextValue) !== String(prevValue)) {
                    list.push({ field, from: prevValue, to: nextValue });
                }
                return list;
            }, []);

            if (changes.length > 0) {
                stats.updated.push({
                    id: key,
                    name: item.name || item.itemCode || item.transactionId || key,
                    changes,
                    mapped: item,
                    original: existing
                });
            } else {
                stats.unchanged += 1;
            }
        });

        return stats;
    };

    window.ImportDataHelper = {
        parseWorkbook(workbook, options = {}) {
            if (!workbook || !window.XLSX) throw new Error('Spreadsheet parser is unavailable.');

            const warnings = [];
            const workbookYear = inferWorkbookYear(options.workbookName || '');
            const sheetNames = workbook.SheetNames || [];

            const inventorySheetName = findSheetName(sheetNames, SHEET_ALIASES.inventory);
            const itemsSheetName = findSheetName(sheetNames, SHEET_ALIASES.items);
            const receiveSheetName = findSheetName(sheetNames, SHEET_ALIASES.receive);
            const outSheetName = findSheetName(sheetNames, SHEET_ALIASES.out);

            const inventoryRows = addFirstColumnAlias(sheetToObjects(workbook.Sheets[inventorySheetName]));
            const itemRows = addFirstColumnAlias(sheetToObjects(workbook.Sheets[itemsSheetName]));
            const receiveRows = addFirstColumnAlias(sheetToObjects(workbook.Sheets[receiveSheetName]));
            const outRows = addFirstColumnAlias(sheetToObjects(workbook.Sheets[outSheetName]));

            if (!itemsSheetName && !inventorySheetName) {
                throw new Error('No inventory master sheet found. Expected an Items or Inventory tab.');
            }

            if (!receiveSheetName && !outSheetName) {
                warnings.push('No Receive or Out sheets were found. Imported quantities will stay at zero.');
            }

            const inventoryMap = buildInventoryMap(itemRows, inventoryRows);
            const inputLogs = buildLogs(receiveRows, 'input', workbookYear, warnings);
            const outputLogs = buildLogs(outRows, 'output', workbookYear, warnings);

            applyDerivedQuantities(inventoryMap, inputLogs, outputLogs);

            return {
                workbookName: options.workbookName || 'Workbook',
                workbookYear,
                sourceSheets: {
                    inventory: inventorySheetName,
                    items: itemsSheetName,
                    receive: receiveSheetName,
                    out: outSheetName
                },
                inventory: Array.from(inventoryMap.values()).sort((a, b) => a.itemCode.localeCompare(b.itemCode)),
                inputLogs,
                outputLogs,
                suppliers: [],
                warnings,
                summary: {
                    inventoryCount: inventoryMap.size,
                    inputLogCount: inputLogs.length,
                    outputLogCount: outputLogs.length
                }
            };
        },

        buildReview(importData, currentData) {
            return {
                inventory: compareByKey(currentData.inventory || [], importData.inventory || [], ['itemCode', 'id']),
                inputLogs: compareByKey(currentData.inputLogs || [], importData.inputLogs || [], ['transactionId', 'id']),
                outputLogs: compareByKey(currentData.outputLogs || [], importData.outputLogs || [], ['transactionId', 'id']),
                warnings: importData.warnings || [],
                summary: importData.summary || {}
            };
        }
    };
})();
