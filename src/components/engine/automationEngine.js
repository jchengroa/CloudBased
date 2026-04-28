/**
 * Automation Engine
 * Derives smart, actionable business process suggestions from live data.
 * Fully decoupled from the UI - returns structured data only.
 */
(function () {
    const { useMemo } = React;

    const classifyItemRole = (item) => {
        const category = (item.category || '').toLowerCase();
        return {
            isProduct: category.includes('product'),
            isRawMaterial: !category.includes('product')
        };
    };

    const useAutomationEngine = (inventoryData = [], supplierData = [], customerData = [], outputLogs = [], settings = {}, inputLogs = []) => {
        return useMemo(() => {
            const lowStockThreshold = parseFloat(settings?.lowStockThreshold || 0);
            const isThresholdEnabled = !!settings?.isThresholdEnabled;
            const now = Date.now();
            const thirtyDaysAgoTime = now - (30 * 86400000);
            const sevenDaysAgoTime = now - (7 * 86400000);
            const fortyFiveDaysAgoTime = now - (45 * 86400000);

            const getThreshold = (item) => {
                if (isThresholdEnabled && lowStockThreshold) return lowStockThreshold;
                return parseFloat(item.optimalStock) || 0;
            };

            // We treat 'No' (Needs Stock) and legacy 'To Restock'/'Reorder' strings as actionable.
            const isManuallyToRestock = (item) => {
                const tag = String(item.isRestocked || 'No');
                return tag === 'No' || tag === 'To Restock' || tag === 'Reorder';
            };

            const inventoryById = {};
            const supplierById = supplierData.reduce((acc, supplier) => {
                acc[String(supplier.id)] = supplier;
                return acc;
            }, {});
            const customerById = customerData.reduce((acc, customer) => {
                acc[String(customer.id)] = customer;
                return acc;
            }, {});

            const outputStatsByItemId = {};
            const inputStatsByItemId = {};
            const recentShippedCustomerIds = new Set();
            const recentMovementByItemId = {};

            inventoryData.forEach((item) => {
                inventoryById[String(item.id)] = item;
            });

            const registerMovement = (itemId, logTime) => {
                const previous = recentMovementByItemId[itemId];
                if (!previous || logTime > previous) recentMovementByItemId[itemId] = logTime;
            };

            outputLogs.forEach((log) => {
                if (!log?.date) return;

                const logTime = new Date(log.date).getTime();
                if (Number.isNaN(logTime)) return;

                const itemId = String(log.itemCode);
                const qty = parseFloat(log.quantity) || 0;
                registerMovement(itemId, logTime);

                if (!outputStatsByItemId[itemId]) {
                    outputStatsByItemId[itemId] = { total30d: 0, lastDate: null };
                }

                if (logTime >= thirtyDaysAgoTime) {
                    outputStatsByItemId[itemId].total30d += qty;
                    const linkedItem = inventoryById[itemId];
                    if (linkedItem?.customer) recentShippedCustomerIds.add(String(linkedItem.customer));
                }

                if (!outputStatsByItemId[itemId].lastDate || logTime > outputStatsByItemId[itemId].lastDate) {
                    outputStatsByItemId[itemId].lastDate = logTime;
                }
            });

            inputLogs.forEach((log) => {
                if (!log?.date) return;

                const logTime = new Date(log.date).getTime();
                if (Number.isNaN(logTime)) return;

                const itemId = String(log.itemCode);
                const qty = parseFloat(log.quantity) || 0;
                registerMovement(itemId, logTime);

                if (!inputStatsByItemId[itemId]) {
                    inputStatsByItemId[itemId] = { total30d: 0, lastDate: null };
                }

                if (logTime >= thirtyDaysAgoTime) {
                    inputStatsByItemId[itemId].total30d += qty;
                }

                if (!inputStatsByItemId[itemId].lastDate || logTime > inputStatsByItemId[itemId].lastDate) {
                    inputStatsByItemId[itemId].lastDate = logTime;
                }
            });

            const criticalItems = [];
            const predictiveItems = [];
            const staleRestocks = [];
            const dataIssues = [];
            const dormantStock = [];

            inventoryData.forEach((item) => {
                const itemId = String(item.id);
                const stock = parseFloat(item.quantity) || 0;
                const threshold = getThreshold(item);
                const { isProduct, isRawMaterial } = classifyItemRole(item);
                const outputStats = outputStatsByItemId[itemId] || { total30d: 0, lastDate: null };
                const inputStats = inputStatsByItemId[itemId] || { total30d: 0, lastDate: null };
                const dailyBurn = outputStats.total30d / 30;
                const daysRemaining = dailyBurn > 0 ? Math.floor(stock / dailyBurn) : Infinity;
                const shortageReasons = [];

                if (isManuallyToRestock(item)) {
                    if (stock < threshold) {
                        shortageReasons.push({
                            code: 'below-threshold',
                            label: stock <= 0 ? 'Out of stock' : 'Below threshold',
                            detail: `${stock} on hand vs ${threshold} target`
                        });
                    }

                    if (dailyBurn > 0 && daysRemaining <= 7) {
                        shortageReasons.push({
                            code: 'predictive-shortage',
                            label: daysRemaining <= 0 ? 'Expected stock-out today' : `Predicted stock-out in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
                            detail: `${dailyBurn.toFixed(2)} units/day burn rate`
                        });
                    }

                    if (shortageReasons.length > 0) {
                        criticalItems.push({
                            ...item,
                            threshold,
                            stock,
                            dailyBurn,
                            daysRemaining,
                            shortfall: Math.max(0, threshold - stock),
                            supplierRecord: supplierById[String(item.supplier)] || null,
                            reasons: shortageReasons,
                            severity: stock <= 0 || daysRemaining <= 3 ? 'critical' : 'high'
                        });
                    } else if (dailyBurn > 0 && daysRemaining <= 14) {
                        predictiveItems.push({
                            ...item,
                            threshold,
                            stock,
                            dailyBurn,
                            daysRemaining,
                            supplierRecord: supplierById[String(item.supplier)] || null,
                            severity: 'medium'
                        });
                    }
                }

                if (item.isRestocked === 'I') {
                    const lastReceiptTime = inputStats.lastDate;
                    const daysSinceReceipt = lastReceiptTime ? Math.floor((now - lastReceiptTime) / 86400000) : null;
                    if (!lastReceiptTime || lastReceiptTime < sevenDaysAgoTime) {
                        staleRestocks.push({
                            ...item,
                            lastReceiptDate: lastReceiptTime ? new Date(lastReceiptTime) : null,
                            daysSinceReceipt,
                            supplierRecord: supplierById[String(item.supplier)] || null
                        });
                    }
                }

                const issues = [];
                if (!item.warehouse) {
                    issues.push('Missing warehouse assignment');
                }
                if (isRawMaterial && !item.supplier) {
                    issues.push('Missing supplier link');
                }
                if (isProduct && !item.customer) {
                    issues.push('Missing customer link');
                }
                if (issues.length > 0) {
                    dataIssues.push({
                        ...item,
                        issues
                    });
                }

                const lastMovement = recentMovementByItemId[itemId];
                if (stock > 0 && (!lastMovement || lastMovement < fortyFiveDaysAgoTime)) {
                    dormantStock.push({
                        ...item,
                        lastMovementDate: lastMovement ? new Date(lastMovement) : null,
                        idleDays: lastMovement ? Math.floor((now - lastMovement) / 86400000) : null
                    });
                }
            });

            criticalItems.sort((a, b) => {
                if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
                return (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity);
            });
            predictiveItems.sort((a, b) => a.daysRemaining - b.daysRemaining);
            staleRestocks.sort((a, b) => (b.daysSinceReceipt || Infinity) - (a.daysSinceReceipt || Infinity));
            dataIssues.sort((a, b) => b.issues.length - a.issues.length);
            dormantStock.sort((a, b) => (b.idleDays || Infinity) - (a.idleDays || Infinity));

            const criticalItemsBySupplier = criticalItems.reduce((acc, item) => {
                const supplierId = String(item.supplier || '');
                if (!supplierId) return acc;
                if (!acc[supplierId]) acc[supplierId] = [];
                acc[supplierId].push(item);
                return acc;
            }, {});

            const supplierGroups = supplierData.reduce((acc, supplier) => {
                const items = criticalItemsBySupplier[String(supplier.id)] || [];
                if (items.length > 0) {
                    acc.push({
                        supplier,
                        items,
                        totalShortfall: items.reduce((sum, item) => sum + (item.shortfall || 0), 0)
                    });
                }
                return acc;
            }, []);

            const unlinkedCritical = criticalItems.filter((item) => !item.supplierRecord);

            const dispatchQueue = customerData.reduce((acc, customer) => {
                const linkedProducts = inventoryData.filter((item) => String(item.customer) === String(customer.id) && (parseFloat(item.quantity) || 0) > 0);
                if (linkedProducts.length === 0) return acc;

                if (!recentShippedCustomerIds.has(String(customer.id))) {
                    const totalOnHand = linkedProducts.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
                    acc.push({
                        customer,
                        products: linkedProducts,
                        totalOnHand
                    });
                }
                return acc;
            }, []);

            const urgentActions = [];

            criticalItems.forEach((item) => {
                const primaryReason = item.reasons[0];
                const hasSupplier = Boolean(item.supplierRecord);
                urgentActions.push({
                    id: `critical-${item.id}`,
                    priority: item.severity === 'critical' ? 0 : 1,
                    title: `${item.name} needs replenishment`,
                    description: `${primaryReason.label}. ${primaryReason.detail}.`,
                    badge: item.severity === 'critical' ? 'Urgent' : 'High',
                    color: item.severity === 'critical' ? '#ef4444' : '#f59e0b',
                    action: hasSupplier
                        ? { kind: 'supplier-details', supplierName: item.supplierRecord.name, itemIds: [item.id], buttonLabel: 'Contact Supplier' }
                        : { kind: 'edit-item', itemId: item.id, buttonLabel: 'Fix Item Setup' }
                });
            });

            staleRestocks.forEach((item) => {
                urgentActions.push({
                    id: `stale-${item.id}`,
                    priority: 1,
                    title: `${item.name} restock needs follow-up`,
                    description: item.daysSinceReceipt
                        ? `Marked as restocking with no receipt for ${item.daysSinceReceipt} days.`
                        : 'Marked as restocking without any recorded receipt history.',
                    badge: 'Follow-up',
                    color: '#ef4444',
                    action: { kind: 'edit-item', itemId: item.id, buttonLabel: 'Review Item' }
                });
            });

            dataIssues.forEach((item) => {
                urgentActions.push({
                    id: `data-${item.id}`,
                    priority: 2,
                    title: `${item.name} has setup gaps`,
                    description: item.issues.join(', '),
                    badge: 'Setup',
                    color: '#f59e0b',
                    action: { kind: 'edit-item', itemId: item.id, buttonLabel: 'Complete Setup' }
                });
            });

            dispatchQueue.forEach((entry) => {
                urgentActions.push({
                    id: `dispatch-${entry.customer.id}`,
                    priority: 2,
                    title: `${entry.customer.name} has ready-to-ship stock`,
                    description: `${entry.products.length} product${entry.products.length !== 1 ? 's' : ''} are on hand with no shipment in the last 30 days.`,
                    badge: 'Dispatch',
                    color: '#6366f1',
                    action: { kind: 'customer-details', customerName: entry.customer.name, buttonLabel: 'Open Customer' }
                });
            });

            predictiveItems.forEach((item) => {
                urgentActions.push({
                    id: `predictive-${item.id}`,
                    priority: 3,
                    title: `${item.name} is trending toward shortage`,
                    description: `Projected stock-out in ${item.daysRemaining} day${item.daysRemaining !== 1 ? 's' : ''} at ${item.dailyBurn.toFixed(2)} units/day.`,
                    badge: 'Forecast',
                    color: '#8b5cf6',
                    action: item.supplierRecord
                        ? { kind: 'supplier-details', supplierName: item.supplierRecord.name, itemIds: [item.id], buttonLabel: 'Plan Reorder' }
                        : { kind: 'product-stats', itemId: item.id, buttonLabel: 'Inspect Item' }
                });
            });

            dormantStock.slice(0, 10).forEach((item) => {
                urgentActions.push({
                    id: `dormant-${item.id}`,
                    priority: 4,
                    title: `${item.name} is sitting idle`,
                    description: item.idleDays
                        ? `No movement recorded for ${item.idleDays} days while ${item.quantity} ${item.uom || 'units'} remain on hand.`
                        : `No movement history found while ${item.quantity} ${item.uom || 'units'} remain on hand.`,
                    badge: 'Dormant',
                    color: '#64748b',
                    action: { kind: 'product-stats', itemId: item.id, buttonLabel: 'Review Demand' }
                });
            });

            urgentActions.sort((a, b) => a.priority - b.priority);

            const totalActions = urgentActions.length;
            const urgentCount = urgentActions.filter((action) => action.priority <= 1).length;

            return {
                criticalItems,
                predictiveItems,
                supplierGroups,
                unlinkedCritical,
                staleRestocks,
                dispatchQueue,
                dataIssues,
                dormantStock,
                urgentActions,
                totalActions,
                urgentCount,
                summary: {
                    criticalItems: criticalItems.length,
                    predictiveItems: predictiveItems.length,
                    staleRestocks: staleRestocks.length,
                    dispatchCustomers: dispatchQueue.length,
                    dataIssues: dataIssues.length,
                    dormantStock: dormantStock.length
                }
            };
        }, [inventoryData, supplierData, customerData, outputLogs, inputLogs, settings]);
    };

    window.useAutomationEngine = useAutomationEngine;
})();
