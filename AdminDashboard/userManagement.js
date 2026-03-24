/**
 * Admin Dashboard - User Management Tab
 */
const UserManagementTab = ({ users, onUpdateUser, currentUser }) => {
    const { GenericModal, StatusBadge, FormInput, FormSelect, AlertCircleIcon } = window;
    
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isAddingUser, setIsAddingUser] = React.useState(false);
    const [addForm, setAddForm] = React.useState({ name: '', username: '', email: '', password: '', role: 'Auditor', restrictions: [] });

    const [editingUser, setEditingUser] = React.useState(null);
    const [editRole, setEditRole] = React.useState('');
    const [editRestrictions, setEditRestrictions] = React.useState([]);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditRole(user.role || 'Auditor');
        setEditRestrictions(user.restrictions || []);
    };

    const filteredUsers = React.useMemo(() => {
        const sq = searchQuery.toLowerCase();
        return users.filter(u => 
            u.name.toLowerCase().includes(sq) || 
            (u.username || '').toLowerCase().includes(sq) || 
            u.email.toLowerCase().includes(sq)
        );
    }, [users, searchQuery]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await window.AppDataHandler.updateUserAccess(editingUser.id, editRole, editRole === 'Auditor' ? editRestrictions : []);
            onUpdateUser();
            setEditingUser(null);
        } catch(e) { alert(e.message); }
        finally { setIsSaving(false); }
    };

    const handleRegister = async () => {
        if (!addForm.name || !addForm.username || !addForm.email || !addForm.password) {
            alert("Please fill in all identity fields.");
            return;
        }
        setIsSaving(true);
        try {
            await window.AppDataHandler.adminCreateUser(addForm);
            onUpdateUser();
            setIsAddingUser(false);
            setAddForm({ name: '', username: '', email: '', password: '', role: 'Auditor', restrictions: [] });
        } catch(e) { alert(e.message || "Failed to register user."); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you absolutely sure you want to remove ${editingUser.name}?`);
        if (!confirmed) return;
        setIsSaving(true);
        try {
            await window.AppDataHandler.deleteSharedUser(editingUser.id);
            onUpdateUser();
            setEditingUser(null);
        } catch(e) { alert(e.message); }
        finally { setIsSaving(false); }
    };

    const toggleRestriction = (id, forAdd = false) => {
        if (forAdd) {
            const current = addForm.restrictions || [];
            if (current.includes(id)) setAddForm({ ...addForm, restrictions: current.filter(p => p !== id) });
            else setAddForm({ ...addForm, restrictions: [...current, id] });
        } else {
            const current = editRestrictions || [];
            if (current.includes(id)) setEditRestrictions(current.filter(p => p !== id));
            else setEditRestrictions([...current, id]);
        }
    };

    const RESTRICTION_LIST = [
        { id: 'AddItems',       label: 'Add Items' },
        { id: 'EditItems',      label: 'Edit Items' },
        { id: 'RemoveItems',    label: 'Remove Items' },
        { id: 'AddLogs',        label: 'Add Logs' },
        { id: 'EditLogs',       label: 'Edit Logs' },
        { id: 'RemoveLogs',     label: 'Remove Logs' },
        { id: 'AddSuppliers',   label: 'Add Suppliers' },
        { id: 'EditSuppliers',  label: 'Edit Suppliers' },
        { id: 'RemoveSuppliers',label: 'Remove Suppliers' }
    ];

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Icons.Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input className="search-bar auth-input" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.5rem', marginBottom: 0 }} />
                </div>
                <button className="auth-btn-primary" style={{ padding: '0.6rem 1.2rem', margin: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsAddingUser(true)}>
                    <Icons.Plus size={16} /> Add Member
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Permissions</th>
                            <th>Created</th>
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
                                <td><StatusBadge type="role" value={u.role || 'Auditor'} /></td>
                                <td>{u.role === 'Administrator' || u.role === 'Manager' ? <StatusBadge type="simple" value="Primary Access" /> : (u.restrictions?.length ? <span style={{fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '700'}}>{u.restrictions.length} Restrictions</span> : <StatusBadge type="simple" value="None" />)}</td>
                                <td><div style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</div></td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="tool-btn" onClick={() => handleEdit(u)} disabled={u.id === currentUser.uid} style={{ padding: '0.4rem', opacity: u.id === currentUser.uid ? 0.3 : 1 }}>
                                        <Icons.Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ADD USER MODAL */}
            <GenericModal isOpen={isAddingUser} onClose={() => setIsAddingUser(false)} title="Register New Member" width="550px">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <FormInput label="Full Name" placeholder="e.g. Juan Dela Cruz" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                    <FormInput label="Username" placeholder="juan_dc" value={addForm.username} onChange={e => setAddForm({...addForm, username: e.target.value})} />
                </div>
                <FormInput label="Email Address" type="email" placeholder="juan@company.com" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} style={{marginBottom: '1.25rem'}} />
                <FormInput label="Initial Password" type="password" placeholder="Min 6 characters" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} style={{marginBottom: '1.5rem'}} />

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Access Level</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {['Administrator', 'Manager', 'Auditor'].map(role => (
                            <button key={role} onClick={() => setAddForm({...addForm, role})} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid', borderColor: addForm.role === role ? 'var(--accent-color)' : 'var(--border-color)', background: addForm.role === role ? 'var(--selected-bg)' : 'transparent', color: addForm.role === role ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>{role}</button>
                        ))}
                    </div>
                </div>

                {addForm.role === 'Auditor' && (
                    <div className="fade-in" style={{ marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Selected actions will be <strong>disabled</strong> for this user.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {RESTRICTION_LIST.map(res => (
                                <div key={res.id} onClick={() => toggleRestriction(res.id, true)} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '10px', background: (addForm.restrictions || []).includes(res.id) ? 'rgba(239, 68, 68, 0.05)' : 'var(--hover-bg)', border: '1px solid', borderColor: (addForm.restrictions || []).includes(res.id) ? 'var(--danger)' : 'transparent', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: (addForm.restrictions || []).includes(res.id) ? 'var(--danger)' : 'var(--text-primary)' }}>{res.label}</span>
                                    {(addForm.restrictions || []).includes(res.id) && <AlertCircleIcon size={14} color="var(--danger)" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="auth-btn-text" onClick={() => setIsAddingUser(false)} style={{ flex: 1, padding: '0.8rem 1.5rem', background: 'transparent' }}>Discard</button>
                    <button className="auth-btn-primary" onClick={handleRegister} disabled={isSaving} style={{ flex: 2, padding: '0.8rem 2rem', margin: 0 }}>{isSaving ? 'Processing...' : 'Create & Invite'}</button>
                </div>
            </GenericModal>

            {/* EDIT USER MODAL */}
            <GenericModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Adjust Permissions" width="500px">
                {editingUser && (
                    <>
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
                                    <button key={role} onClick={() => setEditRole(role)} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid', borderColor: editRole === role ? 'var(--accent-color)' : 'var(--border-color)', background: editRole === role ? 'var(--selected-bg)' : 'transparent', color: editRole === role ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>{role}</button>
                                ))}
                            </div>
                        </div>

                        {editRole === 'Auditor' && (
                            <div className="fade-in" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Selected actions will be <strong>revoked</strong> for this user.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                    {RESTRICTION_LIST.map(res => (
                                        <div key={res.id} onClick={() => toggleRestriction(res.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: (editRestrictions || []).includes(res.id) ? 'rgba(239, 68, 68, 0.05)' : 'var(--hover-bg)', border: '1px solid', borderColor: (editRestrictions || []).includes(res.id) ? 'var(--danger)' : 'transparent', cursor: 'pointer' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: (editRestrictions || []).includes(res.id) ? 'var(--danger)' : 'var(--text-primary)' }}>{res.label}</div>
                                            {(editRestrictions || []).includes(res.id) && <AlertCircleIcon size={14} color="var(--danger)" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', alignItems: 'center' }}>
                            <button className="tool-btn" onClick={handleDelete} disabled={isSaving} style={{ width: '48px', height: '48px', padding: 0, borderRadius: '12px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove User"><Icons.Trash size={20} /></button>
                            <button className="auth-btn-text" onClick={() => setEditingUser(null)} style={{ flex: 1, padding: '0.8rem 1.5rem', background: 'transparent' }}>Cancel</button>
                            <button className="auth-btn-primary" onClick={handleSave} disabled={isSaving} style={{ flex: 2, padding: '0.8rem 2rem', margin: 0 }}>{isSaving ? 'Updating...' : 'Update Member'}</button>
                        </div>
                    </>
                )}
            </GenericModal>
        </div>
    );
};
window.AdminUserManagementTab = UserManagementTab;
