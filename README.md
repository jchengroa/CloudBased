# CloudBased
The Cloud-Based Multi-Warehouse Inventory Management System. 

This is the academic version, to fulfill subject requirements!

<img width="500" height="500" alt="Icon" src="https://github.com/user-attachments/assets/b0adc3a9-9bbb-481f-84d7-96ddc4f67976" />

===============================================================

A SOFDESG and LBYCPD2 Project. Created by Cheng Roa and Tejada

===============================================================

Version 0.1 (March 18, 2026)

Project Architecture & Interface
- Created core project files (HTML, CSS, JS) and established the working interface.
- App.js: Built the main application files, implemented global state management, and created seamless tab navigation between app screens.
- UI/UX Styling: Fully modularized index.css using modern design principles, flexbox layouts, CSS variables, and clean interactive elements (hover states, custom UI buttons).

Components & Feature- InventoryTable.js: Implemented a dynamic interactive table displaying items and properties. Features include a management toolbar with Search/Add tools, individual/bulk row checkbox selection, and responsive state changes.
- SupplierTable.js: Replicated and adapted core table functionalities to display suppliers and contact information, complete with unique column sizing and its own interactive toolbar.
- UserSettings.js: Implemented a dedicated Settings dashboard populated with system configurations, featuring a working application-wide Light/Dark Mode theme switcher.

===============================================================

Version 0.2 (March 18, 2026)

Project Architecture & Interface
- Re-architected project tree: separated logic files into /App Logic/ folder and CSS into /Resources/ for modular cleanliness.
- Implemented real-time dynamic search bars across both Inventory and Supplier tables, filtering across multiple columns simultaneously on every keystroke.
- Added smart visual safety-locks preventing erroneous multiple "Edits" when checking off bulk items.
- Upgraded entire table rows to be seamlessly clickable instead of targeting just the checkbox.

Components & Features
- Prompt.js: Developed a reusable, animated floating modal overlay (pop-up box). It elegantly dims the main background to safely handle all specific interaction forms (e.g., Add Item, Edit Supplier) anywhere in the application.
- Prompt Modals: Fully implemented detailed Add/Edit mock forms matching Figma layout, equipped with native dropdowns and linked dynamically to global supplier data.
- UserSettings.js: Added "Global Stock Threshold" module (with Enable/Disable disable logic), providing real-time bounding limit validation for computing inventory statuses dynamically across the app.
- Supplier Details: Added a dedicated "Supplier Details" contact card view in the Prompt overlay, dynamically opened directly by clicking on any linked supplier name in the Inventory Table.

===============================================================

Version 0.2.1 (March 18, 2026)

Git & Project Configuration
- Removed spaces from `App Logic` folder (`AppLogic`) and updated paths in `index.html` to prevent URL encoding issues and cross-platform sync problems with Git and GitHub Pages.
- Added `.gitignore` to safely prevent OS-level items like `.DS_Store` and generic config files from polluting the master branch.
- Added `.gitattributes` to explicitly force LF line endings (`text=auto`) to avoid painful `CRLF` versus `LF` conversion issues on Windows when cloning or pushing.

Mobile UI Fix 
- UserSettings.js: Refactored hardcoded inline styles into dynamic CSS classes (`setting-item-inner`, `threshold-controls`) to allow for seamless mobile responsiveness.

===============================================================

Version 0.2.2 (March 18, 2026)

Mobile & Desktop UI Polish
- UserSettings.js: Refactored hardcoded inline styles into dynamic CSS classes to allow for seamless mobile responsiveness, while correctly restoring desktop-only flex gaps for the bounding threshold controls.
- index.css: Added comprehensive `@media` queries for mobile screens (`max-width: 768px`).

Header & Navigation Restructure
- Favicon: Registered project branding `icon.png` as the official website favicon.
- Topmost Brand Bar: Created a new absolute top-level edge-to-edge header matching the table highlight colors. Moved the "CloudBased" Logo, system tabs ("Inventory", "Suppliers"), and the User Avatar into this unified bar.
- User Profile: Stripped redundant "Administrator" labels to clean up the profile dropdown layout.

New Features & Functionality
- Warehouse Filter Bar: Repurposed the previous sub-navigation space into a horizontal scrollable filter bar. Automatically computes unique Warehouses and renders them as clickable "pill" cards that actively pre-filter the Inventory table data.
- Table "Select All" Headers: Upgraded the main column definition row (`header-row`) in both the Inventory and Supplier tables so that clicking anywhere on the header dynamically selects or deselects all visible items instantly.

===============================================================

Version 0.3 (March 18, 2026)
 
Data Persistence & Creation of Backend System
- AppDataHandler.js: Implemented a robust data loading system that prioritizes: Session Cache (localStorage) -> Modified Files (settings.json, uoms.json) -> Constant Defaults (defaultsettings.json, defaultuoms.json).
- Default Logic: Added support for `defaultsettings.json` and `defaultuoms.json` as permanent constant fallbacks for initial application startup.
- Temporary Files: Created `settings.json` and `uoms.json` to store user-defined overrides, ensuring defaults remain untouched.
- Local Persistence: Configured the application to automatically record all modifications into temporary browser storage, providing a seamless bridge until a cloud database is established.

App Logic & CRUD Operations
- Inventory Management: Fully implemented Create, Read, Update, and Delete (CRUD) operations for the Inventory table.
- Supplier Management: Fully implemented Create, Read, Update, and Delete (CRUD) operations for the Supplier table.
- Prompt.js: Transformed the static Prompt modal into a dynamic, state-driven form handler with controlled inputs and intelligent pre-filling for edit operations.
- UI Polish: Removed all development console logs and mockup simulation notes to provide a cleaner, production-ready user experience.
- Selection Logic: Added automatic selection clearing across tables whenever data is modified, ensuring a seamless and error-free bulk action workflow.
- UX Stability: Fixed React ReferenceErrors (useState/useEffect) caused by script-based Babel scoping.
- Field Editing: Updated Quantity and Min Level fields to support empty inputs, allowing for easier clearing and precise data entry.
- Supplier Assignment Fix: Added a dynamic placeholder and improved selection logic to ensure correct mapping of suppliers to inventory items, even when added after the item.
- Visual Clarity: Updated the Inventory Table to display "N/A" for empty supplier fields, ensuring clear visibility of data gaps.

===============================================================

Version 0.4 (March 19, 2026)

Cloud Database Integration (Firebase Firestore)
- Integrated Google Firebase Firestore as the cloud database backend. All inventory, supplier, UOM, and warehouse data is now stored in and retrieved from Firestore, making it accessible across all devices and browsers.
- index.html: Added Firebase App and Firestore compat SDK scripts (loaded via CDN, no bundler required).
- AppDataHandler.js: Fully rewrote all fetch and save methods to communicate with Firestore. Settings remain in localStorage as they are device-specific user preferences.
- Data split: Firestore handles shared application data (inventory, suppliers, UOMs, warehouses); localStorage handles personal settings (theme, threshold) and the Firebase config override.
- Seeding Logic: On first load, if a Firestore collection (UOMs, warehouses) has no document, the app automatically seeds it from the corresponding default JSON file and writes it to Firestore, so all future reads come from the database.

AppDataHandler Architecture Overhaul
- AppDataHandler.js: Refactored the data loading system so that `defaultsettings.json` is the authoritative source of startup defaults, with localStorage as the primary store for user-modified preferences. Removed `settings.json` from the priority chain entirely.
- Removed redundant save-file stubs (`inventory.json`, `suppliers.json`, `uoms.json`, `settings.json`) that were unused now that localStorage handles all runtime storage.
- Renamed `warehouses.json` to `defaultwarehouses.json`, aligning it with the established `default*.json` naming convention for constant fallback files.
- Replaced the old `fetchData`/`saveData` generic helpers with explicit, self-documenting methods per data type. Each method is now transparent about exactly what it reads and writes.
- Added `clearAllData()` utility method that removes all app-scoped localStorage keys (prefixed `cloudbased_tmp_`) without affecting Firestore data or the Firebase config override.
- Added `getFirebaseConfig()` and `saveFirebaseConfig()` public methods, enabling the Settings UI to read and update the active Firebase project config at runtime.
- Firebase initialization now reads from a user-saved config in localStorage first, falling back to the hardcoded `DEFAULT_CONFIG`. This allows switching Firebase projects without modifying source code.

Settings Enhancements
- UserSettings.js: Added a "Units of Measure (UOM)" settings block allowing users to add or remove UOM entries. Changes are immediately persisted and reflected in the item form dropdowns.
- UserSettings.js: Added a "Reset App Data" settings block with a dedicated button that clears all localStorage entries scoped to this application and reloads the page, reverting to default values.
- UserSettings.js: Added a "Warehouses" settings block, mirroring the UOM settings block. Users can add or remove warehouse locations; changes are immediately saved to Firestore and reflected in the filter bar.
- UserSettings.js: Added a "Database Configuration" settings block displaying all active Firebase config fields (API Key, Project ID, etc.) as editable inputs. "Save & Reload" applies a new config; "Reset to Default" restores the hardcoded values.

Loading Screen Overhaul
- app.js: Replaced the inline loading placeholder (which rendered inside the full app shell) with an early return that shows a clean, bare full-screen loading view. The navigation bar and filter bar no longer appear while data is loading.
- index.html: Added a synchronous inline script in `<head>` that reads the saved theme from localStorage before React renders, eliminating the brief dark/light theme flash on initial page load.
- Loading text simplified to "Loading Resources" with no subtitle.

UI/UX Polish
- index.css: Fixed Settings tab overflow — content now scrolls within the bounding box instead of pushing beyond the viewport.
- index.css: Added `.setting-info` flex constraints to prevent long description text from crowding adjacent buttons in setting rows.

===============================================================

Version 0.4.1 (March 19, 2026)

UI/UX Polish
- index.css: Added scrolling to the prompts lmao. Added display 'flex' for auto stretch, and set 'overflow-y: auto' to automatically add a scrollbar once the prompt is taller than the viewport.

===============================================================

Version 0.4.2 (March 19, 2026)

Security & Authentication
- index.html: Added Firebase Authentication compat SDK to the project headers.
- AppDataHandler.js: Implemented automatic anonymous authentication (`signInAnonymously`). This provides a secure layer for Firestore, allowing the transition from open "Test Mode" rules to authenticated-only access (`if request.auth != null`).
- Security Patch: Addressed automated secret scanning alerts from GitHub and Google by securing the database logic against unauthorized external access.

===============================================================

Version 0.4.3 (March 19, 2026)

Security & Data Load Fixes
- AppDataHandler.js: Resolved a race condition where data fetches would fire before authentication was established. Implemented a global `authPromise` that all Firestore methods await to ensure database queries only execute once signed in.
- app.js: Wrapped the initial startup sequence in a `try...finally` block to prevent the application from hanging on the "Loading Resources" screen if a network error or authentication delay occurs.

===============================================================

Version 0.5 (March 19, 2026)

Inventory Transaction Logs
- Triple-View Switcher: Seamlessly toggle between Overview (Live Stock), Input Log (Incoming), and Output Log (Outgoing).
- Unified Table Architecture: All views share the same high-density interface with bulk selection, checkbox controls, and smart search.
- Bi-Directional Quantity Sync: Input logs automatically increase inventory (+), while output logs subtract (-), with robust decimal precision.
- Full History Editing: Edit or remove log entries with automatic quantity reversal.
- Location-Aware Logs: The Warehouse filter bar now dynamically filters logs based on the linked item's storage location.

Advanced Sorting System
- Intelligent Sort Button: A new interactive pill-button matching the search bar height.
- Custom Sort Logic: Alphabetical (A-Z/Z-A), Numerical (High/Low), and Time-based (Newest/Oldest) sorting across all tables.
- Smart Priority: "Status" sorting places Low Stock items at the top; Warehouse sorting allows prioritizing specific locations.
- Visual Feedback: The button highlights in accent color and displays the active sort choice for quick reference.

UI/UX Finalization
- "Save Changes" Standardization: Synchronized button styles across all administrative forms for a consistent premium feel.
- Status Badge Polish: Fixed badge wrapping to maintain a clean pill shape on mobile and high-density screens.
- Animated Dropdowns: Implemented smooth fade-in animations for the new sorting controls.

Codebase Architecture & Simplification
- Shared Components: Extracted the complex SortButton and ViewSwitcher into a generalized `AppLogic/Shared.js` utility module.
- InventoryTable Refactoring: Consolidated the duplicate 100+ line table template structures into a single unified render loop that switches row contents based on activeView.
- app.js Simplification: Rewrote the massive `if-else` cascade in `handlePromptConfirm` into a cleanly delineated `switch` statement for improved maintainability.

Comment Naturalization
- Removed overly robotic AI-generated block comments (`// =======================`, `// --- Local State ---`) across all major files (`UserSettings.js`, `Prompt.js`, `InventoryTable.js`, `SupplierTable.js`, `AppDataHandler.js`).
- Replaced rigid structural markers with concise, functional developer notes.

File System & Coding Style
- Unified all JavaScript filenames to `lowerCamelCase` style for project consistency.
- Renamed `Shared.js` to `sharedComponents.js` to more clearly describe its purpose.
- Updated `index.html` script references to match the new file structure.

===============================================================

Version 0.6 (March 19, 2026)

ERPNext Integration & Data Exporting
- ERPNext Export Tool: Developed a brand new `exportTool.js` module that generates CSV files pre-configured for ERPNext's multi-row import system.
- 4-Row Header Mapping: Implemented the mandatory ERPNext structure (Entry Type, Field Label, Field Name/Db Key, and Metadata) to ensure zero-config auto-mapping during imports.
- New Record Creation: Configured exports to leave the ID column blank by default, allowing ERPNext to automatically create new records rather than updating existing ones.
- Export Modules: Added support for "Item List" (formerly Item Master) and "Stock Reconciliation" (Current Inventory Levels) DocTypes.
- Precise Data Encoding: Utilized UTF-8 with BOM (Byte Order Mark) encoding to guarantee that high-precision quantity data and special characters are correctly displayed in Excel.
- Human Commenting: Refactored internal code documentation in the export tool to follow the project's natural, developer-centric commenting style.

Settings UI Enhancements
- Export Block: Integrated a new "Export to ERPNext" section into the User Settings dashboard, featuring one-click download buttons for inventory and stock data.
- User Context Support: Connected the export engine to the live application state, ensuring CSVs always reflect the most recent Firestore data.

===============================================================

Version 0.6.1 (March 20, 2026)

Database Configuration & Resilience
- Default Configuration: Separated the hardcoded Firebase configuration into a standalone `AppData/defaultDatabase.json` file. The application now dynamically loads these defaults, allowing for cleaner code and easier environment management.
- AppDataHandler Lifecycle: Refactored the initialization sequence to be fully asynchronous. It now automatically attempts to load configuration from: User Saved Settings (localStorage) -> Default Database File (defaultDatabase.json).
- Error Handling & Recovery: Implemented a robust "Database Not Found" state. If the configuration is missing, empty, or invalid, the Inventory and Supplier tables will now clearly display the specific reason for the failure (e.g., config fetch errors, Firebase init issues, or auth failures) instead of remaining blank or crashing.

Settings UI & Security Polish
- API Key Toggle: Added a "SHOW/HIDE" visibility toggle for the Firebase API Key in the Database Configuration block. The key is now masked by default to improve security during presentations or shared screen usage.
- Mobile Layout Fix: Resolved a layout bug in the Database Configuration module where long input fields would overflow the settings box on mobile screens. Labels and inputs now intelligently stack on narrower viewports.
- Settings Reorganization: Completely restructured the User Settings dashboard into logical, high-level categories (Appearance, Inventory Framework, Data & Connectivity, System Operations).
- Section Headers: Integrated a new `.settings-section-header` style featuring accent-colored text and divider lines for a more premium and organized user experience.
- User Avatar Dropdown: Replaced the direct settings shortcut with a sleek dropdown menu accessible from the user avatar. It currently provides links to "User Settings" and a "Database Help" documentation guide.
- Refined Animations: Implemented a smooth chevron rotation on the user avatar and upgraded the global `sortDropFadeIn` animation with a subtle scaling effect for a more polished UI.
- Versioning: Updated the internal version to 0.6.1 and refreshed the "Last Updated" metadata in the Settings dashboard.

===============================================================

Version 0.6.2 (March 23, 2026)

Data Integrity & Validation
- Robust Validation: Implemented duplicate entry guards for Item IDs, Supplier Name/IDs, and Transaction IDs within the Prompt modal to prevent database collisions.
- Error Feedback: Integrated a persistent error notification banner at the top of the Prompt overlay to provide real-time validation feedback during form submission.
- Supplier Management: Explicitly exposed the Supplier ID field in Add/Edit forms, enabling manual control over unique identifiers for contact records.

Component Bug Fixes & Refinements
- Prompt Initialization: Resolved a bug in the dynamic form handler where `edit-input-log` would incorrectly attempt to source data from the output log collection.
- Prompt.js: Developed a reusable, animated floating modal overlay (pop-up box). It elegantly dims the main background to safely handle all specific interaction forms (e.g., Add Item, Edit Supplier) anywhere in the application.
- Prompt Modals: Fully implemented detailed Add/Edit mock forms matching Figma layout, equipped with native dropdowns and linked dynamically to global supplier data.
- UserSettings.js: Added "Global Stock Threshold" module (with Enable/Disable disable logic), providing real-time bounding limit validation for computing inventory statuses dynamically across the app.
- Supplier Details: Added a dedicated "Supplier Details" contact card view in the Prompt overlay, dynamically opened directly by clicking on any linked supplier name in the Inventory Table.

===============================================================

Version 0.2.1 (March 18, 2026)

Git & Project Configuration
- Removed spaces from `App Logic` folder (`AppLogic`) and updated paths in `index.html` to prevent URL encoding issues and cross-platform sync problems with Git and GitHub Pages.
- Added `.gitignore` to safely prevent OS-level items like `.DS_Store` and generic config files from polluting the master branch.
- Added `.gitattributes` to explicitly force LF line endings (`text=auto`) to avoid painful `CRLF` versus `LF` conversion issues on Windows when cloning or pushing.

Mobile UI Fix
- UserSettings.js: Refactored hardcoded inline styles into dynamic CSS classes (`setting-item-inner`, `threshold-controls`) to allow for seamless mobile responsiveness.

===============================================================

Version 0.2.2 (March 18, 2026)

Mobile & Desktop UI Polish
- UserSettings.js: Refactored hardcoded inline styles into dynamic CSS classes to allow for seamless mobile responsiveness, while correctly restoring desktop-only flex gaps for the bounding threshold controls.
- index.css: Added comprehensive `@media` queries for mobile screens (`max-width: 768px`).

Header & Navigation Restructure
- Favicon: Registered project branding `icon.png` as the official website favicon.
- Topmost Brand Bar: Created a new absolute top-level edge-to-edge header matching the table highlight colors. Moved the "CloudBased" Logo, system tabs ("Inventory", "Suppliers"), and the User Avatar into this unified bar.
- User Profile: Stripped redundant "Administrator" labels to clean up the profile dropdown layout.

New Features & Functionality
- Warehouse Filter Bar: Repurposed the previous sub-navigation space into a horizontal scrollable filter bar. Automatically computes unique Warehouses and renders them as clickable "pill" cards that actively pre-filter the Inventory table data.
- Table "Select All" Headers: Upgraded the main column definition row (`header-row`) in both the Inventory and Supplier tables so that clicking anywhere on the header dynamically selects or deselects all visible items instantly.

===============================================================

Version 0.3 (March 18, 2026)

Data Persistence & Creation of Backend System
- AppDataHandler.js: Implemented a robust data loading system that prioritizes: Session Cache (localStorage) -> Modified Files (settings.json, uoms.json) -> Constant Defaults (defaultsettings.json, defaultuoms.json).
- Default Logic: Added support for `defaultsettings.json` and `defaultuoms.json` as permanent constant fallbacks for initial application startup.
- Temporary Files: Created `settings.json` and `uoms.json` to store user-defined overrides, ensuring defaults remain untouched.
- Local Persistence: Configured the application to automatically record all modifications into temporary browser storage, providing a seamless bridge until a cloud database is established.

App Logic & CRUD Operations
- Inventory Management: Fully implemented Create, Read, Update, and Delete (CRUD) operations for the Inventory table.
- Supplier Management: Fully implemented Create, Read, Update, and Delete (CRUD) operations for the Supplier table.
- Prompt.js: Transformed the static Prompt modal into a dynamic, state-driven form handler with controlled inputs and intelligent pre-filling for edit operations.
- UI Polish: Removed all development console logs and mockup simulation notes to provide a cleaner, production-ready user experience.
- Selection Logic: Added automatic selection clearing across tables whenever data is modified, ensuring a seamless and error-free bulk action workflow.
- UX Stability: Fixed React ReferenceErrors (useState/useEffect) caused by script-based Babel scoping.
- Field Editing: Updated Quantity and Min Level fields to support empty inputs, allowing for easier clearing and precise data entry.
- Supplier Assignment Fix: Added a dynamic placeholder and improved selection logic to ensure correct mapping of suppliers to inventory items, even when added after the item.
- Visual Clarity: Updated the Inventory Table to display "N/A" for empty supplier fields, ensuring clear visibility of data gaps.

===============================================================

Version 0.4 (March 19, 2026)

Cloud Database Integration (Firebase Firestore)
- Integrated Google Firebase Firestore as the cloud database backend. All inventory, supplier, UOM, and warehouse data is now stored in and retrieved from Firestore, making it accessible across all devices and browsers.
- index.html: Added Firebase App and Firestore compat SDK scripts (loaded via CDN, no bundler required).
- AppDataHandler.js: Fully rewrote all fetch and save methods to communicate with Firestore. Settings remain in localStorage as they are device-specific user preferences.
- Data split: Firestore handles shared application data (inventory, suppliers, UOMs, warehouses); localStorage handles personal settings (theme, threshold) and the Firebase config override.
- Seeding Logic: On first load, if a Firestore collection (UOMs, warehouses) has no document, the app automatically seeds it from the corresponding default JSON file and writes it to Firestore, so all future reads come from the database.

AppDataHandler Architecture Overhaul
- AppDataHandler.js: Refactored the data loading system so that `defaultsettings.json` is the authoritative source of startup defaults, with localStorage as the primary store for user-modified preferences. Removed `settings.json` from the priority chain entirely.
- Removed redundant save-file stubs (`inventory.json`, `suppliers.json`, `uoms.json`, `settings.json`) that were unused now that localStorage handles all runtime storage.
- Renamed `warehouses.json` to `defaultwarehouses.json`, aligning it with the established `default*.json` naming convention for constant fallback files.
- Replaced the old `fetchData`/`saveData` generic helpers with explicit, self-documenting methods per data type. Each method is now transparent about exactly what it reads and writes.
- Added `clearAllData()` utility method that removes all app-scoped localStorage keys (prefixed `cloudbased_tmp_`) without affecting Firestore data or the Firebase config override.
- Added `getFirebaseConfig()` and `saveFirebaseConfig()` public methods, enabling the Settings UI to read and update the active Firebase project config at runtime.
- Firebase initialization now reads from a user-saved config in localStorage first, falling back to the hardcoded `DEFAULT_CONFIG`. This allows switching Firebase projects without modifying source code.

Settings Enhancements
- UserSettings.js: Added a "Units of Measure (UOM)" settings block allowing users to add or remove UOM entries. Changes are immediately persisted and reflected in the item form dropdowns.
- UserSettings.js: Added a "Reset App Data" settings block with a dedicated button that clears all localStorage entries scoped to this application and reloads the page, reverting to default values.
- UserSettings.js: Added a "Warehouses" settings block, mirroring the UOM settings block. Users can add or remove warehouse locations; changes are immediately saved to Firestore and reflected in the filter bar.
- UserSettings.js: Added a "Database Configuration" settings block displaying all active Firebase config fields (API Key, Project ID, etc.) as editable inputs. "Save & Reload" applies a new config; "Reset to Default" restores the hardcoded values.

Loading Screen Overhaul
- app.js: Replaced the inline loading placeholder (which rendered inside the full app shell) with an early return that shows a clean, bare full-screen loading view. The navigation bar and filter bar no longer appear while data is loading.
- index.html: Added a synchronous inline script in `<head>` that reads the saved theme from localStorage before React renders, eliminating the brief dark/light theme flash on initial page load.
- Loading text simplified to "Loading Resources" with no subtitle.

UI/UX Polish
- index.css: Fixed Settings tab overflow — content now scrolls within the bounding box instead of pushing beyond the viewport.
- index.css: Added `.setting-info` flex constraints to prevent long description text from crowding adjacent buttons in setting rows.

===============================================================

Version 0.4.1 (March 19, 2026)

UI/UX Polish
- index.css: Added scrolling to the prompts lmao. Added display 'flex' for auto stretch, and set 'overflow-y: auto' to automatically add a scrollbar once the prompt is taller than the viewport.

===============================================================

Version 0.4.2 (March 19, 2026)

Security & Authentication
- index.html: Added Firebase Authentication compat SDK to the project headers.
- AppDataHandler.js: Implemented automatic anonymous authentication (`signInAnonymously`). This provides a secure layer for Firestore, allowing the transition from open "Test Mode" rules to authenticated-only access (`if request.auth != null`).
- Security Patch: Addressed automated secret scanning alerts from GitHub and Google by securing the database logic against unauthorized external access.

===============================================================

Version 0.4.3 (March 19, 2026)

Security & Data Load Fixes
- AppDataHandler.js: Resolved a race condition where data fetches would fire before authentication was established. Implemented a global `authPromise` that all Firestore methods await to ensure database queries only execute once signed in.
- app.js: Wrapped the initial startup sequence in a `try...finally` block to prevent the application from hanging on the "Loading Resources" screen if a network error or authentication delay occurs.

===============================================================

Version 0.5 (March 19, 2026)

Inventory Transaction Logs
- Triple-View Switcher: Seamlessly toggle between Overview (Live Stock), Input Log (Incoming), and Output Log (Outgoing).
- Unified Table Architecture: All views share the same high-density interface with bulk selection, checkbox controls, and smart search.
- Bi-Directional Quantity Sync: Input logs automatically increase inventory (+), while output logs subtract (-), with robust decimal precision.
- Full History Editing: Edit or remove log entries with automatic quantity reversal.
- Location-Aware Logs: The Warehouse filter bar now dynamically filters logs based on the linked item's storage location.

Advanced Sorting System
- Intelligent Sort Button: A new interactive pill-button matching the search bar height.
- Custom Sort Logic: Alphabetical (A-Z/Z-A), Numerical (High/Low), and Time-based (Newest/Oldest) sorting across all tables.
- Smart Priority: "Status" sorting places Low Stock items at the top; Warehouse sorting allows prioritizing specific locations.
- Visual Feedback: The button highlights in accent color and displays the active sort choice for quick reference.

UI/UX Finalization
- "Save Changes" Standardization: Synchronized button styles across all administrative forms for a consistent premium feel.
- Status Badge Polish: Fixed badge wrapping to maintain a clean pill shape on mobile and high-density screens.
- Animated Dropdowns: Implemented smooth fade-in animations for the new sorting controls.

Codebase Architecture & Simplification
- Shared Components: Extracted the complex SortButton and ViewSwitcher into a generalized `AppLogic/Shared.js` utility module.
- InventoryTable Refactoring: Consolidated the duplicate 100+ line table template structures into a single unified render loop that switches row contents based on activeView.
- app.js Simplification: Rewrote the massive `if-else` cascade in `handlePromptConfirm` into a cleanly delineated `switch` statement for improved maintainability.

Comment Naturalization
- Removed overly robotic AI-generated block comments (`// =======================`, `// --- Local State ---`) across all major files (`UserSettings.js`, `Prompt.js`, `InventoryTable.js`, `SupplierTable.js`, `AppDataHandler.js`).
- Replaced rigid structural markers with concise, functional developer notes.

File System & Coding Style
- Unified all JavaScript filenames to `lowerCamelCase` style for project consistency.
- Renamed `Shared.js` to `sharedComponents.js` to more clearly describe its purpose.
- Updated `index.html` script references to match the new file structure.

===============================================================

Version 0.6 (March 19, 2026)

ERPNext Integration & Data Exporting
- ERPNext Export Tool: Developed a brand new `exportTool.js` module that generates CSV files pre-configured for ERPNext's multi-row import system.
- 4-Row Header Mapping: Implemented the mandatory ERPNext structure (Entry Type, Field Label, Field Name/Db Key, and Metadata) to ensure zero-config auto-mapping during imports.
- New Record Creation: Configured exports to leave the ID column blank by default, allowing ERPNext to automatically create new records rather than updating existing ones.
- Export Modules: Added support for "Item List" (formerly Item Master) and "Stock Reconciliation" (Current Inventory Levels) DocTypes.
- Precise Data Encoding: Utilized UTF-8 with BOM (Byte Order Mark) encoding to guarantee that high-precision quantity data and special characters are correctly displayed in Excel.
- Human Commenting: Refactored internal code documentation in the export tool to follow the project's natural, developer-centric commenting style.

Settings UI Enhancements
- Export Block: Integrated a new "Export to ERPNext" section into the User Settings dashboard, featuring one-click download buttons for inventory and stock data.
- User Context Support: Connected the export engine to the live application state, ensuring CSVs always reflect the most recent Firestore data.

===============================================================

Version 0.6.1 (March 20, 2026)

Database Configuration & Resilience
- Default Configuration: Separated the hardcoded Firebase configuration into a standalone `AppData/defaultDatabase.json` file. The application now dynamically loads these defaults, allowing for cleaner code and easier environment management.
- AppDataHandler Lifecycle: Refactored the initialization sequence to be fully asynchronous. It now automatically attempts to load configuration from: User Saved Settings (localStorage) -> Default Database File (defaultDatabase.json).
- Error Handling & Recovery: Implemented a robust "Database Not Found" state. If the configuration is missing, empty, or invalid, the Inventory and Supplier tables will now clearly display the specific reason for the failure (e.g., config fetch errors, Firebase init issues, or auth failures) instead of remaining blank or crashing.

Settings UI & Security Polish
- API Key Toggle: Added a "SHOW/HIDE" visibility toggle for the Firebase API Key in the Database Configuration block. The key is now masked by default to improve security during presentations or shared screen usage.
- Mobile Layout Fix: Resolved a layout bug in the Database Configuration module where long input fields would overflow the settings box on mobile screens. Labels and inputs now intelligently stack on narrower viewports.
- Settings Reorganization: Completely restructured the User Settings dashboard into logical, high-level categories (Appearance, Inventory Framework, Data & Connectivity, System Operations).
- Section Headers: Integrated a new `.settings-section-header` style featuring accent-colored text and divider lines for a more premium and organized user experience.
- User Avatar Dropdown: Replaced the direct settings shortcut with a sleek dropdown menu accessible from the user avatar. It currently provides links to "User Settings" and a "Database Help" documentation guide.
- Refined Animations: Implemented a smooth chevron rotation on the user avatar and upgraded the global `sortDropFadeIn` animation with a subtle scaling effect for a more polished UI.
- Versioning: Updated the internal version to 0.6.1 and refreshed the "Last Updated" metadata in the Settings dashboard.

===============================================================

Version 0.6.2 (March 23, 2026)

Data Integrity & Validation
- Robust Validation: Implemented duplicate entry guards for Item IDs, Supplier Name/IDs, and Transaction IDs within the Prompt modal to prevent database collisions.
- Error Feedback: Integrated a persistent error notification banner at the top of the Prompt overlay to provide real-time validation feedback during form submission.
- Supplier Management: Explicitly exposed the Supplier ID field in Add/Edit forms, enabling manual control over unique identifiers for contact records.

Component Bug Fixes & Refinements
- Prompt Initialization: Resolved a bug in the dynamic form handler where `edit-input-log` would incorrectly attempt to source data from the output log collection.
- Logic Coverage: Added missing initialization support for `edit-output-log` to ensure consistent CRUD behavior across all transaction types.
- Field Resetting: Configured the validation error state to automatically clear upon form re-opening or whenever any input field is edited, improving UI fluidity.

===============================================================

Version 0.7.0 (March 23, 2026)

Authentication & Access Control
- **Dedicated Login Gateway**: Launched `login.html`, a high-security entry point that cleanly separates the authentication flow from the main workspace.
- **Modern Auth UI**: Developed an elegant, high-contrast Login/Signup interface with real-time field validation and secure credential handling.
- **Multi-User Identity**: Implemented a robust profile system supporting unique display names and custom bio pictures per user.
- **Persistent Session Management**: Engineered secure redirects to ensure logged-out users are properly gated.

Redesigned User Settings Dashboard
- **Category-First Layout**: Completely rebuilt the settings menu to follow a modern modular layout (User Profile, System Operations, Version Info).
- **Profile Management**: Added "Edit Profile" capabilities including one-click username updates and bio-picture clearing.
- **Credits & Origin**: Implemented the official "Who Made This" section featuring Group 5 branding and the project's iconic heart-themed resources.
- **Version Tracking**: Formalized the application's build info (v0.7.0, March 23, 2026) within the system dashboard.

Core Architecture & Shared Logic
- **Component Abstraction**: Performed a massive refactoring of redundant buttons, inputs, headers, and UI controls into `AppLogic/sharedComponents.js`, significantly improving codebase maintainability.
- **Multi-Purpose Form Components**: Standardized `FormInput`, `FormSelect`, and `FormButtons` across all administrative prompts for pixel-perfect consistency.
- **Unified Media Engine**: Developed a shared client-side image resizing utility that optimizes all incoming assets on-the-fly to ensure lightning-fast database performance.

Advanced Navigation & Filtering
- **Dynamic Pill-Style Interface**: Converted the entire application navigation (Main Tabs, View Switchers, and Location Filters) into a consistent, premium pill-tab design.
- **True Multi-Warehouse Filtering**: Extended location pills to Arrivals, Shipments, and Suppliers. Logs now use "V-Lookup" logic to derive locations from inventory masters, while Suppliers are intelligently filtered based on their site-specific item associations.

Snappier UI & Refined Interaction
- **Snap-to-View Transitions**: Eliminated aggressive 'pop-up' and movement animations. All components now appear instantly or via subtle, business-grade opacity fades.
- **Catalog Interactivity**: Transformed Item List cards into fully clickable surfaces, allowing for instant 'tap-to-edit' inventory management.
- **Remove Image Logic**: Integrated "Remove Photo" buttons across both Profile and Item forms to allow for instant asset resetting.
- **Critical Logic Fixes**: Corrected permanent data deletion logic and resolved a validation loop that blocked legitimate record removals.

===============================================================

### Version 0.7.1 (March 23, 2026)

#### Executive Insights & Dashboard Logic
- **Integrated Analytical Dashboard**: Launched a high-level executive dashboard featuring real-time data visualization across 8 specialized logic blocks.
- **Smart KPI Cards**: Created dedicated modules for "Total Items", "Low Stock", and "Suppliers Only" for instant operational visibility.
- **Inventory Velocity**: Implemented side-by-side specialized tables for "Recent Arrivals" and "Recent Shipments" with automated record fetching.
- **Risk Mitigation**: Added a "Critical Replenishment Required" module that automatically flags items below safety stock levels.
- **Geographic & Category Distribution**: Developed "Warehouse Distribution" and "Category Performance" modules to visualize stock concentration and product variety.

#### Security & Authentication Refinement
- **Enhanced Password Recovery**: Integrated a "Forgot Password" flow directly into the login portal and cross-linked it within the User Settings "Change Password" section.
- **Manual Credential Updates**: Added a high-security manual password change view to the login gateway, allowing users to update credentials securely using current password verification.
- **Navigation Fluidity**: Added "Back to Sign in" buttons and improved secondary navigation layout, increasing vertical spacing for a more modern, centered UI aesthetic.
- **Logic Patch**: Resolved a Babel transpilation race condition in `login.html` that caused intermittent blank screens on initialization.

#### Catalog & Property Enhancements
- **Product Descriptions**: Expanded the Item Master schema to include a dedicated "Item Description" field.
- **Metadata Visibility**: Updated Item List cards to display product descriptions, improving detail visibility without requiring a click.
- **Prompt Integration**: Added a smart-resized description textarea to the Inventory Add/Edit modal.
- **Data Management Cleanup**: Temporarily retired the "Import Inventory Data" stub from User Settings to streamline the interface for upcoming large-scale migration features.

