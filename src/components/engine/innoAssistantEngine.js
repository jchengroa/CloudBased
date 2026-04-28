/**
 * InnoAssistant Engine
 * Handles natural language command parsing and action resolution.
 */
const useInnoAssistantEngine = (inventoryData, outputLogs, inputLogs, supplierData, customerData, user, onPerformAction) => {
    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(action);
    };

    const [command, setCommand] = React.useState('');
    const [isThinking, setIsThinking] = React.useState(false);
    const [parsedResult, setParsedResult] = React.useState(null);

    const getThreshold = React.useCallback((item) => {
        const settings = user?.settings || {};
        if (settings.isThresholdEnabled && settings.lowStockThreshold) {
            return parseFloat(settings.lowStockThreshold) || 0;
        }
        return parseFloat(item.optimalStock) || 0;
    }, [user]);

    const normalizeText = React.useCallback((value) => (value || '').toString().trim().toLowerCase(), []);

    const getItemKey = React.useCallback((item) => [item.id, item.itemCode, item.name]
        .filter(Boolean)
        .map((value) => normalizeText(value)), [normalizeText]);

    const buildLogRecordDate = React.useCallback((log) => {
        if (log.date) return log.date;
        if (log.created) return log.created.split(' ')[0];
        if (log.timestamp) return new Date(log.timestamp).toISOString().split('T')[0];
        return new Date().toISOString().split('T')[0];
    }, []);

    const inventoryIndex = React.useMemo(() => {
        return inventoryData.reduce((acc, item) => {
            getItemKey(item).forEach((key) => {
                acc[key] = item;
            });
            return acc;
        }, {});
    }, [inventoryData, getItemKey]);

    const supplierById = React.useMemo(() => {
        return supplierData.reduce((acc, supplier) => {
            acc[String(supplier.id)] = supplier;
            return acc;
        }, {});
    }, [supplierData]);

    const customerById = React.useMemo(() => {
        return customerData.reduce((acc, customer) => {
            acc[String(customer.id)] = customer;
            return acc;
        }, {});
    }, [customerData]);

    const warehouseNames = React.useMemo(() => [...new Set(inventoryData.map((item) => item.warehouse).filter(Boolean))], [inventoryData]);

    const unifiedLogs = React.useMemo(() => {
        const wrap = (log, type) => ({
            ...log,
            type,
            itemCode: log.itemCode || log.id,
            date: buildLogRecordDate(log)
        });

        return [
            ...inputLogs.map((log) => wrap(log, 'input')),
            ...outputLogs.map((log) => wrap(log, 'output'))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [inputLogs, outputLogs, buildLogRecordDate]);

    const analytics = React.useMemo(() => {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 86400000);
        const fortyFiveDaysAgo = now - (45 * 86400000);

        const outputStatsByItem = {};
        const lastMovementByItem = {};
        const movementByWarehouse = {};

        unifiedLogs.forEach((log) => {
            const itemId = String(log.itemCode);
            const logTime = new Date(log.date).getTime();
            if (Number.isNaN(logTime)) return;

            if (!lastMovementByItem[itemId] || logTime > lastMovementByItem[itemId]) {
                lastMovementByItem[itemId] = logTime;
            }

            const item = inventoryData.find((entry) => String(entry.id) === itemId);
            const warehouse = item?.warehouse || 'Unassigned';
            if (!movementByWarehouse[warehouse]) {
                movementByWarehouse[warehouse] = { arrivals: 0, shipments: 0 };
            }

            if (log.type === 'input') movementByWarehouse[warehouse].arrivals += parseFloat(log.quantity) || 0;
            else movementByWarehouse[warehouse].shipments += parseFloat(log.quantity) || 0;

            if (log.type === 'output' && logTime >= thirtyDaysAgo) {
                outputStatsByItem[itemId] = (outputStatsByItem[itemId] || 0) + (parseFloat(log.quantity) || 0);
            }
        });

        const lowItems = [];
        const predictiveItems = [];
        const dataIssues = [];
        const dormantItems = [];

        inventoryData.forEach((item) => {
            const stock = parseFloat(item.quantity) || 0;
            const threshold = getThreshold(item);
            const category = normalizeText(item.category);
            const isProduct = category.includes('product');
            const dailyBurn = (outputStatsByItem[String(item.id)] || 0) / 30;
            const daysRemaining = dailyBurn > 0 ? Math.floor(stock / dailyBurn) : Infinity;

            if (stock < threshold && item.isRestocked !== 'Yes' && item.isRestocked !== 'I') {
                lowItems.push({ ...item, threshold, daysRemaining });
            }

            if (dailyBurn > 0 && daysRemaining <= 14 && item.isRestocked !== 'Yes' && item.isRestocked !== 'I') {
                predictiveItems.push({ ...item, dailyBurn, daysRemaining, threshold });
            }

            const issues = [];
            if (!item.warehouse) issues.push('missing warehouse');
            if (!isProduct && !item.supplier) issues.push('missing supplier');
            if (isProduct && !item.customer) issues.push('missing customer');
            if (issues.length) dataIssues.push({ ...item, issues });

            const lastMovement = lastMovementByItem[String(item.id)];
            if ((parseFloat(item.quantity) || 0) > 0 && (!lastMovement || lastMovement < fortyFiveDaysAgo)) {
                dormantItems.push({
                    ...item,
                    idleDays: lastMovement ? Math.floor((now - lastMovement) / 86400000) : null
                });
            }
        });

        return {
            lowItems: lowItems.sort((a, b) => (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity)),
            predictiveItems: predictiveItems.sort((a, b) => a.daysRemaining - b.daysRemaining),
            dataIssues,
            dormantItems: dormantItems.sort((a, b) => (b.idleDays || Infinity) - (a.idleDays || Infinity)),
            movementByWarehouse
        };
    }, [unifiedLogs, inventoryData, getThreshold, normalizeText]);

    const resolveDate = React.useCallback((lowerCmd) => {
        const now = new Date();
        if (lowerCmd.includes('yesterday')) {
            now.setDate(now.getDate() - 1);
        }
        return now.toISOString().split('T')[0];
    }, []);

    const findItemFromCommand = React.useCallback((lowerCmd) => {
        const directMatch = Object.keys(inventoryIndex).find((key) => lowerCmd.includes(key));
        if (directMatch) return inventoryIndex[directMatch];

        return inventoryData.find((item) => {
            const itemName = normalizeText(item.name);
            return itemName && itemName.split(' ').some((word) => word.length > 2 && lowerCmd.includes(word));
        }) || null;
    }, [inventoryData, inventoryIndex, normalizeText]);

    const findSupplierFromCommand = React.useCallback((lowerCmd) => {
        return supplierData.find((supplier) => {
            const name = normalizeText(supplier.name);
            return name && lowerCmd.includes(name);
        }) || null;
    }, [supplierData, normalizeText]);

    const findCustomerFromCommand = React.useCallback((lowerCmd) => {
        return customerData.find((customer) => {
            const name = normalizeText(customer.name);
            return name && lowerCmd.includes(name);
        }) || null;
    }, [customerData, normalizeText]);

    const findWarehouseFromCommand = React.useCallback((lowerCmd) => {
        return warehouseNames.find((warehouse) => lowerCmd.includes(normalizeText(warehouse))) || null;
    }, [warehouseNames, normalizeText]);

    const summarizeMovement = React.useCallback((lowerCmd, selectedDate) => {
        const selectedLogs = unifiedLogs.filter((log) => log.date === selectedDate);
        const arrivals = selectedLogs.filter((log) => log.type === 'input');
        const shipments = selectedLogs.filter((log) => log.type === 'output');
        const arrivalQty = arrivals.reduce((sum, log) => sum + (parseFloat(log.quantity) || 0), 0);
        const shipmentQty = shipments.reduce((sum, log) => sum + (parseFloat(log.quantity) || 0), 0);

        if (!selectedLogs.length) {
            return { isQuery: true, answer: `No recorded inventory movement was found for ${selectedDate}.` };
        }

        if (lowerCmd.includes('ship')) {
            return { isQuery: true, answer: `${shipments.length} shipment record(s) were logged on ${selectedDate}, totaling ${shipmentQty} units.` };
        }

        if (lowerCmd.includes('arrival') || lowerCmd.includes('receive') || lowerCmd.includes('input')) {
            return { isQuery: true, answer: `${arrivals.length} arrival record(s) were logged on ${selectedDate}, totaling ${arrivalQty} units.` };
        }

        return {
            isQuery: true,
            answer: `On ${selectedDate}, the system recorded ${arrivals.length} arrival(s) totaling ${arrivalQty} units and ${shipments.length} shipment(s) totaling ${shipmentQty} units.`
        };
    }, [unifiedLogs]);

    const answerQuery = React.useCallback((lowerCmd, selectedDate) => {
        const targetItem = findItemFromCommand(lowerCmd);
        const targetSupplier = findSupplierFromCommand(lowerCmd);
        const targetCustomer = findCustomerFromCommand(lowerCmd);
        const targetWarehouse = findWarehouseFromCommand(lowerCmd);

        if (lowerCmd.includes('automation') || lowerCmd.includes('urgent') || lowerCmd.includes('problem') || lowerCmd.includes('recommended action')) {
            const topIssues = [
                ...analytics.lowItems.slice(0, 3).map((item) => `${item.name} (${item.quantity}/${item.threshold})`),
                ...analytics.dataIssues.slice(0, 2).map((item) => `${item.name} (${item.issues.join(', ')})`)
            ];

            return {
                isQuery: true,
                answer: `I found ${analytics.lowItems.length} low-stock item(s), ${analytics.predictiveItems.length} forecast risk(s), ${analytics.dataIssues.length} setup issue(s), and ${analytics.dormantItems.length} dormant stock item(s).`,
                bullets: topIssues.length ? topIssues : ['No urgent automation issues are currently flagged.']
            };
        }

        if (lowerCmd.includes('missing supplier') || lowerCmd.includes('missing customer') || lowerCmd.includes('missing warehouse') || lowerCmd.includes('setup issue')) {
            const issues = analytics.dataIssues.slice(0, 8).map((item) => `${item.name}: ${item.issues.join(', ')}`);
            return {
                isQuery: true,
                answer: issues.length ? `I found ${analytics.dataIssues.length} catalog setup issue(s).` : 'I did not find any missing supplier, customer, or warehouse links.',
                bullets: issues
            };
        }

        if (lowerCmd.includes('dead stock') || lowerCmd.includes('dormant') || lowerCmd.includes('slow moving') || lowerCmd.includes('idle stock')) {
            const dormant = analytics.dormantItems.slice(0, 6).map((item) =>
                `${item.name}: ${item.quantity} ${item.uom || 'units'} idle${item.idleDays ? ` for ${item.idleDays} days` : ''}`
            );
            return {
                isQuery: true,
                answer: dormant.length ? `I found ${analytics.dormantItems.length} item(s) with little or no recent movement.` : 'No dormant stock items were detected from the current history.',
                bullets: dormant
            };
        }

        if (lowerCmd.includes('predict') || lowerCmd.includes('forecast') || lowerCmd.includes('stock-out') || lowerCmd.includes('run out')) {
            const risks = analytics.predictiveItems.slice(0, 6).map((item) =>
                `${item.name}: ${item.daysRemaining} day${item.daysRemaining !== 1 ? 's' : ''} remaining at ${item.dailyBurn.toFixed(2)}/day`
            );
            return {
                isQuery: true,
                answer: risks.length ? `I found ${analytics.predictiveItems.length} item(s) trending toward shortage.` : 'No predictive stock-out risks are currently flagged.',
                bullets: risks
            };
        }

        if (lowerCmd.includes('restock') || lowerCmd.includes('low stock') || lowerCmd.includes('critical') || lowerCmd.includes('reorder') || lowerCmd.includes('needed')) {
            const lowItems = analytics.lowItems.slice(0, 8);

            if (!lowItems.length) {
                return { isQuery: true, answer: 'Everything currently looks safe. No active low-stock items need immediate replenishment.' };
            }

            return {
                isQuery: true,
                answer: `I found ${analytics.lowItems.length} replenishment priority item(s).`,
                bullets: lowItems.map((item) => `${item.name}: ${item.quantity}/${item.threshold} ${item.uom || 'units'}`)
            };
        }

        if (targetWarehouse && (lowerCmd.includes('warehouse') || lowerCmd.includes('location') || lowerCmd.includes('status'))) {
            const items = inventoryData.filter((item) => item.warehouse === targetWarehouse);
            const lowCount = items.filter((item) => (parseFloat(item.quantity) || 0) < getThreshold(item)).length;
            const criticalCount = items.filter((item) => (parseFloat(item.quantity) || 0) <= 0).length;
            const movement = analytics.movementByWarehouse[targetWarehouse] || { arrivals: 0, shipments: 0 };
            return {
                isQuery: true,
                answer: `${targetWarehouse} currently holds ${items.length} item(s), with ${lowCount} below threshold and ${criticalCount} out of stock.`,
                bullets: [
                    `30-day arrivals: ${movement.arrivals}`,
                    `30-day shipments: ${movement.shipments}`
                ]
            };
        }

        if (lowerCmd.includes('warehouse') && (lowerCmd.includes('list') || lowerCmd.includes('show'))) {
            return {
                isQuery: true,
                answer: warehouseNames.length ? `Tracked warehouse locations: ${warehouseNames.join(', ')}.` : 'No warehouse locations are assigned yet.'
            };
        }

        if (targetItem && (lowerCmd.includes('qty') || lowerCmd.includes('quantity') || lowerCmd.includes('stock') || lowerCmd.includes('how much') || lowerCmd.includes('how many'))) {
            return { isQuery: true, answer: `${targetItem.name} currently has ${targetItem.quantity} ${targetItem.uom || 'units'} on hand.` };
        }

        if (targetItem && (lowerCmd.includes('where') || lowerCmd.includes('location') || lowerCmd.includes('warehouse'))) {
            return { isQuery: true, answer: `${targetItem.name} is currently assigned to ${targetItem.warehouse || 'an unassigned warehouse'}.` };
        }

        if (targetItem && (lowerCmd.includes('category') || lowerCmd.includes('type'))) {
            return { isQuery: true, answer: `${targetItem.name} belongs to the ${targetItem.category || 'Uncategorized'} category.` };
        }

        if (targetItem && (lowerCmd.includes('restocked') || lowerCmd.includes('replenishment status') || lowerCmd.includes('restock status'))) {
            const labels = { Yes: 'Restocked', I: 'In process', No: 'Needs replenishment' };
            return { isQuery: true, answer: `${targetItem.name} is currently marked as ${labels[targetItem.isRestocked] || 'Needs replenishment'}.` };
        }

        if (targetItem && (lowerCmd.includes('history') || lowerCmd.includes('last') || lowerCmd.includes('transaction') || lowerCmd.includes('log'))) {
            const itemLogs = unifiedLogs.filter((log) => String(log.itemCode) === String(targetItem.id) || String(log.itemCode) === String(targetItem.itemCode));
            if (!itemLogs.length) {
                return { isQuery: true, answer: `No transaction history was found for ${targetItem.name}.` };
            }
            const lastLog = itemLogs[0];
            const actionLabel = lastLog.type === 'input' ? 'arrival' : 'shipment';
            return {
                isQuery: true,
                answer: `The latest ${actionLabel} for ${targetItem.name} was ${lastLog.quantity} unit(s) on ${lastLog.date}, recorded by ${lastLog.user || lastLog.userName || 'System'}.`
            };
        }

        if (targetItem && (lowerCmd.includes('supplier') || lowerCmd.includes('buy from') || lowerCmd.includes('who provides'))) {
            const supplier = supplierById[String(targetItem.supplier)];
            return {
                isQuery: true,
                answer: supplier ? `${targetItem.name} is linked to supplier ${supplier.name}.` : `${targetItem.name} does not have a supplier linked in the current data.`
            };
        }

        if (targetItem && (lowerCmd.includes('customer') || lowerCmd.includes('sell to') || lowerCmd.includes('who receives'))) {
            const customer = customerById[String(targetItem.customer)];
            return {
                isQuery: true,
                answer: customer ? `${targetItem.name} is linked to customer ${customer.name}.` : `${targetItem.name} does not have a customer linked in the current data.`
            };
        }

        if (targetSupplier && (lowerCmd.includes('contact') || lowerCmd.includes('phone') || lowerCmd.includes('email') || lowerCmd.includes('details'))) {
            const details = [
                targetSupplier.contact ? `contact ${targetSupplier.contact}` : null,
                targetSupplier.phone ? `phone ${targetSupplier.phone}` : null,
                targetSupplier.email ? `email ${targetSupplier.email}` : null
            ].filter(Boolean);
            return {
                isQuery: true,
                answer: details.length ? `${targetSupplier.name}: ${details.join(', ')}.` : `${targetSupplier.name} exists in the supplier list, but no contact details are stored yet.`
            };
        }

        if (targetCustomer && (lowerCmd.includes('contact') || lowerCmd.includes('phone') || lowerCmd.includes('email') || lowerCmd.includes('details'))) {
            const details = [
                targetCustomer.contact ? `contact ${targetCustomer.contact}` : null,
                targetCustomer.phone ? `phone ${targetCustomer.phone}` : null,
                targetCustomer.email ? `email ${targetCustomer.email}` : null
            ].filter(Boolean);
            return {
                isQuery: true,
                answer: details.length ? `${targetCustomer.name}: ${details.join(', ')}.` : `${targetCustomer.name} exists in the customer list, but no contact details are stored yet.`
            };
        }

        if (targetSupplier) {
            const suppliedItems = inventoryData.filter((item) => String(item.supplier) === String(targetSupplier.id));
            return {
                isQuery: true,
                answer: `${targetSupplier.name} is linked to ${suppliedItems.length} catalog item(s).`,
                bullets: suppliedItems.slice(0, 5).map((item) => item.name)
            };
        }

        if (targetCustomer) {
            const customerItems = inventoryData.filter((item) => String(item.customer) === String(targetCustomer.id));
            return {
                isQuery: true,
                answer: `${targetCustomer.name} is linked to ${customerItems.length} catalog item(s).`,
                bullets: customerItems.slice(0, 5).map((item) => item.name)
            };
        }

        if (lowerCmd.includes('top mover') || lowerCmd.includes('most shipped') || lowerCmd.includes('most active')) {
            const movementMap = unifiedLogs.reduce((acc, log) => {
                const key = String(log.itemCode);
                acc[key] = (acc[key] || 0) + (parseFloat(log.quantity) || 0);
                return acc;
            }, {});
            const topEntry = Object.entries(movementMap).sort((a, b) => b[1] - a[1])[0];
            if (!topEntry) {
                return { isQuery: true, answer: 'There is not enough transaction data yet to identify top movers.' };
            }
            const topItem = inventoryData.find((item) => String(item.id) === topEntry[0] || String(item.itemCode) === topEntry[0]);
            return { isQuery: true, answer: `${topItem?.name || topEntry[0]} is the current top mover with ${topEntry[1]} units moved across logged transactions.` };
        }

        if (lowerCmd.includes('today') || lowerCmd.includes('yesterday') || lowerCmd.includes('movement') || lowerCmd.includes('shipped') || lowerCmd.includes('received')) {
            return summarizeMovement(lowerCmd, selectedDate);
        }

        if (lowerCmd.includes('summary') || lowerCmd.includes('inventory') || lowerCmd.includes('status') || lowerCmd.includes('report')) {
            const lowCount = analytics.lowItems.length;
            return {
                isQuery: true,
                answer: `Inventory summary: ${inventoryData.length} items tracked across ${warehouseNames.length} warehouse location(s), with ${lowCount} item(s) currently below threshold and ${analytics.predictiveItems.length} projected shortage risk(s).`
            };
        }

        return {
            error: 'I can help with stock status, restock priorities, warehouse health, supplier and customer details, dormant stock, automation issues, shipment history, and transaction logging.'
        };
    }, [analytics, customerById, findCustomerFromCommand, findItemFromCommand, findSupplierFromCommand, findWarehouseFromCommand, getThreshold, inventoryData, supplierById, summarizeMovement, unifiedLogs, warehouseNames]);

    const buildLogDraft = React.useCallback((lowerCmd, selectedDate) => {
        const doc = nlp(command);
        const qty = doc.values().toNumber().out('array')[0] || 0;
        const item = findItemFromCommand(lowerCmd);

        const undoSynonyms = [
            'undo', 'reverse', 'revert', 'cancel last', 'wrong info', 'wrong information',
            'mistake', 'error', 'wrong entry', 'nevermind', 'go back', 'delete that'
        ];

        if (undoSynonyms.some((phrase) => lowerCmd.includes(phrase))) {
            return { type: 'undo' };
        }

        if ((lowerCmd.includes('mark all') || lowerCmd.includes('set all')) && (lowerCmd.includes('restocking') || lowerCmd.includes('in process'))) {
            const candidateIds = analytics.lowItems.map((item) => item.id);
            if (!candidateIds.length) {
                return { error: 'There are no current low-stock items to mark as restocking.' };
            }
            return {
                type: 'bulk-mark-restocking',
                itemIds: candidateIds,
                humanReadable: `I can mark ${candidateIds.length} low-stock item(s) as "Restocking".`
            };
        }

        if ((lowerCmd.includes('mark') || lowerCmd.includes('set')) && item && (lowerCmd.includes('restocked') || lowerCmd.includes('in process') || lowerCmd.includes('needs restock') || lowerCmd.includes('to restock'))) {
            let nextStatus = 'No';
            let humanLabel = 'Needs replenishment';
            if (lowerCmd.includes('restocked')) {
                nextStatus = 'Yes';
                humanLabel = 'Restocked';
            } else if (lowerCmd.includes('in process')) {
                nextStatus = 'I';
                humanLabel = 'In process';
            }

            return {
                type: 'edit-item',
                item,
                updatedItem: { ...item, isRestocked: nextStatus },
                humanReadable: `I can update ${item.name} to "${humanLabel}".`
            };
        }

        if (!item && qty > 0) {
            return { error: `I found a quantity of ${qty}, but I could not confidently identify the item. Try using the exact SKU or a clearer item name.` };
        }

        if (item && !qty) {
            return { error: `I found ${item.name}, but I still need a quantity to create the transaction.` };
        }

        if (!item || !qty) {
            return { error: "Try a command like 'Received 50 SKU-101 today', 'Shipped 12 Blue Paint yesterday', or 'Mark all low stock as restocking'." };
        }

        const arrivalKeywords = [
            'received', 'got', 'inbound', 'arrival', 'delivery', 'delivered', 'added', 'refilled',
            'restock', 'replenish', 'purchased', 'bought', 'procured', 'input', 'incoming', 'increase'
        ];
        const shipmentKeywords = [
            'shipped', 'out', 'outbound', 'dispatched', 'sent', 'removed', 'sale', 'sold', 'shipment',
            'released', 'deducted', 'output', 'consumed', 'used', 'outgoing', 'decrease'
        ];

        const isArrival = arrivalKeywords.some((keyword) => lowerCmd.includes(keyword)) && !shipmentKeywords.some((keyword) => lowerCmd.includes(keyword));

        return {
            type: isArrival ? 'add-input-log' : 'add-output-log',
            item,
            quantity: qty,
            isArrival,
            date: selectedDate,
            humanReadable: `I identified ${isArrival ? 'an arrival' : 'a shipment'} of ${qty} ${item.uom || 'units'} for ${item.name} on ${selectedDate}.`
        };
    }, [analytics.lowItems, command, findItemFromCommand]);

    const processCommand = React.useCallback(() => {
        if (!command.trim()) return;
        setIsThinking(true);

        const lowerCmd = command.toLowerCase().trim();
        const selectedDate = resolveDate(lowerCmd);
        const isQuery = ['what', 'how', 'list', 'show', 'check', 'status', 'summary', 'report', 'where', 'who', 'which', 'why'].some((term) => lowerCmd.includes(term));

        setTimeout(async () => {
            if (isQuery) {
                setParsedResult(answerQuery(lowerCmd, selectedDate));
                setIsThinking(false);
                return;
            }

            const actionResult = buildLogDraft(lowerCmd, selectedDate);
            if (actionResult.type === 'undo') {
                const result = await window.performUndo();
                setParsedResult({ isQuery: true, answer: result || 'Last transaction reversed successfully.' });
                setIsThinking(false);
                return;
            }

            setParsedResult(actionResult);
            setIsThinking(false);
        }, 300);
    }, [answerQuery, buildLogDraft, command, resolveDate]);

    const confirmAction = React.useCallback(() => {
        if (!parsedResult || parsedResult.error || parsedResult.isQuery) return;

        if (parsedResult.type === 'edit-item') {
            onPerformAction('edit-item', parsedResult.updatedItem);
            window.Toast?.success?.('InnoAssistant', `Updated ${parsedResult.updatedItem.name}.`);
            setParsedResult(null);
            setCommand('');
            return;
        }

        if (parsedResult.type === 'bulk-mark-restocking') {
            onPerformAction('bulk-mark-restocking', parsedResult.itemIds);
            window.Toast?.success?.('InnoAssistant', `Marked ${parsedResult.itemIds.length} item(s) as Restocking.`);
            setParsedResult(null);
            setCommand('');
            return;
        }

        const commitData = {
            id: (parsedResult.isArrival ? 'IN-' : 'OUT-') + Math.floor(Math.random() * 1000000),
            itemCode: parsedResult.item.id,
            itemName: parsedResult.item.name,
            quantity: parsedResult.quantity,
            date: parsedResult.date,
            transactionId: (parsedResult.isArrival ? 'IN-' : 'OUT-') + Date.now(),
            uom: parsedResult.item.uom || 'units',
            supplier: parsedResult.isArrival ? (supplierById[String(parsedResult.item.supplier)]?.name || 'Internal') : 'Direct Fulfillment'
        };

        onPerformAction(parsedResult.type, commitData);
        window.Toast?.success?.('InnoAssistant', parsedResult.humanReadable);
        setParsedResult(null);
        setCommand('');
    }, [onPerformAction, parsedResult, supplierById]);

    const isActionRestricted = parsedResult?.type === 'edit-item'
        ? hasRes('EditItems')
        : parsedResult?.type === 'bulk-mark-restocking'
            ? hasRes('EditItems')
            : hasRes('AddLogs');

    return {
        command,
        setCommand,
        isThinking,
        parsedResult,
        setParsedResult,
        processCommand,
        confirmAction,
        isActionRestricted
    };
};
window.useInnoAssistantEngine = useInnoAssistantEngine;
