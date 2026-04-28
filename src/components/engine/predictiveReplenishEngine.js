/**
 * Predictive Replenish Engine
 * Calculates inventory velocity and projects run-out dates.
 */
const usePredictiveReplenishEngine = (inventoryData, outputLogs) => {
    return React.useMemo(() => {
        if (!inventoryData || !Array.isArray(inventoryData)) return [];

        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 86400000);
        const recentOutputByItemId = (outputLogs || []).reduce((acc, log) => {
            if (!log?.date) return acc;

            const logTime = new Date(log.date).getTime();
            if (Number.isNaN(logTime) || logTime < thirtyDaysAgo) return acc;

            const itemId = String(log.itemCode);
            const qty = parseFloat(log.quantity);
            acc[itemId] = (acc[itemId] || 0) + (Number.isNaN(qty) ? 0 : qty);
            return acc;
        }, {});

        return inventoryData.map(item => {
            const totalOut = recentOutputByItemId[String(item.id)] || 0;
            const dailyBurn = totalOut / 30;
            const currentQty = parseFloat(item.quantity) || 0;
            const daysRemaining = dailyBurn > 0 ? Math.floor(currentQty / dailyBurn) : Infinity;

            return {
                ...item,
                dailyBurn: dailyBurn.toFixed(2),
                daysRemaining,
                predictedDate: (daysRemaining !== Infinity && daysRemaining < 1000)
                    ? new Date(now + daysRemaining * 86400000)
                    : null
            };
        })
            .filter(p =>
                p.daysRemaining <= 30 &&
                p.daysRemaining >= 0 &&
                (p.isRestocked !== 'Yes' && p.isRestocked !== 'I') &&
                p.dailyBurn > 0
            )
            .sort((a, b) => a.daysRemaining - b.daysRemaining);
    }, [inventoryData, outputLogs]);
};
window.usePredictiveReplenishEngine = usePredictiveReplenishEngine;
