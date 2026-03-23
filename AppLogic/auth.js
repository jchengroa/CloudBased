/**
 * Auth Component
 * Handles functional and 'elegant' Login and Signup screens.
 */

const Auth = ({ onLoginSuccess }) => {
    const [view, setView] = React.useState('login'); // 'login' or 'signup'
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

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
                    <div className="auth-logo">CloudBased</div>
                    <div className="auth-subtitle">
                        {view === 'login' ? 'Welcome back to perfection.' : 'Begin your journey with us.'}
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

                <form className="auth-form" onSubmit={view === 'login' ? handleLogin : handleSignup}>
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
                                required
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label className="auth-label">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            className="auth-input" 
                            placeholder="johndoe" 
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

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
                                required
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                name="password" 
                                className="auth-input" 
                                placeholder="••••••••" 
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="auth-input-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </div>
                        </div>
                    </div>

                    {view === 'signup' && (
                        <div className="auth-input-group">
                            <label className="auth-label">Confirm Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                className="auth-input" 
                                placeholder="••••••••" 
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <button className="auth-btn-text" onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }}>
                        {view === 'login' ? "Don't have an account? Join now" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};
