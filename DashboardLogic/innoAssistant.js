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
        const isQuery = lowerCmd.includes('what') || lowerCmd.includes('how') || lowerCmd.includes('list') || lowerCmd.includes('query');

        setTimeout(() => {
            if (isQuery) {
                // Handling Restock Queries
                if (lowerCmd.includes('restock') || lowerCmd.includes('low') || lowerCmd.includes('short')) {
                    const lowItems = inventoryData.filter(i => (parseFloat(i.quantity) || 0) < 50 && (i.isRestocked !== 'Yes' && i.isRestocked !== 'I')).slice(0, 3);
                    if (lowItems.length > 0) {
                        setParsedResult({
                            isQuery: true,
                            answer: `Based on current neural analysis, you should prioritize restocking: ${lowItems.map(i => i.name).join(', ')}. These are currently below safety thresholds.`
                        });
                    } else {
                        setParsedResult({
                            isQuery: true,
                            answer: "Neural check complete. All inventory levels are currently within safe operating parameters."
                        });
                    }
                } else {
                    setParsedResult({ error: "I can currently only answer queries about 'restocking' or 'low stock' status." });
                }
            } else {
                // Handling Logging Commands
                const qty = doc.values().toNumber().out('array')[0] || 0;
                const potentialItems = doc.nouns().out('array');
                const match = inventoryData.find(i =>
                    potentialItems.some(word => i.name.toLowerCase().includes(word.toLowerCase()))
                );

                if (match && qty > 0) {
                    const isArrival = lowerCmd.includes('received') || lowerCmd.includes('got') || lowerCmd.includes('in');
                    setParsedResult({
                        type: isArrival ? 'add-input-log' : 'add-output-log',
                        item: match,
                        quantity: qty,
                        isArrival
                    });
                } else {
                    setParsedResult({ error: "Context could not be decoded. Ensure Item Name and Quantity are clear for logging." });
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
            date: new Date().toISOString().split('T')[0],
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
                        This is NOT a Generative AI chatbot. It processes commands via local patterns and doesn't generate human like responses.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 0.6rem' }}>
                        {[
                            'Log Stock Arrivals',
                            'Log Stock Shipments',
                            'Query Low Stock',
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
                        placeholder="e.g. Received 50 Paint OR 'What do I need to restock?'"
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
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Neural Analysis Active</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                                            {parsedResult.isArrival ? 'Add to stock' : 'Remove from stock'} {parsedResult.quantity} units of {parsedResult.item.name}
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
