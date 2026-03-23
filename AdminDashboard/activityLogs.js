/**
 * Admin Dashboard - Activity Logs Tab
 */
const ActivityLogsTab = ({ activityLogs }) => {
    const [filterCategory, setFilterCategory] = React.useState('All Categories');

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

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
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
