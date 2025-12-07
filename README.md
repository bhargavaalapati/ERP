# ERP - AI-Powered Construction & Finance System

A full-stack Enterprise Resource Planning (ERP) system designed for the Construction industry. This application unifies Project Management, Financial Accounting (General Ledger), Inventory, and Vendor Management into a single platform, featuring an **AI-driven Risk Analysis Engine**.

**Assignment Submission:** Mini ERP & Finance System with AI Insights

---

## 🚀 Tech Stack

### Frontend

- **Framework:** React.js (Vite)
- **UI Library:** Material UI (MUI)
- **State Management:** React Query (TanStack Query)
- **Visualization:** Recharts (Interactive Charts)
- **HTTP Client:** Axios
- **Routing:** React Router DOM (v6)

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **Security:** Bcrypt for password hashing

---

## 🌟 Key Features

### 1. Core ERP Module

- **Secure Authentication:** User Signup/Login with JWT and secure session management.
- **Role-Based Access Control (RBAC):** Distinct permissions for **Admin**, **Finance Manager**, and **Project Manager**.
- **System Administration:** Dedicated Admin panel to manage users and view **Audit Logs** (tracking critical system actions).

### 2. Construction Module

- **Project Management:** Track construction sites, budgets, timelines, and actual spend.
- **AI Risk Insights:** A logic-based AI engine that calculates a **Risk Score (0-100)** for every project based on budget overruns and schedule slippage.
- **Vendor Management:** database for Suppliers and Subcontractors.

### 3. Finance Module (General Ledger)

- **Double-Entry Accounting:** Full General Ledger with a **Chart of Accounts** (Assets, Liabilities, Equity, Revenue, Expenses).
- **Journal Entries:** Manual entry posting with automatic debit/credit validation.
- **Invoices (AP/AR):** \* **Payable:** Track expenses owed to Vendors.
  - **Receivable:** Track income from Clients.
- **Financial Dashboard:** Real-time visualization of Net Profit, Cash Flow, and Pending Invoices.

### 4. Inventory & Orders

- **Product Management:** Real-time stock tracking.
- **Order System:** Automated stock deduction upon order placement.

---

## 📸 Screenshots

### 1. Dashboard
*Real-time overview of KPIs, total products, orders, and low stock alerts.*
![Dashboard Screenshot](https://github.com/user-attachments/assets/b90f2ef2-9e31-4b53-a5a6-eea6563ae690)

<br>

### 2. AI Risk Analysis
*Predictive insights showing project risk scores based on budget and schedule data.*
![AI Risk Screenshot](https://github.com/user-attachments/assets/9aafa386-8401-46ea-8d38-884b7e455d61)

<br>

### 3. Inventory Management
*Track stock levels, prices, and categories in real-time.*
![Inventory Screenshot](https://github.com/user-attachments/assets/9b4073ba-0e23-431a-913e-dd759fa89b6c)

<br>

### 4. Financial Dashboard
*Visual breakdown of Income vs. Expenses and Project Budget performance.*
![Finance Screenshot](https://github.com/user-attachments/assets/e4608f40-9366-43ad-9f72-2e1af7c73e05)

<br>

---

## 🛠️ Setup & Installation Instructions

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL Database (or a free Supabase project)

### 1. Clone the Repository

```bash
git clone - https://github.com/bhargavaalapati/ERP
cd devopod-erp
```

### 2\. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

**Configuration:**
Create a `.env` file in the `backend` folder with your credentials:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
SECRET_KEY=your_secure_random_string_here
```

**Database Initialization:**
You can initialize the database tables by running the setup script provided in the codebase (if kept) or by running the SQL commands found in `database.sql` directly in your SQL editor.

Start the Server:

```bash
node index.js
```

_(Server will run on http://localhost:3000)_

### 3\. Frontend Setup

Open a new terminal window, navigate to the frontend folder, and install dependencies:

```bash
cd ../frontend
npm install
```

Start the React App:

```bash
npm run dev
```

_(App will run on http://localhost:5173)_

---

## 📂 Database Schema Overview

The system uses a relational PostgreSQL schema:

- **users:** Stores user credentials and `role` (Admin/Manager).
- **audit_logs:** Records system activities (Who did what and when).
- **projects:** Stores construction project details, budget, and AI metrics.
- **vendors:** Suppliers and subcontractors directory.
- **invoices:** Links Projects and Vendors for Accounts Payable/Receivable.
- **accounts:** Chart of Accounts for the General Ledger.
- **journal_entries / lines:** Stores double-entry bookkeeping records.
- **products / orders:** Inventory management tables.

---

## 🧪 AI Logic Explanation

The **Predictive Risk Score** is calculated in real-time (`/api/ai/risk/:id`) using the following logic:

1.  **Budget Health:** Checks if `actual_spend` exceeds `budget`.
2.  **Schedule Health:** Compares `completion_percentage` against the expected progress based on start/end dates.
3.  **Risk Output:** Returns a score (0-100) and a label (Low, Medium, Critical).

---

### Author

Developed by **[Alapati and Gemini AI Pro 3.5V]** for the Full Stack Developer Assignment.


