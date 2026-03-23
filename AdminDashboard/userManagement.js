/**
 * Admin Dashboard - User Management Tab
 */
const UserManagementTab = ({ users, onUpdateUser, currentUser }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [editingUser, setEditingUser] = React.useState(null);
    const [editRole, setEditRole] = React.useState('');
    const [editPerms, setEditPerms] = React.useState([]);
    const [isSaving, setIsSaving] = React.useState(false);

    const filteredUsers = users.filter(u => 
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditRole(user.role || 'Auditor');
        setEditPerms(user.permissions || []);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await window.AppDataHandler.updateUserAccess(editingUser.id, editRole, editRole === 'Auditor' ? editPerms : ['Full Access']);
            onUpdateUser();
            setEditingUser(null);
        } catch(e) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePerm = (perm) => {
        const currentPerms = editPerms || [];
        if (currentPerms.includes(perm)) {
            setEditPerms(currentPerms.filter(p => p !== perm));
        } else {
            setEditPerms([...currentPerms, perm]);
        }
    };

    const getRoleBadge = (role) => {
        let bg, color;
        if(role === 'Administrator') { bg = 'rgba(16, 185, 129, 0.15)'; color = 'rgb(4, 120, 87)'; }
        else if(role === 'Manager') { bg = 'rgba(59, 130, 246, 0.15)'; color = 'rgb(29, 78, 216)'; }
        else { bg = 'rgba(245, 158, 11, 0.15)'; color = 'rgb(180, 83, 9)'; }
        return <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: bg, color, fontSize: '0.75rem', fontWeight: '800' }}>{role}</span>;
    };

    const getPermBadge = (perm) => (
        <span key={perm} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--hover-bg)', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '600', marginRight: '4px' }}>
            {perm}
        </span>
    );

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Icons.Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                        className="search-bar auth-input" 
                        placeholder="Search users..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
                    />
                </div>
                <button className="auth-btn-primary" style={{ padding: '0.6rem 1.2rem', margin: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => alert("To add a user, register a new account on the login page or implement Admin registration.")}>
                    <Icons.Plus size={16} /> Add User
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Permissions</th>
                            <th>Created / Last Active</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No users found.</td></tr>
                        ) : filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                </td>
                                <td>{getRoleBadge(u.role || 'Auditor')}</td>
                                <td>{u.role === 'Administrator' || u.role === 'Manager' ? getPermBadge('Full Access') : (u.permissions?.length ? u.permissions.map(getPermBadge) : getPermBadge('None'))}</td>
                                <td><div style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</div></td>
                                <td style={{ textAlign: 'center' }}>
                                    <button 
                                        className="tool-btn" 
                                        onClick={() => handleEdit(u)}
                                        disabled={u.id === currentUser.uid} // Don't allow editing self here safely
                                        style={{ padding: '0.4rem', opacity: u.id === currentUser.uid ? 0.3 : 1 }}
                                        title={u.id === currentUser.uid ? "Cannot edit yourself" : "Edit User"}
                                    >
                                        <Icons.Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <div className="prompt-overlay" onClick={() => setEditingUser(null)}>
                    <div className="prompt-box" style={{ width: '500px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Adjust Permissions</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Configure system access for this member.</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} style={{ background: 'var(--hover-bg)', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                <Icons.Close size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '2rem', background: 'var(--hover-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={editingUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(editingUser.name)}&background=random&size=48`} style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>{editingUser.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>@{editingUser.username || editingUser.email.split('@')[0]}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Access Level</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                {['Administrator', 'Manager', 'Auditor'].map(role => (
                                    <button 
                                        key={role}
                                        onClick={() => {
                                            setEditRole(role);
                                            // Reset to empty array if switching to Auditor and perms is null
                                            if (role === 'Auditor' && !editPerms) setEditPerms([]);
                                        }}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: editRole === role ? 'var(--accent-color)' : 'var(--border-color)',
                                            background: editRole === role ? 'var(--selected-bg)' : 'transparent',
                                            color: editRole === role ? 'var(--accent-color)' : 'var(--text-secondary)',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {editRole === 'Auditor' && (
                            <div className="fade-in" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Granular Restrictions</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { id: 'Input', label: 'Input Inventory', desc: 'Allow adding items to stock' },
                                        { id: 'Output', label: 'Output Inventory', desc: 'Allow releasing items from stock' },
                                        { id: 'ManageItems', label: 'Manage Item List', desc: 'Allow creating and editing SKUs' }
                                    ].map(perm => (
                                                <div 
                                                    key={perm.id} 
                                                    onClick={() => togglePerm(perm.id)}
                                                    style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center', 
                                                        padding: '1rem', 
                                                        borderRadius: '14px', 
                                                        background: (editPerms || []).includes(perm.id) ? 'var(--selected-bg)' : 'var(--hover-bg)',
                                                        border: '1px solid',
                                                        borderColor: (editPerms || []).includes(perm.id) ? 'var(--accent-color)' : 'transparent',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: (editPerms || []).includes(perm.id) ? 'var(--accent-color)' : 'var(--text-primary)' }}>{perm.label}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{perm.desc}</div>
                                                    </div>
                                                    <div style={{ 
                                                        width: '20px', 
                                                        height: '20px', 
                                                        borderRadius: '6px', 
                                                        border: '2px solid', 
                                                        borderColor: (editPerms || []).includes(perm.id) ? 'var(--accent-color)' : 'var(--border-color)',
                                                        background: (editPerms || []).includes(perm.id) ? 'var(--accent-color)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}>
                                                        {(editPerms || []).includes(perm.id) && <window.CheckIcon size={14} strokeWidth={3} />}
                                                    </div>
                                                </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button className="tool-btn" onClick={() => setEditingUser(null)} style={{ flex: 1, height: '50px', justifyContent: 'center' }}>Cancel</button>
                            <button className="auth-btn-primary" onClick={handleSave} disabled={isSaving} style={{ flex: 2, height: '50px', margin: 0 }}>
                                {isSaving ? 'Synchronizing...' : 'Update Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
window.AdminUserManagementTab = UserManagementTab;
