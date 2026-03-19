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
