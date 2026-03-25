# CloudBased
The Cloud-Based Multi-Warehouse Inventory Management System. 

This is the academic version, to fulfill subject requirements!

<img width="500" height="500" alt="Icon" src="https://github.com/user-attachments/assets/b0adc3a9-9bbb-481f-84d7-96ddc4f67976" />

===============================================================

A SOFDESG and LBYCPD2 Project. Created by Cheng Roa and Tejada

===============================================================

### Version 0.1 (March 18, 2026)
- **Project Architecture & Interface**: Created core project files (HTML, CSS, JS) and established the working interface.
- **Project Architecture & Interface**: Built the main application files, implemented global state management, and created seamless tab navigation between app screens.
- **Project Architecture & Interface**: Fully modularized index.css using modern design principles, flexbox layouts, CSS variables, and clean interactive elements (hover states, custom UI buttons).
- **Components & Features**: Implemented a dynamic interactive table displaying items and properties. Features include a management toolbar with Search/Add tools, individual/bulk row checkbox selection, and responsive state changes.
- **Components & Features**: Replicated and adapted core table functionalities to display suppliers and contact information, complete with unique column sizing and its own interactive toolbar.
- **Components & Features**: Implemented a dedicated Settings dashboard populated with system configurations, featuring a working application-wide Light/Dark Mode theme switcher.

### Version 0.2 (March 18, 2026)
- **Project Architecture & Interface**: Re-architected project tree: separated logic files into /App Logic/ folder and CSS into /Resources/ for modular cleanliness.
- **Project Architecture & Interface**: Implemented real-time dynamic search bars across both Inventory and Supplier tables, filtering across multiple columns simultaneously on every keystroke.
- **Project Architecture & Interface**: Added smart visual safety-locks preventing erroneous multiple "Edits" when checking off bulk items.
- **Project Architecture & Interface**: Upgraded entire table rows to be seamlessly clickable instead of targeting just the checkbox.
- **Components & Features**: Developed a reusable, animated floating modal overlay (pop-up box). It elegantly dims the main background to safely handle all specific interaction forms (e.g., Add Item, Edit Supplier) anywhere in the application.
- **Components & Features**: Fully implemented detailed Add/Edit mock forms matching Figma layout, equipped with native dropdowns and linked dynamically to global supplier data.
- **Components & Features**: Added "Global Stock Threshold" module (with Enable/Disable disable logic), providing real-time bounding limit validation for computing inventory statuses dynamically across the app.
- **Components & Features**: Added a dedicated "Supplier Details" contact card view in the Prompt overlay, dynamically opened directly by clicking on any linked supplier name in the Inventory Table.

### Version 0.2.1 (March 18, 2026)
- **Git & Project Configuration**: Removed spaces from `App Logic` folder (`AppLogic`) and updated paths in `index.html` to prevent URL encoding issues and cross-platform sync problems with Git and GitHub Pages.
- **Git & Project Configuration**: Added `.gitignore` to safely prevent OS-level items like `.DS_Store` and generic config files from polluting the master branch.
- **Git & Project Configuration**: Added `.gitattributes` to explicitly force LF line endings (`text=auto`) to avoid painful `CRLF` versus `LF` conversion issues on Windows when cloning or pushing.
- **Mobile UI Fix**: Refactored hardcoded inline styles into dynamic CSS classes (`setting-item-inner`, `threshold-controls`) in UserSettings.js to allow for seamless mobile responsiveness.

### Version 0.2.2 (March 18, 2026)
- **Mobile & Desktop UI Polish**: Refactored hardcoded inline styles into dynamic CSS classes to allow for seamless mobile responsiveness, while correctly restoring desktop-only flex gaps for the bounding threshold controls.
- **Mobile & Desktop UI Polish**: Added comprehensive `@media` queries for mobile screens (`max-width: 768px`) in index.css.
- **Header & Navigation Restructure**: Registered project branding `icon.png` as the official website favicon.
- **Header & Navigation Restructure**: Created a new absolute top-level edge-to-edge header matching the table highlight colors. Moved the Logo, system tabs ("Inventory", "Suppliers"), and User Avatar into this unified bar.
- **Header & Navigation Restructure**: Stripped redundant "Administrator" labels to clean up the profile dropdown layout.
- **New Features & Functionality**: Repurposed the previous sub-navigation space into a horizontal scrollable filter bar. Automatically computes unique Warehouses and renders them as clickable "pill" cards that actively pre-filter the Inventory table.
- **New Features & Functionality**: Upgraded the main column definition row (`header-row`) in both the Inventory and Supplier tables so that clicking anywhere on the header dynamically selects or deselects all visible items instantly.

### Version 0.3 (March 18, 2026)
- **Data Persistence & Creation of Backend System**: Implemented a robust data loading system that prioritizes: Session Cache (localStorage) -> Modified Files (settings.json, uoms.json) -> Constant Defaults (defaultsettings.json, defaultuoms.json).
- **Data Persistence & Creation of Backend System**: Added support for `defaultsettings.json` and `defaultuoms.json` as permanent constant fallbacks for initial application startup.
- **Data Persistence & Creation of Backend System**: Created `settings.json` and `uoms.json` to store user-defined overrides, ensuring defaults remain untouched.
- **Data Persistence & Creation of Backend System**: Configured the application to automatically record all modifications into temporary browser storage, providing a seamless bridge until a cloud database is established.
- **App Logic & CRUD Operations**: Fully implemented Create, Read, Update, and Delete (CRUD) operations for both the Inventory and Supplier tables.
- **App Logic & CRUD Operations**: Transformed the static Prompt modal into a dynamic, state-driven form handler with controlled inputs and intelligent pre-filling for edit operations.
- **App Logic & CRUD Operations**: Removed all development console logs and mockup simulation notes to provide a cleaner, production-ready user experience.
- **App Logic & CRUD Operations**: Added automatic selection clearing across tables whenever data is modified, ensuring a seamless and error-free bulk action workflow.
- **App Logic & CRUD Operations**: Fixed React ReferenceErrors (useState/useEffect) caused by script-based Babel scoping.
- **App Logic & CRUD Operations**: Updated Quantity and Min Level fields to support empty inputs, allowing for easier clearing and precise data entry.
- **App Logic & CRUD Operations**: Added a dynamic placeholder and improved selection logic to ensure correct mapping of suppliers to inventory items.
- **App Logic & CRUD Operations**: Updated the Inventory Table to display "N/A" for empty supplier fields, ensuring clear visibility of data gaps.

### Version 0.4 (March 19, 2026)
- **Cloud Database Integration (Firebase Firestore)**: Integrated Google Firebase Firestore as the cloud database backend. All inventory, supplier, UOM, and warehouse data is now stored in and retrieved from Firestore.
- **Cloud Database Integration (Firebase Firestore)**: Added Firebase App and Firestore compat SDK scripts (loaded via CDN, no bundler required) to index.html.
- **Cloud Database Integration (Firebase Firestore)**: Fully rewrote all fetch and save methods in AppDataHandler.js to communicate with Firestore.
- **Cloud Database Integration (Firebase Firestore)**: Split data so that Firestore handles shared application data while localStorage handles personal settings and the Firebase config override.
- **Cloud Database Integration (Firebase Firestore)**: Implemented seeding logic that automatically populates the database from the corresponding default JSON file if collections are empty.
- **AppDataHandler Architecture Overhaul**: Refactored the data loading system so that `defaultsettings.json` is the authoritative source of startup defaults, with localStorage as the primary store for user modifications.
- **AppDataHandler Architecture Overhaul**: Removed redundant save-file stubs that were unused now that localStorage handles all runtime storage.
- **AppDataHandler Architecture Overhaul**: Renamed `warehouses.json` to `defaultwarehouses.json`, aligning it with the established `default*.json` naming convention for constant fallback files.
- **AppDataHandler Architecture Overhaul**: Replaced old `fetchData`/`saveData` generic helpers with explicit, self-documenting methods per data type.
- **AppDataHandler Architecture Overhaul**: Added `clearAllData()` utility method that removes all app-scoped localStorage keys without affecting Firestore data.
- **AppDataHandler Architecture Overhaul**: Added `getFirebaseConfig()` and `saveFirebaseConfig()` public methods, enabling the Settings UI to update the active Firebase project config at runtime.
- **AppDataHandler Architecture Overhaul**: Firebase initialization now reads from a user-saved config in localStorage first, falling back to the hardcoded defaults.
- **Settings Enhancements**: Added a "Units of Measure (UOM)" settings block allowing users to add or remove UOM entries.
- **Settings Enhancements**: Added a "Reset App Data" settings block with a dedicated button that clears all local storage for the application.
- **Settings Enhancements**: Added a "Warehouses" settings block mirroring the UOM settings logic.
- **Settings Enhancements**: Added a "Database Configuration" settings block displaying all active Firebase config fields as editable inputs.
- **Loading Screen Overhaul**: Replaced the inline loading placeholder with an early return that shows a clean, bare full-screen loading view.
- **Loading Screen Overhaul**: Added a synchronous inline script in `<head>` that reads the saved theme from localStorage before React renders, eliminating the theme flash.
- **Loading Screen Overhaul**: Simplified loading text to "Loading Resources" with no subtitle.
- **UI/UX Polish**: Fixed Settings tab overflow — content now scrolls within the bounding box instead of pushing beyond the viewport.
- **UI/UX Polish**: Added `.setting-info` flex constraints to prevent long description text from crowding adjacent buttons in setting rows.

### Version 0.4.1 (March 19, 2026)
- **UI/UX Polish**: Added scrolling to the prompts. Added display 'flex' for auto stretch, and set 'overflow-y: auto' to automatically add a scrollbar once the prompt is taller than the viewport.

### Version 0.4.2 (March 19, 2026)
- **Security & Authentication**: Added Firebase Authentication compat SDK to the project headers.
- **Security & Authentication**: Implemented automatic anonymous authentication (`signInAnonymously`) to provide a secure layer for Firestore access.
- **Security & Authentication**: Addressed automated secret scanning alerts by securing the database logic against unauthorized external access.

### Version 0.4.3 (March 19, 2026)
- **Security & Data Load Fixes**: Resolved a race condition where data fetches would fire before authentication was established by implemented a global `authPromise`.
- **Security & Data Load Fixes**: Wrapped the initial startup sequence in a `try...finally` block to prevent the application from hanging on the "Loading Resources" screen if a network error occurs.

### Version 0.5 (March 19, 2026)
- **Inventory Transaction Logs**: Implemented a Triple-View Switcher to toggle between Overview, Input Log, and Output Log.
- **Inventory Transaction Logs**: Standardized the Unified Table Architecture to ensure all views share the same high-density interface with bulk selection.
- **Inventory Transaction Logs**: Implemented Bi-Directional Quantity Sync where input logs automatically increase inventory (+) and output logs subtract (-).
- **Inventory Transaction Logs**: Added Full History Editing for log entries with automatic quantity reversal upon modification or removal.
- **Inventory Transaction Logs**: Integrated Location-Aware Logs that dynamically filter based on the warehouse selection.
- **Advanced Sorting System**: Added an Intelligent Sort Button with custom sort logic (Alphabetical, Numerical, Time-based) across all tables.
- **Advanced Sorting System**: Implemented Smart Priority where "Status" sorting flags low stock items and "Warehouse" sorting prioritizes locations.
- **Advanced Sorting System**: Added Visual Feedback with active sort indicators on the filter button.
- **UI/UX Finalization**: Standardized "Save Changes" button styles across all administrative forms for a consistent premium feel.
- **UI/UX Finalization**: Fixed badge wrapping to maintain a clean pill shape on mobile and high-density screens.
- **UI/UX Finalization**: Implemented smooth fade-in animations for the new sorting dropdowns.
- **Codebase Architecture & Simplification**: Extracted the SortButton and ViewSwitcher into a generalized `sharedComponents.js` utility module.
- **Codebase Architecture & Simplification**: Consolidated table template structures into a single unified render loop in InventoryTable.js.
- **Codebase Architecture & Simplification**: Rewrote the massive `if-else` cascade in `handlePromptConfirm` into a cleanly delineated `switch` statement.
- **Comment Naturalization**: Removed robotic AI-generated block comments. Replaced rigid structural markers with concise, functional developer notes.
- **File System & Coding Style**: Unified all JavaScript filenames to `lowerCamelCase` style for project consistency.

### Version 0.6 (March 19, 2026)
- **ERPNext Integration & Data Exporting**: Developed a brand new `exportTool.js` module that generates CSV files pre-configured for ERPNext's multi-row import system.
- **ERPNext Integration & Data Exporting**: Implemented mandatory ERPNext headers (Entry Type, Field Label, Field Name/Db Key, and Metadata) for zero-config auto-mapping.
- **ERPNext Integration & Data Exporting**: Configured exports to leave the ID column blank by default, allowing ERPNext to automatically create new records.
- **ERPNext Integration & Data Exporting**: Added support for "Item List" and "Stock Reconciliation" DocTypes.
- **ERPNext Integration & Data Exporting**: Utilized UTF-8 with BOM (Byte Order Mark) encoding to guarantee correct display in Excel.
- **Settings UI Enhancements**: Integrated a new "Export to ERPNext" section into the User Settings dashboard.
- **Settings UI Enhancements**: Connected the export engine to the live application state, ensuring CSVs always reflect the most recent Firestore data.

### Version 0.6.1 (March 20, 2026)
- **Database Configuration & Resilience**: Separated the hardcoded Firebase configuration into a standalone `defaultDatabase.json` file.
- **Database Configuration & Resilience**: Refactored the AppDataHandler initialization sequence to be fully asynchronous.
- **Database Configuration & Resilience**: Implemented a robust "Database Not Found" state with clear error reporting in the table views.
- **Settings UI & Security Polish**: Added a "SHOW/HIDE" visibility toggle for the Firebase API Key in the Database Configuration block.
- **Settings UI & Security Polish**: Resolved a layout bug in the Database Configuration module where long input fields would overflow on mobile.
- **Settings UI & Security Polish**: Restructured the User Settings dashboard into logical, high-level categories (Appearance, Inventory Framework, Data & Connectivity, System Operations).
- **Settings UI & Security Polish**: Replaced the direct settings shortcut with a sleek dropdown menu accessible from the user avatar.
- **Settings UI & Security Polish**: Implemented smooth chevron rotations and scaling animations for a more polished UI experience.

### Version 0.6.2 (March 23, 2026)
- **Data Integrity & Validation**: Implemented duplicate entry guards for Item IDs, Supplier Name/IDs, and Transaction IDs within the Prompt modal.
- **Data Integrity & Validation**: Integrated a persistent error notification banner at the top of the Prompt overlay for real-time feedback.
- **Data Integrity & Validation**: Explicitly exposed the Supplier ID field in Add/Edit forms for manual control.
- **Component Bug Fixes & Refinements**: Resolved a bug in the dynamic form handler where `edit-input-log` would incorrectly source data.
- **Component Bug Fixes & Refinements**: Added missing initialization support for `edit-output-log` to ensure consistent CRUD behavior.
- **Component Bug Fixes & Refinements**: Configured the validation error state to automatically clear upon form re-opening or editing.

### Version 0.7.0 (March 23, 2026)
- **Authentication & Access Control**: Launched `login.html`, a high-security entry point that cleanly separates the authentication flow from the main workspace.
- **Authentication & Access Control**: Developed an elegant, high-contrast Login/Signup interface with real-time field validation and secure credential handling.
- **Authentication & Access Control**: Implemented a robust profile system supporting unique display names and custom bio pictures per user.
- **Authentication & Access Control**: Engineered secure redirects to ensure logged-out users are properly gated.
- **Redesigned User Settings Dashboard**: Completely rebuilt the settings menu to follow a modern modular layout (User Profile, System Operations, Version Info).
- **Redesigned User Settings Dashboard**: Added "Edit Profile" capabilities including one-click username updates and bio-picture clearing.
- **Redesigned User Settings Dashboard**: Implemented the official "Who Made This" section featuring Group 5 branding and the project's iconic heart-themed resources.
- **Redesigned User Settings Dashboard**: Formalized the application's build info (v0.7.0, March 23, 2026) within the system dashboard.
- **Core Architecture & Shared Logic**: Performed a massive refactoring of redundant buttons, inputs, headers, and UI controls into `sharedComponents.js`.
- **Core Architecture & Shared Logic**: Standardized `FormInput`, `FormSelect`, and `FormButtons` across all administrative prompts for consistency.
- **Core Architecture & Shared Logic**: Developed a shared client-side image resizing utility for optimized database performance.
- **Advanced Navigation & Filtering**: Converted the entire application navigation (Main Tabs, View Switchers, and Location Filters) into a consistent, premium pill-tab design.
- **Advanced Navigation & Filtering**: Extended location pills to Arrivals, Shipments, and Suppliers with intelligent site-specific associations.
- **Snappier UI & Refined Interaction**: Eliminated aggressive 'pop-up' and movement animations in favor of constant transitions or opacity fades.
- **Snappier UI & Refined Interaction**: Transformed Item List cards into fully clickable surfaces for instant 'tap-to-edit' management.
- **Snappier UI & Refined Interaction**: Integrated "Remove Photo" buttons across both Profile and Item forms to allow for instant asset resetting.

### Version 0.8.0 (March 23, 2026)
- **Executive Insights & Dashboard Logic**: Launched a high-level executive dashboard featuring real-time data visualization across 8 specialized logic blocks.
- **Executive Insights & Dashboard Logic**: Created dedicated modules for "Total Items", "Low Stock", and "Suppliers Only" for instant operational visibility.
- **Executive Insights & Dashboard Logic**: Implemented side-by-side specialized tables for "Recent Arrivals" and "Recent Shipments" with automated record fetching.
- **Executive Insights & Dashboard Logic**: Added a "Critical Replenishment Required" module that automatically flags items below safety stock levels.
- **Executive Insights & Dashboard Logic**: Developed "Warehouse Distribution" and "Category Performance" modules to visualize stock concentration and product variety.
- **Security & Authentication Refinement**: Integrated a "Forgot Password" flow directly into the login portal and cross-linked it within User Settings.
- **Security & Authentication Refinement**: Added a high-security manual password change view to the login gateway.
- **Security & Authentication Refinement**: Added "Back to Sign in" buttons and improved secondary navigation layout for a more modern, centered UI aesthetic.
- **Security & Authentication Refinement**: Resolved a Babel transpilation race condition in `login.html` that caused intermittent blank screens.
- **Catalog & Property Enhancements**: Expanded the Item Master schema to include a dedicated "Item Description" field.
- **Catalog & Property Enhancements**: Updated Item List cards to display product descriptions, improving detail visibility.
- **Catalog & Property Enhancements**: Added a smart-resized description textarea to the Inventory Add/Edit modal.
- **Data Management Cleanup**: Temporarily retired the "Import Inventory Data" stub to focus on migration features.

### Version 0.9.0 (March 23, 2026)
- **Data Migration & Advanced Administration**: Integrated the SheetJS library to support bulk data migration from Google Sheets and local Excel files.
- **Data Migration & Advanced Administration**: Implemented intelligent header matching for 'Items', 'Inventory', 'Receive', and 'Out' worksheets.
- **Data Migration & Advanced Administration**: Automatically extracts unique companies as Suppliers and generates randomized Transaction IDs.
- **Data Migration & Advanced Administration**: Developed a high-security data clearing tool (Nuke) with double-confirmation and string challenge protection.
- **Data Migration & Advanced Administration**: Refactored global layout and `.list-box` CSS to enable smooth, high-density scrolling across all views.
- **Data Migration & Advanced Administration**: Removed redundant data-entry stubs to improve dashboard workflow and system focus.

### Version 0.10.0 (March 23, 2026)
- **UI/UX Branding & Customization**: Launched a new branding module in the Admin Dashboard that supports real-time Company Logo uploads and removal.
- **UI/UX Branding & Customization**: Re-enabled the corporate identity color picker with synchronized accent colors across all users.
- **UI/UX Branding & Customization**: Overhauled the top-left edge of the application to display the Company Logo and Name as a single brand unit.
- **UI/UX Branding & Customization**: Corrected a CSS transparency bug that rendered the company name invisible on certain dark themes.
- **Inventory Lifecycle Tracking**: Introduced a new "Restocked?" data point across the entire inventory masters.
- **Inventory Lifecycle Tracking**: Added support for a specialized "I" code triggering a unique Indigo badge indicating that replenishment is currently "In-Flight."
- **Inventory Lifecycle Tracking**: Upgraded import engines to parse replenishment status. Maps `y` to "Yes", `i` to "I", and blank cells to "No".
- **Inventory Lifecycle Tracking**: Integrated high-contrast status badges (Green, Red, Indigo) into the Inventory Table and Item List overview.
- **Interactive "Fat-Finger" Accessibility**: Transformed every data row into a high-precision interactive surface for ease of mobile use.
- **Interactive "Fat-Finger" Accessibility**: Implemented a "Select All" toggle directly into the header row for bulk operations.
- **Interactive "Fat-Finger" Accessibility**: Increased vertical padding and hover feedback across all table views while maintaining visual balance.
- **Intelligent Dashboard Filtering & AI**: Refined "Predictive Replenish" logic blocks to automatically suppress alerts for items marked as "Restocked" or "In-Process."
- **Intelligent Dashboard Filtering & AI**: Upgraded InnoAssistant (AI) cognitive processing to exclude restocked or in-transit items when generating suggestions.
- **Intelligent Dashboard Filtering & AI**: Restored the `getDbError` handler for graceful reporting of database connectivity issues.
### Version 0.11.0 (March 24, 2026)
- **Security & System Resilience**: Replaced standard browser alerts with a custom, branded confirmation dialog across both Login and Settings screens.
- **Security & System Resilience**: Introduced a mandatory security warning regarding Firebase's 10-email-per-day quota limit and spam folder checks.
- **Security & System Resilience**: Standardized the system to ensure the "Global Stock Threshold" is disabled by default for all accounts.
- **Rebranding & Identity**: Renamed all instances of "The Oracle" and "Oracle Forecast" to "Predictive Replenish" for branding alignment.
- **Rebranding & Identity**: Finalized the rebranding of "AuraAI" to "InnoAssistant" across all neural processing and UI component layers.
- **Rebranding & Identity**: Updated project documentation and historical logs to align with the new nomenclature.

### Version 0.11.1 (March 24, 2026)
- **Dynamic Branding & Identity**: Globally standardized system naming to fall back to "System" instead of "CloudBased" for white-label reliability.
- **Dynamic Branding & Identity**: Fully integrated the administrator-defined Company Logo and Name into the Login, Loading, and Header screens.
- **Dynamic Branding & Identity**: Preserved "CloudBased IMS" branding exclusively within the User Settings "About" section as a historical reference.
- **InnoAssistant V2 (Neural Upgrade)**: Massively expanded the natural language synonym library, supporting dozens of new phrasing variations for arrivals, shipments, and queries.
- **InnoAssistant V2 (Neural Upgrade)**: Implemented Context-Aware Error Reporting with specific suggestions based on missing item quantities or unidentified SKUs.
- **InnoAssistant V2 (Neural Upgrade)**: Added Intelligent Property Queries allowing users to ask about item locations, categories, stock levels, and transaction history.
- **InnoAssistant V2 (Neural Upgrade)**: Integrated Smart Date Recognition for "Today" and "Yesterday" keywords in logging commands.
- **UI/UX Generalization**: Replaced hardcoded placeholder examples (e.g., specific names/emails) with generic professional labels across all management prompts.

### Version 0.11.2 (March 24, 2026)
- **AI Transaction Engine (Major Fix)**: Resolved a critical communication bug where background AI commits would fail. "Execute Commit" now properly updates your inventory and logs.
- **Natural Language Undo/Reverse**: Added support for correctional phrases like "reverse that", "mistake", or "wrong entry." The assistant instantly triggers a full database-wide revert of the last action.
- **Executive Intelligence Dashboard**: Promoted "Critical Replenishment" to the primary Overview tab. The alert logic is now synchronized with global MSL thresholds and account-level overrides.
- **Administrative Settings Polish**: Corrected confusing "Beta" labels in Global Settings to accurately reflect standard module features.

### Version 0.11.3 (March 24, 2026)
- **Admin Activity Logs (Persistent Collection)**: Launched a dedicated activity logging system stored in Firestore that tracks all administrative and user-driven changes across the platform beyond basic transactions.
- **CSV Data Export (Activity Logs)**: Integrated a dynamic CSV export tool for activity logs, supporting filtered data views and proper field escaping for professional spreadsheet compatibility.
- **Actor Branding & Normalization**: Standardized the default system actor name to "System" instead of "System Import" across all automated transaction and sync logs for a cleaner, prioritized audit trail.
- **Multi-User Identity Tracking**: Implemented granular session and profile event logging, including manual logins, account signups, password resets, and profile-specific administrative events.
- **Security & Auditor Enforcement**: Hardened the internal permission layer to ensure that all restricted Auditor actions are blocked and omitted from the log history, preventing unauthorized clutter.
- **Administrative Maintenance**: Added a "Clear Activity Logs" utility for administrators to reset purely administrative history while preserving the core business transaction records.

### Version 0.11.4 (March 25, 2026)
- **Security & Access Control**: Disabled public user registration (Self-Signup) to preserve the integrity of the private database.
- **Auditor Permission Defaulting**: Hardened the default security posture for new Auditors. All administrative restrictions are now enabled by default upon account creation or role assignment.
- **Session & Migration Logic**: Enhanced the session initializer to automatically apply the full restriction set to existing Auditors without explicitly defined permissions.
- **Admin Dashboard Improvements**: Synchronized the User Management interface to automatically reflect the new high-security defaults for the Auditor role.
- **System Maintenance**: Updated the platform to Version 0.11.4.