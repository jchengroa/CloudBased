/** User Settings (Account & System Management)
 * A visually stunning modal for managing profile, preferences, and data.
 */

const UIIcons = {
    User: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Key: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>,
    Palette: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h1.5A5.5 5.5 0 0 0 22 10c0-4.4-4.5-8-10-8Z"></path></svg>,
    Moon: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>,
    Activity: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
    Database: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>,
    Trash: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Book: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>,
    Check: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"></polyline></svg>,
    X: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Info: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
    Cloud: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.1-3.9-4.4-.6-2.6-3-4.1-5.6-3.6-1.9.4-3.5 1.8-4 3.6C6.3 10.3 4.5 12 4.5 14.1c0 2.4 2 4.4 4.4 4.4"></path></svg>,
    Refresh: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
};

const UISafeIcons = UIIcons;
const APP_BUILD_DATE = 'April 28, 2026';
const APP_VERSION_FALLBACK = '0.16.5';

const FormInput = ({ label, type = "text", id, ...props }) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9));
    return (
        <div className="auth-input-group">
            {label && <label className="auth-label" htmlFor={inputId}>{label}</label>}
            <input type={type} className="auth-input" id={inputId} name={inputId} {...props} />
        </div>
    );
};

const SettingsCard = ({ icon, title, children }) => (
    <div className="user-settings-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        {title && (
            <div className="user-settings-card-header" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent-color)', display: 'flex' }}>{icon}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{title}</span>
            </div>
        )}
        <div className="user-settings-card-body" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
            {children}
        </div>
    </div>
);

const UserSettings = ({ user, onClose, onUpdateUser, inventoryData = [] }) => {
    // Current Profile States
    const [name, setName] = React.useState(user.name || '');
    const [username, setUsername] = React.useState(user.username || '');
    const [email, setEmail] = React.useState(user.email || '');
    const [pic, setPic] = React.useState(user.profilePicture || user.avatar || '');

    // System Settings Drafts (Defer Saving)
    const [theme, setTheme] = React.useState(user.settings?.theme || 'light');
    const [themeColor, setThemeColor] = React.useState(user.settings?.themeColor || '#4f46e5');
    const [threshold, setThreshold] = React.useState(user.settings?.lowStockThreshold || '');
    const [isThresholdEnabled, setIsThresholdEnabled] = React.useState(user.settings?.isThresholdEnabled ?? false);

    // Track unsaved system changes
    const needsSave = theme !== (user.settings?.theme || 'light') ||
        themeColor !== (user.settings?.themeColor || '#4f46e5') ||
        threshold.toString() !== (user.settings?.lowStockThreshold || '').toString() ||
        isThresholdEnabled !== (user.settings?.isThresholdEnabled ?? false);

    const handleThemeToggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
    };

    const handleColorSelect = (hex) => {
        setThemeColor(hex);
        document.documentElement.style.setProperty('--accent-color', hex);
    };

    const handleWrappedClose = () => {
        if (needsSave) {
            const newSettings = {
                ...user.settings,
                theme,
                themeColor,
                lowStockThreshold: parseFloat(threshold) || '',
                isThresholdEnabled
            };
            window.AppDataHandler.saveSettings(newSettings).then(updated => {
                if (updated) onUpdateUser(updated);
            });
        }
        onClose();
    };

    const [authAction, setAuthAction] = React.useState(null);
    const [oldPass, setOldPass] = React.useState('');
    const [newPass, setNewPass] = React.useState('');
    const [confirmPass, setConfirmPass] = React.useState('');

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [confirmDialog, setConfirmDialog] = React.useState(null);

    const showMessage = (msg, isErr = false) => {
        isErr ? setError(msg) : setSuccess(msg);
        setTimeout(() => { setError(''); setSuccess(''); }, 3000);
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const updated = await window.AppDataHandler.updateProfile({ name, username, email, profilePicture: pic });
            onUpdateUser(updated);
            setAuthAction(null);
            showMessage('Profile updated!');
        } catch (e) { showMessage(e.message, true); }
        finally { setLoading(false); }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        if (newPass !== confirmPass) { showMessage("Passwords mismatch.", true); setLoading(false); return; }
        try {
            await window.AppDataHandler.changePassword(oldPass, newPass);
            setOldPass(''); setNewPass(''); setConfirmPass('');
            setAuthAction(null);
            showMessage('Password updated!');
        } catch (e) { showMessage(e.message, true); }
        finally { setLoading(false); }
    };

    const handleSaveSystemSettings = async () => {
        setLoading(true);
        try {
            const newSettings = {
                ...user.settings,
                theme,
                themeColor,
                lowStockThreshold: parseFloat(threshold) || '',
                isThresholdEnabled
            };

            const updatedUser = await window.AppDataHandler.saveSettings(newSettings);
            if (updatedUser) {
                // Apply visual changes across the whole app
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.style.setProperty('--accent-color', themeColor);
                onUpdateUser(updatedUser);
                showMessage('Preferences saved & applied!');
            }
        } catch (e) { showMessage(e.message, true); }
        finally { setLoading(false); }
    };

    return (
        <div className="prompt-overlay" onClick={e => e.target.className === 'prompt-overlay' && handleWrappedClose()}>
            <div className="prompt-box user-settings-modal" style={{ maxWidth: '800px', width: '95%', padding: '2rem 2.5rem', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-color)', position: 'relative' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.75px', color: 'var(--text-primary)' }}>User Settings</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Personalize your experience at {user.company || 'Enterprise'}.</p>
                    </div>
                    <button onClick={handleWrappedClose} style={{ background: 'var(--hover-bg)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <UISafeIcons.X size={20} />
                    </button>
                </div>

                {error && <div className="slide-up" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>{error}</div>}
                {success && <div className="slide-up" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>{success}</div>}

                {/* Profile Card */}
                <SettingsCard icon={<UISafeIcons.User size={22} />} title="Profile Information">
                    <div className="user-settings-profile-row" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            {pic ? (
                                <img src={window.AppDataHandler.getUserAvatarSrc({ ...user, avatar: pic, profilePicture: pic }, name)} alt="avatar" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-color)' }} />
                            ) : (
                                <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--hover-bg)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '800' }}>
                                    {name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Account Holder</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem' }}>{name}</div>
                            <button onClick={() => setAuthAction('editProfile')} style={{ padding: '0.6rem 1.25rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UISafeIcons.User size={16} /> Edit Public Profile
                            </button>
                        </div>
                    </div>
                </SettingsCard>

                {/* Theme Card */}
                <SettingsCard icon={<UISafeIcons.Palette size={22} />} title="User Themes">
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Dark Mode</div>
                            <div style={{ background: theme === 'dark' ? 'var(--accent-color)' : 'var(--border-color)', width: '52px', height: '28px', borderRadius: '30px', position: 'relative', cursor: 'pointer', transition: '0.3s' }} onClick={handleThemeToggle}>
                                <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: theme === 'dark' ? '27px' : '3px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Toggle between light and dark themes for your workspace.</p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem -1.5rem', paddingTop: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>Accent Color</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {[
                                { hex: '#4f46e5', label: 'Blue' },
                                { hex: '#10b981', label: 'Green' },
                                { hex: '#8b5cf6', label: 'Violet' },
                                { hex: '#f43f5e', label: 'Red' },
                                { hex: '#f59e0b', label: 'Orange' }
                            ].map(c => (
                                <button key={c.hex} onClick={() => handleColorSelect(c.hex)} style={{ flex: '1 1 120px', minHeight: '50px', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${themeColor === c.hex ? c.hex : 'var(--border-color)'}`, background: themeColor === c.hex ? `${c.hex}15` : 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: c.hex }}></div>
                                    <span style={{ fontSize: '0.85rem' }}>{c.label}</span>
                                    {themeColor === c.hex && <UISafeIcons.Check size={14} style={{ position: 'absolute', right: '10px', color: c.hex }} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </SettingsCard>

                {/* Preferences Card */}
                <SettingsCard icon={<UISafeIcons.Activity size={22} />} title="Stock Preferences">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Low Stock Threshold</div>
                        <div style={{ background: isThresholdEnabled ? 'var(--accent-color)' : 'var(--border-color)', width: '52px', height: '28px', borderRadius: '30px', position: 'relative', cursor: 'pointer', transition: '0.3s' }} onClick={() => setIsThresholdEnabled(!isThresholdEnabled)}>
                            <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isThresholdEnabled ? '27px' : '3px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                        </div>
                    </div>
                    <div style={{ opacity: isThresholdEnabled ? 1 : 0.4, pointerEvents: isThresholdEnabled ? 'auto' : 'none', transition: '0.3s' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                className="auth-input"
                                placeholder="Min quantity threshold..."
                                value={threshold}
                                onChange={e => setThreshold(e.target.value)}
                                style={{ maxWidth: '300px', margin: 0 }}
                            />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Define the quantity at which an item is considered low stock.</div>
                        </div>
                    </div>
                </SettingsCard>



                {/* Data Management Section */}
                <SettingsCard icon={<UISafeIcons.Database size={22} color="#f59e0b" />} title="Data Management">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.05rem' }}>Clear Local Storage</div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Reset all application settings and cached data stored locally.</p>
                        </div>
                        <button onClick={async () => { if (confirm("Clear local storage?")) { localStorage.clear(); location.reload(); } }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.25rem', borderRadius: '10px', border: 'none', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', fontWeight: '700', cursor: 'pointer' }}>
                            <UISafeIcons.Trash size={18} /> Clear Storage
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.05rem' }}>Force Database Resync</div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manually trigger a full synchronization with the cloud database.</p>
                        </div>
                        <button onClick={() => location.reload()} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}>
                            <UISafeIcons.Refresh size={18} /> Resync Now
                        </button>
                    </div>

                    <div style={{ background: 'rgba(244, 63, 94, 0.04)', margin: '0 -1.5rem -1.5rem -1.5rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 16px 16px' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: '#f43f5e', fontSize: '1.05rem' }}>Delete Account</div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Permanently delete your account and profile data.</p>
                        </div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.25rem', borderRadius: '10px', border: 'none', background: '#f43f5e', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)' }}>
                            <UISafeIcons.Trash size={18} /> Delete Account
                        </button>
                    </div>
                </SettingsCard>

                {/* About Section */}
                <SettingsCard icon={<UISafeIcons.Info size={22} color="#f59e0b" />} title="About">
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1, background: 'var(--hover-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                <UISafeIcons.Info size={16} /> VERSION INFO
                            </div>
                            <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>CloudBased IMS</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Version {window.AppDataHandler.getVersion?.() || APP_VERSION_FALLBACK}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Date Modified: {APP_BUILD_DATE}</div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--hover-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="assets/images/icon.png" alt="logo" style={{ width: '48px', height: '48px', marginBottom: '1rem', objectFit: 'contain' }} />
                            <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>CloudBased</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Created by: Cheng Roa and Tejada</div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.open('https://docs.google.com/document/d/1IDJJCSr47DScc8_yXGR1jIdeV20nKvXWF1PBAPHheIs/edit?usp=sharing', '_blank')}
                        style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                    >
                        <UISafeIcons.Book size={18} /> Access User Manual
                    </button>
                </SettingsCard>
            </div>

            {/* Auth Overlays */}
            {authAction && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="prompt-box scale-up" style={{ width: '400px', padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>{authAction === 'editProfile' ? 'Edit Profile' : 'Update Security'}</h3>

                        {authAction === 'editProfile' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <FormInput label="Display Name" value={name} onChange={e => setName(e.target.value)} />
                                <FormInput label="Username" value={username} onChange={e => setUsername(e.target.value)} />
                                <FormInput label="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setAuthAction(null)} className="auth-btn-text">Cancel</button>
                                    <button onClick={handleUpdateProfile} disabled={loading} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Save Profile</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <FormInput type="password" label="Old Password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
                                <FormInput type="password" label="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
                                <FormInput type="password" label="Confirm" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setAuthAction(null)} className="auth-btn-text">Cancel</button>
                                    <button onClick={handleChangePassword} disabled={loading} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Update Pass</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
window.UserSettings = UserSettings;
