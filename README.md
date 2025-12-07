# PSU Sales and Inventory Management System

A modern Sales and Inventory Management System built with Next.js, Prisma, and PostgreSQL for Palawan State University - ADS Final Project.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel (Frontend) + Supabase (Database)

## ✨ Features

- ✅ Product and Inventory Management
- ✅ Sales Transaction Processing (POS)
- ✅ Purchase and Restocking Management
- ✅ Supplier Management
- ✅ Reports and Analytics
- ✅ User Account and Role Management (Admin, Cashier, Inventory Clerk)
- ✅ Search and Filtering
- ✅ Backup and Data Security

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase account)
- npm or yarn

## 🛠️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/sudo-marco-dev/psu-sales-inventory-system.git
cd psu-sales-inventory-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
- For local PostgreSQL: `postgresql://user:password@localhost:5432/psu_sales_inventory`
- For Supabase: Get the connection string from your Supabase project settings

### 4. Set up the database
```bash
npm run db:push
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Database Management

```bash
# Open Prisma Studio (visual database editor)
npm run db:studio

# Push schema changes to database
npm run db:push

# Generate Prisma Client
npm run db:generate
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `DATABASE_URL` environment variable
4. Deploy!

### Database Hosting (Supabase)

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Copy the PostgreSQL connection string
4. Use it as your `DATABASE_URL`

## 👥 Default Users

After seeding the database, you can log in with:

- **Admin**: `admin` / `admin123`
- **Cashier**: `cashier` / `cashier123`
- **Inventory Clerk**: `clerk` / `clerk123`

## 📁 Project Structure

```
psu-sales-inventory-system/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
└── public/               # Static files
```

## 🤝 Contributing

This is an academic project. For contributions, please create a pull request.

## 📄 License

MIT License - feel free to use this for educational purposes.

---

**Palawan State University** | ADS Final Project 2025