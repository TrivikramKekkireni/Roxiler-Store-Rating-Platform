# 🌟 Roxiler Systems - Store Rating & Management Platform

A modern, full-stack web application enabling users to browse stores, submit and modify 1-to-5 star ratings, and access dedicated role-specific portals for **System Administrators**, **Store Owners**, and **Normal Users** with Single Authentication & Role-Based Access Control (RBAC).

---

## 🚀 Technology Stack

- **Frontend:** React 18 / Vite, Tailwind CSS, Lucide React, Axios, React Router DOM (v6), Context API.
- **Backend:** Node.js, Express.js, Prisma ORM (v6), MySQL Database.
- **Security & Validation:** JSON Web Tokens (JWT), `bcryptjs` (salt rounds: 10), `express-validator`.

---

## 🔒 Validation Rules Enforced

| Field | Rule |
|---|---|
| **Name** | Minimum 20 characters, Maximum 60 characters |
| **Address** | Maximum 400 characters |
| **Password** | 8 to 16 characters, containing at least 1 uppercase letter (`A-Z`) and 1 special character (`!@#$%^&*`) |
| **Email** | Standard RFC 5322 email format |
| **Rating** | Integer between 1 and 5 ($1 \le \text{rating} \le 5$) |

---

## 👥 User Roles & Features

### 1. System Administrator (`ADMIN`)
- **KPI Analytics:** Total users, total stores, total ratings, and role composition.
- **User Management:** Filter, search (by Name, Email, Address, Role), sort users. View Store Owner average ratings. Create new Admin or Normal users.
- **Store Management:** Create new stores, assign store owners, view average ratings, sort and filter directory.

### 2. Normal User (`NORMAL_USER`)
- **Self Registration & Single Login:** Live client-side visual checks enforcing all validation rules.
- **Store Directory:** Search stores by Name and Address simultaneously with live filtering.
- **Store Rating:** Interactive 1-to-5 star rating component. Submit new ratings or modify existing ratings with instant recalculation of store averages.
- **Password Management:** Update account password securely.

### 3. Store Owner (`STORE_OWNER`)
- **Store Analytics:** View assigned store overview and real-time average star rating.
- **Rating Distribution:** Breakdown of customer reviews across 1 to 5 stars.
- **Customer Feedback History:** Tabular list of customers who submitted reviews with timestamped history.
- **Password Management:** Update password from user profile.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@roxiler.com` | `Admin@12345` |
| **Store Owner** | `michael@dundermifflin.com` | `Owner@12345` |
| **Store Owner** | `eleanor@stellarbooks.com` | `Owner@12345` |
| **Store Owner** | `marcus@gourmetbites.com` | `Owner@12345` |
| **Normal User** | `alice@roxiler.com` | `User@12345` |
| **Normal User** | `benjamin@roxiler.com` | `User@12345` |

*(Quick 1-Click login pills are also provided on the Login page for rapid testing)*

---

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```
Backend API will be available at: `http://localhost:5050`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will be available at: `http://localhost:5173`

### 3. Run Automated Tests
```bash
cd backend
npm test
node tests/e2e_live.test.js
```
