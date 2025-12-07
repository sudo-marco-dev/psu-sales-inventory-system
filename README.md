# PSU Sales and Inventory Management System

A complete Sales and Inventory Management System built with Next.js, Prisma, and SQLite for Palawan State University - ADS Final Project.

## ✨ Features Implemented

### ✅ Authentication & Access Control
- Secure login with username/password
- Role-based access (Admin, Cashier, Inventory Clerk)
- Session management with localStorage
- Protected routes based on user roles

### ✅ Dashboard
- Real-time key metrics (Total Products, Low Stock Alerts, Revenue, Sales Count)
- Recent sales list with detailed information
- Low stock alerts section
- Role-based content display
- Mobile-responsive design

### ✅ Product Management
- View all products with detailed information
- Search products by name or code
- Display stock levels, prices, categories, suppliers
- Low stock indicators with visual warnings
- Category-based organization

### ✅ Point of Sale (POS)
- Fast product search and selection
- Shopping cart with real-time calculations
- Quantity adjustments (+ / - buttons)
- Stock validation (prevents overselling)
- Automatic inventory updates on sale completion
- Unique receipt number generation (SALE-YYYYMMDD-####)
- Split-screen design for efficient workflow

### ✅ Purchase/Restocking Management
- Create purchase orders with multiple items
- Select suppliers from dropdown
- Add products with custom unit costs
- Automatic stock level increments
- Purchase order history with full details
- Unique PO number generation (PO-YYYYMMDD-####)
- Notes field for additional information

### ✅ Supplier Management
- Add new suppliers with complete contact information
- Store company name, contact person, phone, email, address
- Search suppliers by name or contact person
- Grid view with detailed supplier cards
- Active/inactive status tracking

### ✅ Reports & Analytics
- **Sales Summary**: Today, Week, Month views with revenue, sales count, items sold, average sale
- **Profit & Loss**: Calculate revenue vs costs with profit margins
- **Inventory Status**: Total products, low stock alerts, out of stock, inventory value
- **Top Selling Products**: Ranked by quantity sold and revenue
- **Slow Moving Products**: Identify products with low sales
- **Low Stock Alerts**: Quick view of products needing restock
- Period filtering for all reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed

### Setup Instructions

```bash
# 1. Navigate to your project folder
cd C:\\Users\\marco\\Documents\\ADS\\ADS-final-project

# 2. Clone the repository (if not already cloned)
git clone https://github.com/sudo-marco-dev/psu-sales-inventory-system.git
cd psu-sales-inventory-system

# 3. Pull the latest changes
git pull

# 4. Install dependencies
npm install

# 5. Install correct Prisma version (if needed)
npm uninstall prisma @prisma/client
npm install prisma@5.20.0 @prisma/client@5.20.0 --save-exact

# 6. Set up the database
npm run db:push

# 7. Seed the database with sample data
npm run db:seed

# 8. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Default User Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | `admin` | `admin123` | Full access to all features |
| Cashier | `cashier` | `cashier123` | Dashboard, POS only |
| Inventory Clerk | `clerk` | `clerk123` | Dashboard, Products, Purchases, Suppliers |

## 📊 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Components**: Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM 5.20.0
- **Authentication**: Custom auth with bcryptjs
- **State Management**: React Hooks (useState, useEffect)

### Why This Stack?

**Next.js 14 (App Router)**
- ✅ Single framework for frontend + backend
- ✅ Built-in API routes (no separate backend needed)
- ✅ Server and client components for optimal performance
- ✅ Fast development with hot reload
- ✅ Easy deployment to Vercel

**SQLite + Prisma**
- ✅ Zero configuration - no database server needed
- ✅ Perfect for local development and testing
- ✅ Type-safe database queries with Prisma Client
- ✅ Easy migrations and schema management
- ✅ Can migrate to PostgreSQL/MySQL for production

**Tailwind CSS + shadcn/ui**
- ✅ Rapid UI development with utility classes
- ✅ Pre-built accessible components
- ✅ Consistent design system
- ✅ Fully customizable and extendable
- ✅ Mobile-first responsive design

## 📁 Project Structure

```
psu-sales-inventory-system/
├── app/
│   ├── api/                      # API routes
│   │   ├── auth/login/           # Login endpoint
│   │   ├── products/             # Products CRUD
│   │   ├── sales/                # Sales transactions
│   │   ├── purchases/            # Purchase orders
│   │   ├── suppliers/            # Suppliers CRUD
│   │   ├── categories/           # Categories
│   │   ├── dashboard/            # Dashboard stats
│   │   └── reports/              # Analytics APIs
│   ├── dashboard/                # Protected pages
│   │   ├── page.tsx              # Dashboard home
│   │   ├── pos/                  # Point of Sale
│   │   ├── products/             # Products management
│   │   ├── purchases/            # Purchase orders
│   │   ├── suppliers/            # Suppliers management
│   │   ├── reports/              # Reports & Analytics
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # Auth helper functions
│   └── utils.ts                  # Utility functions (cn)
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed script
│   └── dev.db                    # SQLite database (created after setup)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🛠️ Database Commands

```bash
# Push schema changes to database
npm run db:push

# Open Prisma Studio (visual database editor)
npm run db:studio

# Generate Prisma Client
npm run db:generate

# Seed database with sample data
npm run db:seed
```

## 📝 Sample Data

The seed script creates:
- **3 users**: Admin, Cashier, Inventory Clerk
- **2 categories**: Electronics, Stationery
- **1 supplier**: Tech Supplies Inc.
- **4 products**: USB Flash Drive, Ballpen, Notebook, Computer Mouse

## 🔑 Access Control Matrix

| Feature | Admin | Cashier | Inventory Clerk |
|---------|-------|---------|----------------|
| Dashboard | ✅ | ✅ | ✅ |
| POS (Sales) | ✅ | ✅ | ❌ |
| Products | ✅ | ❌ | ✅ |
| Purchases | ✅ | ❌ | ✅ |
| Suppliers | ✅ | ❌ | ✅ |
| Reports & Analytics | ✅ | ❌ | ❌ |

## 🧑‍💻 Usage Guide

### Making a Sale (Cashier/Admin)
1. Navigate to **POS (Sales)**
2. Search for products in the left panel
3. Click on products to add to cart
4. Adjust quantities using +/- buttons
5. Review total and click **Complete Sale**
6. Stock automatically updates

### Creating a Purchase Order (Admin/Clerk)
1. Navigate to **Purchases**
2. Click **New Purchase Order**
3. Select a supplier
4. Add products with quantities and unit costs
5. Add optional notes
6. Click **Create Purchase Order**
7. Stock levels automatically increase

### Managing Suppliers (Admin/Clerk)
1. Navigate to **Suppliers**
2. Click **Add Supplier**
3. Fill in company information
4. Submit form
5. Search and view all suppliers

### Viewing Reports (Admin)
1. Navigate to **Reports**
2. View sales summary (today/week/month)
3. Check profit & loss analysis
4. Review inventory status
5. Identify top-selling products
6. Find slow-moving inventory

## 🐛 Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Delete the database and recreate
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Prisma Version Issues
If you see errors about datasource URLs or Prisma 7:
```bash
npm uninstall prisma @prisma/client
npm install prisma@5.20.0 @prisma/client@5.20.0 --save-exact
npm run db:generate
```

### Port Already in Use
If port 3000 is busy:
```bash
# Use a different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Clear Browser Cache
If UI doesn't update:
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache and hard reload

## 🚀 Deployment (Optional)

### Deploy to Vercel
1. Push code to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Deploy automatically
4. For production, migrate to PostgreSQL (Supabase/Neon)

### Database Migration for Production
To use PostgreSQL in production:
```prisma
// Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com/)

## ✨ Future Enhancements

- [ ] User Management (CRUD for users)
- [ ] PDF Export for reports and receipts
- [ ] Excel export for inventory data
- [ ] Email notifications for low stock
- [ ] Barcode scanning support
- [ ] Multi-currency support
- [ ] Advanced filtering and sorting
- [ ] Audit logs for all transactions
- [ ] Product images
- [ ] Receipt printing

## 🤝 Contributing

This is an academic project for ADS Final Project. Feel free to fork and modify for your own educational purposes.

## 📄 License

MIT License - Free to use for educational purposes.

## 👥 Team

**Palawan State University** - ADS Final Project 2025

---

**Built with ❤️ using Next.js, Prisma, and TypeScript**