/**
 * Admin Dashboard - Activity Logs Tab
 */
const ActivityLogsTab = ({ activityLogs, onClearLogs }) => {
    const [filterCategory, setFilterCategory] = React.useState('All Categories');
    const [isClearing, setIsClearing] = React.useState(false);

    const categories = ['All Categories', 'inventory', 'transaction', 'system', 'supplier', 'user'];

    const filteredLogs = filterCategory === 'All Categories' 
        ? activityLogs 
        : activityLogs.filter(log => log.category === filterCategory);

    const getBadgeColor = (category) => {
        switch(category) {
            case 'inventory': return { bg: 'rgba(168, 85, 247, 0.15)', text: 'rgb(147, 51, 234)' };
            case 'transaction': return { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(37, 99, 235)' };
            case 'system': return { bg: 'rgba(107, 114, 128, 0.15)', text: 'rgb(75, 85, 99)' };
            case 'supplier': return { bg: 'rgba(16, 185, 129, 0.15)', text: 'rgb(5, 150, 105)' };
            case 'user': return { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(217, 119, 6)' };
            default: return { bg: 'var(--hover-bg)', text: 'var(--text-secondary)' };
        }
    };

    const handleDownload = () => {
        const header = "Timestamp,User,Action,Details,Category\n";
        const content = filteredLogs.map(log => {
            const date = `"${new Date(log.timestamp).toLocaleString().replace(/"/g, '""')}"`;
            const user = `"${(log.user || '').replace(/"/g, '""')}"`;
            const action = `"${(log.title || '').replace(/"/g, '""')}"`;
            const details = `"${(log.details || '').replace(/"/g, '""')}"`;
            const category = `"${(log.category || 'misc').replace(/"/g, '""')}"`;
            return `${date},${user},${action},${details},${category}`;
        }).join('\n');
        
        const blob = new Blob([header + content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClear = async () => {
        if (!confirm("Are you sure you want to PERMANENTLY clear all dedicated activity logs? (Transactions history will remain)")) return;
        setIsClearing(true);
        try {
            await window.AppDataHandler.clearActivityLogs();
            if (onClearLogs) onClearLogs();
        } catch(e) {
            alert("Failed to clear logs: " + e.message);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Filter by:</span>
                    <select 
                        className="auth-input" 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{ width: '200px', margin: 0, padding: '0.5rem 1rem' }}
                    >
                        {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{filteredLogs.length} logs</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={handleDownload} 
                        className="tool-btn" 
                        style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <Icons.Download size={16} /> Download .csv
                    </button>
                    <button 
                        onClick={handleClear} 
                        disabled={isClearing}
                        style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        {isClearing ? 'Clearing...' : <><Icons.Trash size={16} /> Clear Logs</>}
                    </button>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th style={{ textAlign: 'center' }}>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No activity found.</td></tr>
                        ) : filteredLogs.map((log, i) => {
                            const badge = getBadgeColor(log.category);
                            return (
                                <tr key={i}>
                                    <td style={{ fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ fontWeight: '600' }}>{log.user}</td>
                                    <td style={{ fontWeight: '600' }}>{log.title}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.6rem', 
                                            borderRadius: '12px', 
                                            background: badge.bg, 
                                            color: badge.text, 
                                            fontSize: '0.7rem', 
                                            fontWeight: '800' 
                                        }}>
                                            {log.category || 'misc'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
window.AdminActivityLogsTab = ActivityLogsTab;
window.AdminActivityLogsTab = ActivityLogsTab;
