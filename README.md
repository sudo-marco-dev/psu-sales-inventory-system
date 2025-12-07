# PSU Sales and Inventory Management System - MVP

A complete Sales and Inventory Management System built with Next.js, Prisma, and SQLite for Palawan State University - ADS Final Project.

## ✨ Features Implemented (MVP)

✅ **Authentication System**
- Login with username/password
- Role-based access (Admin, Cashier, Inventory Clerk)
- Session management

✅ **Dashboard**
- Key metrics (Total Products, Low Stock Alerts, Today's Revenue, Sales Count)
- Recent sales list
- Low stock alerts
- Role-based content

✅ **Product Management**
- View all products
- Search products by name or code
- Display stock levels, prices, categories
- Low stock indicators

✅ **Point of Sale (POS)**
- Product search and selection
- Shopping cart management
- Quantity adjustments
- Real-time stock validation
- Automatic inventory updates on sale
- Receipt number generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed

### Setup Instructions

```bash
# 1. Navigate to your project folder
cd C:\\Users\\marco\\Documents\\ADS\\ADS-final-project

# 2. If not already cloned, clone the repository
git clone https://github.com/sudo-marco-dev/psu-sales-inventory-system.git
cd psu-sales-inventory-system

# 3. Pull the latest changes
git pull

# 4. Install dependencies
npm install

# 5. Set up the database
npm run db:push

# 6. Seed the database with sample data
npm run db:seed

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Default User Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `cashier123` |
| Inventory Clerk | `clerk` | `clerk123` |

## 📊 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components, Radix UI
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom auth with bcryptjs

### Why This Stack?

**Next.js 14**
- ✅ Single framework for frontend + backend
- ✅ Built-in API routes (no separate backend needed)
- ✅ Fast development with hot reload
- ✅ Easy deployment to Vercel

**SQLite + Prisma**
- ✅ Zero configuration - no database server needed
- ✅ Perfect for local development and testing
- ✅ Type-safe database queries with Prisma
- ✅ Can migrate to PostgreSQL/MySQL later if needed

**Tailwind CSS + shadcn/ui**
- ✅ Rapid UI development
- ✅ Pre-built accessible components
- ✅ Consistent design system
- ✅ Fully customizable

## 📁 Project Structure

```
psu-sales-inventory-system/
├── app/
│   ├── api/                  # API routes
│   │   ├── auth/login/       # Login endpoint
│   │   ├── products/         # Products CRUD
│   │   ├── sales/            # Sales transactions
│   │   ├── categories/       # Categories
│   │   ├── suppliers/        # Suppliers
│   │   └── dashboard/        # Dashboard stats
│   ├── dashboard/            # Protected pages
│   │   ├── page.tsx          # Dashboard home
│   │   ├── products/         # Products page
│   │   ├── pos/              # Point of Sale
│   │   └── layout.tsx        # Dashboard layout
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # Auth helpers
│   └── utils.ts              # Utility functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seed script
│   └── dev.db                # SQLite database (created after setup)
├── package.json
├── tsconfig.json
└── tailwind.config.ts
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
- 3 users (Admin, Cashier, Clerk)
- 2 categories (Electronics, Stationery)
- 1 supplier (Tech Supplies Inc.)
- 4 sample products

## 🔑 Access Control

| Page/Feature | Admin | Cashier | Inventory Clerk |
|--------------|-------|---------|----------------|
| Dashboard | ✅ | ✅ | ✅ |
| POS (Sales) | ✅ | ✅ | ❌ |
| Products | ✅ | ❌ | ✅ |

## 💡 Features to Add Next

1. **Purchase Management** - Restocking system
2. **Supplier Management** - CRUD for suppliers
3. **Reports & Analytics** - Sales reports, inventory reports
4. **User Management** - Add/edit users (Admin only)
5. **Export Features** - Export reports to PDF/Excel
6. **Receipt Printing** - Print sales receipts

## 🐛 Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Delete the database and recreate
rm prisma/dev.db
npm run db:push
npm run db:seed
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

## 🚀 Deployment (Optional)

For production deployment:

1. **Vercel** (Recommended)
   - Push to GitHub
   - Import repo on vercel.com
   - Deploy automatically

2. **Database**
   - For production, switch to PostgreSQL (Supabase)
   - Update `schema.prisma` datasource
   - Run migrations

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 🤝 Contributing

This is an academic project. Feel free to fork and modify for your own use.

## 📄 License

MIT License - Free to use for educational purposes.

---

**Palawan State University** | ADS Final Project 2025