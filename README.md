# PSU Sales & Inventory Management System

**Palawan State University**  
**Advanced Database Systems - Final Project**

> A comprehensive sales and inventory management system built with Next.js, TypeScript, and Prisma.

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/sudo-marco-dev/psu-sales-inventory-system)
[![Status](https://img.shields.io/badge/status-production%20ready-success.svg)](https://github.com/sudo-marco-dev/psu-sales-inventory-system)
[![Requirements](https://img.shields.io/badge/requirements-100%25-brightgreen.svg)](https://github.com/sudo-marco-dev/psu-sales-inventory-system)

---

## ✨ Features

### ✅ 100% Functional Requirements Complete

#### 1. **Product & Inventory Management**
- ✅ CRUD operations for products
- ✅ Real-time stock level monitoring
- ✅ Automatic inventory adjustment
- ✅ **Low stock notifications on dashboard**
- ✅ Product categorization
- ✅ Search and filtering

#### 2. **Sales Transaction Processing**
- ✅ Point of Sale (POS) interface
- ✅ Shopping cart functionality
- ✅ Automatic calculation (subtotal, tax, total)
- ✅ **PDF receipt generation with payment method**
- ✅ **Multiple payment methods** (Cash, Card, GCash, PayMaya)
- ✅ Auto-print receipts
- ✅ Change calculation for cash payments

#### 3. **Purchase & Restocking**
- ✅ Purchase order creation
- ✅ Automatic stock updates
- ✅ Supplier integration
- ✅ Purchase history tracking

#### 4. **Supplier Management**
- ✅ Supplier database (CRUD)
- ✅ Contact information management
- ✅ **Transaction history per supplier** 🆕
- ✅ Purchase count tracking
- ✅ Total purchase amount per supplier

#### 5. **Reports & Analytics**
- ✅ Sales summaries (Daily/Weekly/Monthly)
- ✅ Inventory status reports
- ✅ Fast & slow-moving products
- ✅ Profit & Loss statements
- ✅ **Payment method analytics** 🆕
- ✅ **Export to PDF & Excel**

#### 6. **User Management**
- ✅ Role-based access control (Admin, Cashier, Inventory Clerk)
- ✅ **User CRUD interface** 🆕
- ✅ Password encryption (bcrypt)
- ✅ Activate/deactivate users
- ✅ Search users

#### 7. **Search & Filtering**
- ✅ Product search by name/code/category
- ✅ Sales search by receipt/cashier/payment method
- ✅ Report filtering by date/period
- ✅ Supplier search

#### 8. **Backup & Security**
- ✅ **Database backup & restore** 🆕
- ✅ bcrypt password hashing
- ✅ Role-based authorization
- ✅ SQL injection protection (Prisma)
- ✅ Secure session management

---

## 🆕 Latest Features (v1.2.0)

### 💳 Payment Method Tracking
- Select payment method at POS checkout
- Payment displayed on receipts
- Color-coded payment badges in sales history
- Payment method analytics in reports
- Search sales by payment method

### 👥 User Management Interface
- Complete admin dashboard for user management
- Create, edit, delete users
- Activate/deactivate accounts
- Role assignment and management
- Search and filter users

### 📊 Supplier Transaction History
- View all purchase orders per supplier
- Total purchase count and amount
- Expandable transaction details
- Item-level breakdown
- Date and cost tracking

### 💾 Database Backup & Restore
- One-click database backup download
- Upload backup to restore data
- Automatic safety backup before restore
- Warning system for destructive actions
- Best practices documentation

---

## 💻 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Beautiful UI components
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma** - Type-safe ORM
- **SQLite** - Embedded database
- **bcrypt** - Password encryption
- **Node.js fs** - File system operations

### Libraries
- **jsPDF** - PDF generation
- **xlsx** - Excel export

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sudo-marco-dev/psu-sales-inventory-system.git

# Navigate to project directory
cd psu-sales-inventory-system

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full system access

### Cashier Account
- **Username:** `cashier`
- **Password:** `cashier123`
- **Access:** POS, Sales History

### Inventory Clerk Account
- **Username:** `clerk`
- **Password:** `clerk123`
- **Access:** Products, Purchases, Suppliers

---

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database

# Code Quality
npm run lint         # Run ESLint
```

---

## 📁 Project Structure

```
psu-sales-inventory-system/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   ├── backup/            # Backup & restore APIs
│   │   ├── products/
│   │   ├── sales/
│   │   ├── purchases/
│   │   ├── suppliers/
│   │   ├── users/
│   │   └── reports/
│   ├── dashboard/              # Dashboard pages
│   │   ├── pos/               # Point of Sale
│   │   ├── sales/             # Sales History
│   │   ├── products/          # Products
│   │   ├── purchases/         # Purchase Orders
│   │   ├── suppliers/         # Suppliers
│   │   ├── reports/           # Reports
│   │   ├── users/             # User Management
│   │   └── settings/          # System Settings
│   └── login/                 # Authentication
├── components/ui/              # UI components
├── lib/                        # Utilities
│   ├── export.ts              # PDF/Excel exports
│   ├── receipt.ts             # Receipt generation
│   └── prisma.ts              # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── dev.db                 # SQLite database
└── package.json
```

---

## 📊 Features Overview

### Dashboard
- Real-time statistics
- Recent sales display
- Low stock alerts
- Today's revenue tracking

### Point of Sale (POS)
- Product search and selection
- Shopping cart management
- **Multiple payment methods**
- Receipt auto-printing
- Change calculation
- Stock validation

### Sales History
- View all transactions
- **Search by payment method**
- Print/download receipts
- Expandable item details
- **Color-coded payment badges**

### Product Management
- CRUD operations
- Stock level monitoring
- Category organization
- Supplier assignment
- Low stock indicators

### Purchase Management
- Create purchase orders
- Multi-item purchases
- Automatic stock updates
- Supplier tracking

### Supplier Management
- CRUD operations
- Contact information
- **Transaction history** 🆕
- Purchase count tracking
- Total purchase amounts

### Reports & Analytics
- **Sales Reports** (PDF/Excel)
  - Daily, weekly, monthly summaries
  - **Payment method breakdown** 🆕
  - Sales trends and performance
- **Inventory Reports** (PDF/Excel)
  - Current stock levels
  - Low stock alerts
  - Inventory valuation
- **Profit & Loss** (PDF/Excel)
  - Revenue vs. costs
  - Profit margins
  - Financial summaries

### User Management 🆕
- Create/edit/delete users
- Role assignment
- Account activation/deactivation
- Password management
- User search and filtering

### System Settings 🆕
- **Database backup download**
- **Restore from backup**
- Security information
- Best practices guide

---

## 👥 User Roles & Permissions

| Feature | Admin | Cashier | Inventory Clerk |
|---------|-------|---------|----------------|
| Dashboard | ✅ | ✅ | ✅ |
| POS (Sales) | ✅ | ✅ | ❌ |
| Sales History | ✅ | ✅ | ❌ |
| Products | ✅ | ❌ | ✅ |
| Purchases | ✅ | ❌ | ✅ |
| Suppliers | ✅ | ❌ | ✅ |
| Reports | ✅ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |

---

## 📦 Database Schema

### Models
1. **User** - System users with role-based access
2. **Category** - Product categories
3. **Supplier** - Supplier information
4. **Product** - Product catalog with inventory
5. **Sale** - Sales transactions with payment methods
6. **SaleItem** - Line items in sales
7. **Purchase** - Purchase orders
8. **PurchaseItem** - Line items in purchases

### Relationships
- Products belong to Categories and Suppliers
- Sales have multiple SaleItems
- Purchases have multiple PurchaseItems
- All transactions track the User who created them

---

## 📝 Export Capabilities

### PDF Exports
- Thermal receipts (80mm format) with payment method
- Sales summary reports with payment analytics
- Inventory status reports
- Profit & loss statements

### Excel Exports
- Multi-sheet workbooks
- Sales data with payment methods
- Inventory listings
- Financial summaries

---

## 🔔 Notifications

- **Low Stock Alerts** - Dashboard widget showing products below reorder level
- **Out of Stock** - Real-time tracking of depleted inventory
- **Stock Validation** - Prevents overselling during checkout

---

## 🎯 Project Goals

✅ **Accurate Tracking** - Real-time inventory and sales monitoring  
✅ **Efficiency** - Streamlined POS and inventory workflows  
✅ **Data Integrity** - Automatic calculations and validations  
✅ **Security** - Role-based access and encrypted passwords  
✅ **Reporting** - Comprehensive analytics and export capabilities  
✅ **Backup** - Database backup and restore functionality

---

## 🛠️ Troubleshooting

### Database Issues
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Prisma Version Issues
```bash
npm uninstall prisma @prisma/client
npm install prisma@5.20.0 @prisma/client@5.20.0 --save-exact
npm run db:generate
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

### Clear Browser Cache
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

## 📚 Documentation

- [FEATURES.md](FEATURES.md) - Detailed feature documentation
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## 👨‍💻 Author

**Marco**  
Palawan State University  
Advanced Database Systems - Final Project

---

## 📄 License

This project is developed for educational purposes as part of the Advanced Database Systems course at Palawan State University.

---

## ✨ Status

**✅ Production Ready**  
**✅ 100% Functional Requirements Complete**  
**✅ All Features Tested**  

**Version:** 1.2.0  
**Last Updated:** December 8, 2025

---

**Built with ❤️ using Next.js, Prisma, and TypeScript**
