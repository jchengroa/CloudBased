/**
 * InnoAssistant: Cognitive Command Center
 * Redesigned for elegance and high-end visual feedback.
 */

const InnoAssistant = ({ inventoryData, outputLogs, inputLogs, supplierData, onPerformAction, user }) => {
    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(action);
    };
    const [command, setCommand] = React.useState('');
    const [isThinking, setIsThinking] = React.useState(false);
    const [parsedResult, setParsedResult] = React.useState(null);

    const handleCommandInput = (e) => {
        setCommand(e.target.value);
        if (parsedResult) setParsedResult(null);
    };

    const processCognitiveCommand = () => {
        if (!command.trim()) return;
        setIsThinking(true);

        // --- NLP PROCESSING ---
        const doc = nlp(command);
        const lowerCmd = command.toLowerCase();

        // 1. Better Query detection
        const isQuery = lowerCmd.includes('what') || lowerCmd.includes('how') || lowerCmd.includes('list') ||
            lowerCmd.includes('query') || lowerCmd.includes('status') || lowerCmd.includes('check');

        // 2. Date Detection
        let selectedDate = new Date().toISOString().split('T')[0];
        if (lowerCmd.includes('yesterday')) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            selectedDate = d.toISOString().split('T')[0];
        }

        setTimeout(() => {
            if (isQuery) {
                // Pre-identify common targets: Item, Supplier
                const rawWords = lowerCmd.split(' ');
                const targetItem = inventoryData.find(i => 
                    lowerCmd.includes(i.id.toLowerCase()) || 
                    i.name.toLowerCase().split(' ').some(word => word.length > 3 && lowerCmd.includes(word))
                );
                const targetSup = supplierData.find(s => 
                    lowerCmd.includes(s.name.toLowerCase()) || 
                    s.name.toLowerCase().split(' ').some(word => word.length > 3 && lowerCmd.includes(word))
                );

                // 1. Handling Restock Queries
                if (lowerCmd.includes('restock') || lowerCmd.includes('low') || lowerCmd.includes('short') || lowerCmd.includes('reorder') || lowerCmd.includes('supplies') || lowerCmd.includes('needed') || lowerCmd.includes('must-buy') || lowerCmd.includes('out-of-stock') || lowerCmd.includes('critical')) {
                    const lowItems = inventoryData.filter(i => (parseFloat(i.quantity) || 0) < 50 && (i.isRestocked !== 'Yes' && i.isRestocked !== 'I')).slice(0, 3);
                    if (lowItems.length > 0) {
                        setParsedResult({
                            isQuery: true,
                            answer: `I've analyzed the stock levels. You should prioritize restocking: ${lowItems.map(i => i.name).join(', ')}. These are currently below critical safety thresholds.`
                        });
                    } else {
                        setParsedResult({
                            isQuery: true,
                            answer: "Everything looks great. All inventory levels are currently within safe operating parameters."
                        });
                    }
                } 
                // 2. Handling Specific Item Queries (Quantity, Warehouse, Category)
                else if (targetItem && (lowerCmd.includes('qty') || lowerCmd.includes('quantity') || lowerCmd.includes('stock') || lowerCmd.includes('much') || lowerCmd.includes('many'))) {
                    setParsedResult({ isQuery: true, answer: `The current stock level for "${targetItem.name}" is ${targetItem.quantity} ${targetItem.uom || 'units'}.` });
                }
                else if (targetItem && (lowerCmd.includes('where') || lowerCmd.includes('location') || lowerCmd.includes('warehouse'))) {
                    setParsedResult({ isQuery: true, answer: `"${targetItem.name}" is stored in the ${targetItem.warehouse || 'Main Warehouse'}.` });
                }
                else if (targetItem && (lowerCmd.includes('category') || lowerCmd.includes('type'))) {
                    setParsedResult({ isQuery: true, answer: `"${targetItem.name}" is categorized under ${targetItem.category || 'General Inventory'}.` });
                }
                // 3. Handling Log/History Queries
                else if (targetItem && (lowerCmd.includes('log') || lowerCmd.includes('history') || lowerCmd.includes('last') || lowerCmd.includes('transaction'))) {
                    const itemLogs = [...inputLogs, ...outputLogs]
                        .filter(l => l.itemCode === targetItem.id)
                        .sort((a,b) => new Date(b.date) - new Date(a.date));
                    if (itemLogs.length > 0) {
                        const last = itemLogs[0];
                        setParsedResult({ isQuery: true, answer: `The last transaction for "${targetItem.name}" was on ${last.date}. ${last.userName || 'A user'} processed ${last.quantity} ${last.uom || 'units'}.` });
                    } else {
                        setParsedResult({ isQuery: true, answer: `No transaction history found for "${targetItem.name}".` });
                    }
                }
                // 4. Handling Supplier Queries
                else if (targetItem && (lowerCmd.includes('supplier') || lowerCmd.includes('who provides') || lowerCmd.includes('buy from'))) {
                    setParsedResult({ isQuery: true, answer: `"${targetItem.name}" is supplied by ${targetItem.supplier || 'Internal Production/Manual Management'}.` });
                }
                else if (targetSup) {
                    const supItems = inventoryData.filter(i => i.supplier === targetSup.name);
                    setParsedResult({ isQuery: true, answer: `${targetSup.name} is a known supplier. They provide ${supItems.length} items in your catalog, including ${supItems.slice(0,3).map(i => i.name).join(', ')}.` });
                }
                // 5. General Inventory Summary
                else if (lowerCmd.includes('inventory') || lowerCmd.includes('summary') || lowerCmd.includes('status') || lowerCmd.includes('how many') || lowerCmd.includes('count') || lowerCmd.includes('report')) {
                    setParsedResult({
                        isQuery: true,
                        answer: `You currently have ${inventoryData.length} unique items across all warehouses. Total stock value and distribution are visible in the cards below.`
                    });
                } else {
                    setParsedResult({ error: "I can help with restock checks, item status (quantity/location), transaction history, or supplier info. Try: 'Where is Blue Paint?' or 'Last log for SKU-101'" });
                }
            } else {
                // Handling Logging Commands
                const qty = doc.values().toNumber().out('array')[0] || 0;

                // 3. Multi-Strategy Item Matching (ID, Partial Name, Keywords)
                // Use doc.nouns() and also raw words from the command
                const rawWords = lowerCmd.split(' ');

                const match = inventoryData.find(i => {
                    const idMatch = i.id.toLowerCase() === lowerCmd.match(new RegExp(i.id.toLowerCase(), 'i'))?.[0];
                    const nameMatch = i.name.toLowerCase().split(' ').some(word => word.length > 2 && lowerCmd.includes(word));
                    const exactIdInString = rawWords.includes(i.id.toLowerCase());
                    return idMatch || nameMatch || exactIdInString;
                });

                if (match && qty > 0) {
                    // 4. Massive Expansion of Synonyms for Arrivals vs Shipments
                    const arrivalKeywords = [
                        'received', 'got', 'inbound', 'arrival', 'delivery', 'delivered', 'added', 'fill', 'refilled',
                        'restock', 'replenish', 'replenished', 'in', 'stashed', 'purchased', 'bought', 'procured',
                        'new', 'entry', 'input', 'supply', 'supplies', 'incoming', 'stocking', 'increase'
                    ];
                    const shipmentKeywords = [
                        'shipped', 'out', 'outbound', 'dispatched', 'sent', 'removed', 'sale', 'sold', 'shipment',
                        'dispatched', 'released', 'discharged', 'deducted', 'output', 'consumed', 'used', 'outgoing',
                        'reduction', 'decreased', 'delivered-to-customer'
                    ];

                    const isArrival = arrivalKeywords.some(kw => lowerCmd.includes(kw)) && !shipmentKeywords.some(kw => lowerCmd.includes(kw));

                    setParsedResult({
                        type: isArrival ? 'add-input-log' : 'add-output-log',
                        item: match,
                        quantity: qty,
                        isArrival,
                        date: selectedDate,
                        humanReadable: `I've identified ${isArrival ? 'an arrival' : 'a shipment'} of ${qty} ${match.uom || 'units'} for "${match.name}" ${lowerCmd.includes('yesterday') ? 'from yesterday' : 'for today'}.`
                    });
                } else if (!match && qty > 0) {
                    setParsedResult({ error: `I see you're trying to log ${qty} units, but I couldn't identify the item. Try using an exact SKU or a clearer name like: "Log ${qty} Blue Paint"` });
                } else if (match && !qty) {
                    setParsedResult({ error: `I've found "${match.name}", but I need a quantity to log the transaction. Try: "Received 50 ${match.name}"` });
                } else {
                    setParsedResult({ error: "I couldn't identify the item or quantity. To log data, try something like: 'Received 50 Paint' or 'Shipped 10 PNT01 for today'" });
                }
            }

            setIsThinking(false);
        }, 800);
    };

    const confirmAction = () => {
        if (!parsedResult || parsedResult.error || parsedResult.isQuery) return;

        onPerformAction(parsedResult.type, {
            itemCode: parsedResult.item.id,
            quantity: parsedResult.quantity,
            date: parsedResult.date || new Date().toISOString().split('T')[0],
            transactionId: (parsedResult.isArrival ? 'IN-' : 'OUT-') + Math.floor(Math.random() * 1000000),
            uom: parsedResult.item.uom || 'units',
            supplier: parsedResult.isArrival ? (supplierData[0]?.name || 'Internal') : 'Direct Fulfillment'
        });
        setParsedResult(null);
        setCommand('');
    };

    return (
        <div style={{ width: '100%', padding: '0 0 2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Top Section: Title (Centered) and Disclaimer (Right) */}
            <div style={{
                width: '100%',
                maxWidth: '900px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingTop: '1rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                        <span style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            letterSpacing: '0.05em'
                        }}>AI</span>
                        InnoAssistant
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.7, lineHeight: 1.4 }}>
                        Neural Command Processing <br />
                        via <strong>TensorFlow.js</strong> & <strong>Compromise.js</strong>
                    </div>
                </div>

                {/* The Disclaimer: Positioned to the right of the title on larger screens */}
                <div className="innoassistant-disclaimer-box" style={{
                    position: 'absolute',
                    right: '-40px',
                    top: '0',
                    transform: 'translateX(100%)',
                    width: '320px',
                    background: 'rgba(99, 102, 241, 0.05)',
                    padding: '1rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <window.AlertTriangleIcon size={14} color="#6366f1" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.05em' }}>Big Disclaimer</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', margin: '0 0 0.6rem 0', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        This is NOT a Generative AI chatbot. It processes words via local patterns and doesn't understand complex sentences and generate human like responses.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 0.6rem' }}>
                        {[
                            'Inventory Status & Location',
                            'Transaction History Checks',
                            'Supplier Information',
                            'Neural SKU Search'
                        ].map(skill => (
                            <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6366f1' }}></div>
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: '700px', position: 'relative' }}>
                <div style={{
                    position: 'relative',
                    background: 'var(--card-bg)',
                    borderRadius: '20px',
                    padding: '2px',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 10px 40px rgba(99, 102, 241, 0.15), 0 0 20px rgba(139, 92, 246, 0.1)'
                }}>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Type a command or ask a question..."
                        value={command}
                        onChange={handleCommandInput}
                        onKeyDown={e => e.key === 'Enter' && processCognitiveCommand()}
                        style={{
                            width: '100%',
                            height: '60px',
                            border: 'none',
                            borderRadius: '18px',
                            padding: '0 4rem 0 1.5rem',
                            fontSize: '1.05rem',
                            fontWeight: '500',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                    />
                    <button
                        onClick={processCognitiveCommand}
                        disabled={isThinking || !command}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            bottom: '10px',
                            background: 'var(--accent-color)',
                            border: 'none',
                            borderRadius: '12px',
                            width: '45px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {isThinking ? <div className="spinner-mini"></div> : <window.TrendingUpIcon size={20} />}
                    </button>
                </div>

                {/* ANIMATED RESPONSE AREA */}
                {parsedResult && (
                    <div className="fade-in" style={{
                        marginTop: '1rem',
                        background: 'rgba(99, 102, 241, 0.03)',
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        animation: 'innoAssistantSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    }}>
                        {parsedResult.error ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
                                <window.AlertTriangleIcon size={18} />
                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{parsedResult.error}</span>
                            </div>
                        ) : parsedResult.isQuery ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                    <window.ActivityIcon size={20} />
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600', lineHeight: 1.5 }}>
                                    {parsedResult.answer}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '10px', background: parsedResult.isArrival ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 102, 102, 0.1)', color: parsedResult.isArrival ? '#10b981' : '#ef4444' }}>
                                        <window.BoxIcon size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Neural Identification</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700', lineHeight: 1.4 }}>
                                            {parsedResult.humanReadable}
                                        </div>
                                    </div>
                                </div>
                                {!hasRes('AddLogs') ? (
                                    <button className="auth-btn-primary" onClick={confirmAction} style={{ width: 'auto', padding: '0.5rem 1.5rem', fontWeight: '700', fontSize: '0.85rem' }}>
                                        Execute Commit
                                    </button>
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700', fontStyle: 'italic', background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                        Action Restricted: Log Clearance Required
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes innoAssistantSlideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .spinner-mini {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

window.InnoAssistant = InnoAssistant;
