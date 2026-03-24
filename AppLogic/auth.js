/**
 * Auth Component
 * Handles functional and 'elegant' Login and Signup screens.
 */

const Auth = ({ onLoginSuccess }) => {
    const params = new URLSearchParams(window.location.search);
    const queryMode = params.get('mode');
    const oobCode = params.get('oobCode');

    // 'login', 'signup', 'forgot', 'change', 'resetNewPassword'
    const [view, setView] = React.useState(queryMode === 'resetPassword' ? 'resetNewPassword' : 'login');
    const [branding, setBranding] = React.useState(window.AppDataHandler.getBrandingSync());
    const [showPassword, setShowPassword] = React.useState(false);
    const [oldPass, setOldPass] = React.useState('');
    const [newPass, setNewPass] = React.useState('');
    const [confirmPass, setConfirmPass] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        identifier: ''
    });

    React.useEffect(() => {
        const loadBranding = async () => {
            const b = await window.AppDataHandler.getBranding();
            setBranding(b);
            if (b.companyName) {
                document.title = `${b.companyName} - Login`;
            }
        };
        loadBranding();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);
        try {
            const user = await window.AppDataHandler.login(formData.username, formData.password);
            onLoginSuccess(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, username, email, password, confirmPassword } = formData;

        if (!name || !username || !email || !password) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const user = await window.AppDataHandler.signup({ name, username, email, password });
            onLoginSuccess(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [confirmDialog, setConfirmDialog] = React.useState(null); // { title: '', message: '', onConfirm: fn }

    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        if (!formData.identifier) {
            setError("Please enter your username or email.");
            return;
        }

        setConfirmDialog({
            title: 'Send Reset Link?',
            message: (
                <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <p>We will send a password reset link to your registered email address.</p>
                    <div style={{ background: 'var(--hover-bg)', padding: '1rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontWeight: '700', color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            Important Note:
                        </p>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                            <li>Please use this feature <strong>conservatively</strong>. Firebase limits free accounts to 10 emails per day.</li>
                            <li>If you don't see the email, check your <strong>Spam or Junk</strong> folder.</li>
                        </ul>
                    </div>
                </div>
            ),
            onConfirm: async () => {
                setLoading(true);
                try {
                    await window.AppDataHandler.sendPasswordResetEmail(formData.identifier);
                    setError('');
                    setConfirmDialog({
                        title: 'Link Sent!',
                        message: 'If an account matches that identifier, a reset link is on its way. Please check your inbox (and spam folder).',
                        onConfirm: () => setView('login'),
                        confirmLabel: 'Back to Login',
                        hideCancel: true
                    });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            await window.AppDataHandler.confirmPasswordReset(oobCode, formData.password);
            setConfirmDialog({
                title: 'Password Reset!',
                message: 'Your password has been successfully updated. You can now sign in with your new credentials.',
                onConfirm: () => {
                   window.location.href = window.location.pathname; 
                },
                confirmLabel: 'Proceed to Login',
                hideCancel: true
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePasswordDirectly = async (e) => {
        e.preventDefault();
        if (!formData.username || !oldPass || !newPass || !confirmPass) {
            setError("All fields (Username, Old Password, and New Password) are required.");
            return;
        }
        if (newPass !== confirmPass) {
            setError("New passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await window.AppDataHandler.login(formData.username, oldPass); // Verify current
            await window.AppDataHandler.changePassword(oldPass, newPass);
            alert("Password updated successfully!");
            setView('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getSubmitHandler = () => {
        if (view === 'signup') return handleSignup;
        if (view === 'forgot') return handleForgotPassword;
        if (view === 'change') return handleChangePasswordDirectly;
        if (view === 'resetNewPassword') return handleResetPassword;
        return handleLogin;
    };

    // Icons
    const EyeIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const EyeOffIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    );

    return (
        <div className="auth-overlay">
            <div className="auth-box">
                <div className="auth-header">
                    {branding.logoUrl ? (
                        <div style={{ height: '48px', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            <img src={branding.logoUrl} alt="Logo" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div className="auth-logo" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            {branding.companyName || 'CloudBased'}
                        </div>
                    )}
                    <div className="auth-subtitle">
                        {view === 'forgot' && 'Reset your password.'}
                        {view === 'change' && 'Change your password.'}
                        {view === 'resetNewPassword' && 'Create a new password.'}
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={getSubmitHandler()}>
                    {view === 'signup' && (
                        <div className="auth-input-group">
                            <label className="auth-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="auth-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required={view === 'signup'}
                            />
                        </div>
                    )}

                    {(view === 'login' || view === 'signup') && (
                        <div className="auth-input-group">
                            <label className="auth-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="auth-input"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required={view === 'login' || view === 'signup'}
                            />
                        </div>
                    )}

                    {view === 'signup' && (
                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required={view === 'signup'}
                            />
                        </div>
                    )}

                    {view === 'forgot' && (
                        <div className="auth-input-group">
                            <label className="auth-label">Username or Email</label>
                            <input
                                type="text"
                                name="identifier"
                                className="auth-input"
                                placeholder="johndoe or john@example.com"
                                value={formData.identifier}
                                onChange={handleChange}
                                required={view === 'forgot'}
                            />
                        </div>
                    )}
                    {view === 'change' && (
                        <>
                            <div className="auth-input-group">
                                <label className="auth-label">Username</label>
                                <input type="text" name="username" className="auth-input" placeholder="johndoe" value={formData.username} onChange={handleChange} required />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Current Password</label>
                                <input type="password" name="oldPass" className="auth-input" placeholder="••••••••" value={oldPass} onChange={e => setOldPass(e.target.value)} required />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">New Password</label>
                                <input type="password" name="newPass" className="auth-input" placeholder="••••••••" value={newPass} onChange={e => setNewPass(e.target.value)} required />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Confirm New Password</label>
                                <input type="password" name="confirmPass" className="auth-input" placeholder="••••••••" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                            </div>
                        </>
                    )}
                    {(view === 'login' || view === 'signup' || view === 'resetNewPassword') && (
                        <div className="auth-input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                                {view === 'login' && (
                                    <button type="button" className="auth-btn-text" style={{ fontSize: '0.8rem', padding: 0 }} onClick={() => { setView('forgot'); setError(''); }}>
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="auth-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={view === 'login' || view === 'signup' || view === 'resetNewPassword'}
                                />
                                <div className="auth-input-icon" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </div>
                            </div>
                        </div>
                    )}

                    {(view === 'signup' || view === 'resetNewPassword') && (
                        <div className="auth-input-group">
                            <label className="auth-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="auth-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required={view === 'signup' || view === 'resetNewPassword'}
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading && 'Processing...'}
                        {!loading && view === 'login' && 'Sign In'}
                        {!loading && view === 'signup' && 'Create Account'}
                        {!loading && view === 'forgot' && 'Send Reset Link'}
                        {!loading && view === 'change' && 'Update Password'}
                        {!loading && view === 'resetNewPassword' && 'Set New Password'}
                    </button>
                </form>

                {view === 'forgot' && (
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <button className="auth-btn-text" style={{ fontSize: '0.85rem' }} onClick={() => setView('change')}>
                            Know your old password? Change it manually
                        </button>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    {(view === 'login' || view === 'signup') && (
                        <button className="auth-btn-text" onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }}>
                            {view === 'login' ? "Don't have an account? Join now" : "Already have an account? Sign in"}
                        </button>
                    )}
                    {(view === 'forgot' || view === 'resetNewPassword' || view === 'change') && (
                        <button className="auth-btn-text" onClick={() => { setView('login'); setError(''); }}>
                            Back to Sign in
                        </button>
                    )}
                </div>
            </div>

            {confirmDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="fade-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{confirmDialog.title}</h3>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem' }}>{confirmDialog.message}</div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {!confirmDialog.hideCancel && (
                                <button onClick={() => setConfirmDialog(null)} style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            )}
                            <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog(null); }} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
                                {confirmDialog.confirmLabel || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
