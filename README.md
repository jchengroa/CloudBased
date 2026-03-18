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
