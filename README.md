# CloudBased

<img width="500" height="500" alt="Icon" src="https://github.com/user-attachments/assets/84590985-5680-4524-b453-09125d283b1d" />

## Overview

CloudBased is a cloud-based Inventory Management System (IMS) designed to solve the operational inefficiencies faced by SME's that manage inventory, shipments, and arrivals across multiple, disconnected Google Sheets due to having multiple warehouses. Procurement of missing raw ingredients is handled through a fragmented process where staff must cross-reference inventory with a separate, often incomplete Excel supplier list. This project centralizes multisite inventory tracking and vendor details into a robust platform, solving data fragmentation. Developed following the Agile Software Development Life Cycle (SDLC), the solution evolved from gathering these specific user pain points to systematically designing, implementing, and testing a centralized web application.

> **Version:** 0.16.4 (April 28, 2026)  
> **Status:** Production Ready (Local-Only)  
> **GitHub Repository:** https://github.com/jchengroa/CloudBased

---

## How to Run

### Option 1: Quick Start (Live Demo)

The application is deployed and can be accessed directly through the web browser at:
**TBA**

### Option 2: Local Development

Follow these detailed steps to set up and run the CloudBased IMS Source Code locally. This version is fully standalone and does not require an active database connection:

#### 1. Prerequisites
- **Visual Studio Code (VS Code)** installed on your machine.
- A modern web browser (Google Chrome, Microsoft Edge, or Firefox).

#### 2. Install the Live Server Extension
- Open VS Code.
- Go to the **Extensions** view by clicking the square icon on the left sidebar (or press `Ctrl+Shift+X`).
- Search for **"Live Server"** by Ritwick Dey.
- Click **Install**.

#### 3. Open the Project
- Select **File > Open Folder...** and choose the `term-end-project-cloudbased` directory.

#### 4. Launch the Application
- In the VS Code Explorer, navigate to the `src/` folder.
- Locate `index.html` (the customer landing page).
- Start the server using one of these methods:
  - **Context Menu**: Right-click on `index.html` and select **Open with Live Server**.
  - **Status Bar**: Click the **Go Live** button at the bottom right of the VS Code window.
  - **Keyboard Shortcut**: Press `Alt+L, Alt+O` (sequentially).

#### 5. Accessing the App
- Your browser will automatically open to `http://127.0.0.1:5500/index.html`.
- Login to the app using the following credentials:
  - Username: 'default'
  - Password: 'cb_demo_2026'
- **Note**: This is a local-only build. All data is stored in your browser's local storage.

---

## 🔐 Default Credentials (Hardcoded)

No signup needed! Use these credentials for immediate access:

- **Username:** `default`
- **Password:** `cb_demo_2026`

**User Profile:**
- **Role:** Administrator
- **Permissions:** Full access to all modules
- **Restrictions:** None (all features enabled)
- **Mode:** Guest Mode (changes are temporary)
- **Note:** All changes are temporary (lost on logout)

### 📝 Using Guest Mode

**When logged in as `default`:**
- You can view and edit all data
- Changes are saved to `localStorage` during your session
- **IMPORTANT:** When you log out or close the browser, all changes will be lost (data resets to default)

**To make changes permanent:**
1. Create a new user account
2. Log in as the new user
3. Make your changes

---

## 🚀 Key Features

### 📦 Inventory Management
- Multi-warehouse support (WH-01 to WH-10)
- Detailed item properties (name, barcode, description, etc.)
- Real-time stock quantity tracking
- Low stock alerts with customizable thresholds
- Search & filter capabilities

### 📊 Activity Logging
- Automatic logging of:
  - Items created, updated, deleted
  - Logs created, updated, deleted
  - Users created, updated, deleted
  - Suppliers created, updated, deleted
- Comprehensive audit trail with timestamps
- User-friendly activity stream

### 🤝 User Management
- Role-based access control (RBAC)
- Predefined roles:
  - Administrator (full access)
  - Warehouse Staff (restricted)
- Custom restrictions per user
- User profile management
- Password change functionality
- Role-based navigation visibility

### 🔐 Security
- Secure session management
- Password-protected user accounts
- Role-based restriction enforcement
- No remote data storage (privacy-focused)

### 🛠️ System Utilities
- Barcode scanning support
- Print barcode labels
- Export/Import data to JSON
- Data backup & restore
- Theme customization (light/dark mode)
- System monitoring

### 📱 Responsive Design
- Fully responsive UI for desktop, tablet, and mobile
- Adaptive navigation menus
- Touch-friendly controls
- Real-time layout adjustments

---

## 📂 Project Structure

```
CloudBased/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── views/          # Page components
│   │   ├── common/         # Shared UI elements
│   │   └── controls/       # Interactive controls
│   ├── data-management/  # Core data modules
│   │   ├── coreDataHandler.js  # Main data manager
│   │   ├── inventoryHandler.js # Inventory operations
│   │   ├── logManager.js       # Log management
│   │   ├── partnerManager.js   # Partner/Supplier management
│   │   └── authDataManager.js  # User authentication
│   ├── services/           # System services
│   │   ├── syncEngine.js     # Data synchronization
│   │   └── cacheManager.js   # Local caching
│   ├── utils/              # Utility functions
│   │   ├── barcodeGenerator.js # Barcode generation
│   │   ├── errorHandler.js     # Error handling
│   │   └── helperFunctions.js  # General utilities
│   ├── App.js              # Main application component
│   └── main.js             # Application entry point
├── public/                 # Static assets
│   └── assets/
│       ├── fonts/          # Font files
│       ├── icons/          # Icon files
│       ├── logos/          # Logo files
│       └── data/           # Data files
├── vendor/                 # External libraries
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── README.md               # Project documentation
└── changelog.txt           # Version history
```

---

### Core Modules

#### `src/data-management/`
- **`coreDataHandler.js`** - Main data manager with:
  - Persistent browser caching
  - Last-updated tracking
  - Event notification system
  - Session management

- **`inventoryHandler.js`** - Inventory management operations:
  - CRUD operations for items
  - Multi-warehouse support
  - Stock level management
  - Barcode generation
  - Low stock alerts

- **`logManager.js`** - Activity logging:
  - Create, update, delete operations
  - Automatic audit trail
  - Log retrieval and filtering

- **`partnerManager.js`** - Supplier/Partner management:
  - Partner/Supplier CRUD
  - Contact information
  - Relationship management

- **`authDataManager.js`** - Authentication:
  - Hardcoded demo credentials
  - Role management
  - User profile management
  - Restriction management
  - Guest mode support

---
