/**
 * ==========================================
 * USER SETTINGS COMPONENT
 * ==========================================
 * Isolated view for application configurations
 * such as the global light/dark theme toggle.
 */

const UserSettings = ({ theme, toggleTheme, threshold, setThreshold, isThresholdEnabled, setIsThresholdEnabled }) => {

    // --- Local State for Threshold Input ---
    const [inputValue, setInputValue] = useState(threshold.toString());
    const [errorMsg, setErrorMsg] = useState("");

    const handleThresholdChange = (e) => {
        let val = e.target.value;
        setInputValue(val); // Always update text field to let user verify

        // Allow empty field to be evaluated cleanly
        if (val === '') {
            setErrorMsg("");
            return;
        }

        let num = parseInt(val, 10);
        if (isNaN(num)) return;

        if (num < 0) {
            num = 0;
            setInputValue("0");
            setErrorMsg("Threshold cannot be less than 0. Autocorrected to 0.");
        } else if (num > 99999) {
            num = 99999;
            setInputValue("99999");
            setErrorMsg(`Exceeded maximum threshold. Autocorrected to 99999.`);
        } else {
            setErrorMsg("");
        }

        // Saves immediately upon passing checks
        setThreshold(num);
    };

    const handleThresholdBlur = () => {
        if (inputValue === '') {
            setInputValue("0");
            setThreshold(0);
            setErrorMsg("Please input a value properly. Autocorrected to 0.");
        }
    };

    // --- Render ---
    return (
        <div className="list-box settings-tab">

            <h2>Settings</h2>

            {/* Application Theme Setting Block */}
            <div className="setting-item">
                <div className="setting-info">
                    <h3>Themes</h3>
                    <p>Switch between different light and dark themes.</p>
                </div>

                {/* Inherits styling from the main toolbar buttons for consistency */}
                <button className="tool-btn edit-btn" onClick={toggleTheme} style={{ width: '200px' }}>
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
            </div>

            {/* Low Stock Threshold Setting Block */}
            <div className="setting-item setting-column" style={{ marginTop: '1.5rem' }}>
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Global Stock Threshold</h3>
                        <p>Items with quantities at or below this limit will automatically be flagged as "Low Stock".</p>
                    </div>

                    <div className="threshold-controls">
                        <button
                            className="tool-btn edit-btn"
                            onClick={() => setIsThresholdEnabled(!isThresholdEnabled)}
                            style={{ width: '100px' }}
                        >
                            {isThresholdEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <input
                            type="number"
                            className="search-bar"
                            style={{ width: '120px', textAlign: 'center', fontSize: '1.1rem', opacity: isThresholdEnabled ? 1 : 0.5 }}
                            value={inputValue}
                            onChange={handleThresholdChange}
                            onBlur={handleThresholdBlur}
                            disabled={!isThresholdEnabled}
                        />
                    </div>
                </div>

                {/* Standard text autocorrect/error message beneath the field */}
                {errorMsg && isThresholdEnabled && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Application Info Block */}
            <div className="setting-item" style={{ marginTop: '1.5rem' }}>
                <div className="setting-info">
                    <h3>CloudBased</h3>
                    <p>  -ˋˏ ._. ˎˊ  </p>
                    <p>Version: 0.2.2  |  Last Updated: March 18, 2026</p>
                    <p>Created by: Cheng Roa and Tejada</p>
                </div>
            </div>

        </div>
    );
};
