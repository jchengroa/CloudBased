/**
 * Admin Dashboard - Overview Tab
 */
const OverviewTab = ({ users, activityLogs }) => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'Administrator').length;
    const logCount = activityLogs.length;

    return (
        <div className="admin-tab-content fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
                        <Icons.Users size={24} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>Total</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-color)' }}>{totalUsers}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '600' }}>Registered Users</div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--success)', marginBottom: '0.5rem' }}>
                        <Icons.Shield size={24} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>Admins</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>{adminCount}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '600' }}>Administrators</div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                        <Icons.Activity size={24} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>Activity</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--warning)' }}>{logCount}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: '600' }}>Activity Logs</div>
                </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                    <Icons.Activity size={20} color="var(--accent-color)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Recent Activity</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activityLogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No recent activity to show.</div>
                    ) : (
                        activityLogs.slice(0, 10).map((log, index) => (
                            <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--hover-bg)', padding: '0.75rem', borderRadius: '50%', color: 'var(--accent-color)' }}>
                                    {log.type === 'input' ? <Icons.ArrowDownCircle size={18} color="var(--success)" /> : 
                                     log.type === 'output' ? <Icons.ArrowUpCircle size={18} color="var(--danger)" /> :
                                     <Icons.Box size={18} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{log.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{log.details}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', opacity: 0.8 }}>
                                        {log.user} • {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
window.AdminOverviewTab = OverviewTab;
