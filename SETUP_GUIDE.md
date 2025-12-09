# Setup Guide - Real-World Enhancements Branch

## 🎉 Welcome to the Enhanced Version!

This branch (`feature/real-world-enhancements`) includes **3 major new features**:
1. ✅ **Customer Management** - Track customers, loyalty points, store credit
2. ✅ **Discounts & Promotions** - Create coupon codes and promotional offers
3. ✅ **Product Images** - Upload and display product/category images

---

## 🚀 Quick Setup

### Step 1: Switch to Feature Branch

```bash
# Make sure you're in your project directory
cd C:\Users\marco\Documents\ADS\ADS-final-project\psu-sales-inventory-system

# Fetch all branches
git fetch origin

# Switch to the feature branch
git checkout feature/real-world-enhancements

# Pull latest changes
git pull origin feature/real-world-enhancements
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Backup Current Database (IMPORTANT!)

```bash
# Create a backup of your current database
copy prisma\dev.db prisma\dev-backup-before-enhancements.db
```

### Step 4: Update Database Schema

```bash
# Generate Prisma client with new models
npm run db:generate

# Push new schema to database
npm run db:push

# Seed database (optional - adds sample customers and discounts)
npm run db:seed
```

### Step 5: Create Upload Directories

```bash
# Windows
mkdir public\uploads\products
mkdir public\uploads\categories

# Mac/Linux
mkdir -p public/uploads/products
mkdir -p public/uploads/categories
```

### Step 6: Start Development Server

```bash
npm run dev
```

### Step 7: Access New Features

Open [http://localhost:3000](http://localhost:3000) and login:
- Username: `admin`
- Password: `admin123`

**New menu items:**
- **Customers** - Manage customer database
- **Discounts** - Create and manage discount codes

---

## 🎯 Features Overview

### 1. Customer Management

**Location:** `/dashboard/customers`

**Features:**
- Add new customers with contact details
- Customer types: Regular, VIP, Wholesale
- Loyalty points system
- Store credit management
- Purchase history per customer
- Search and filter customers
- Customer statistics dashboard

**Key Benefits:**
- Track repeat customers
- Build customer loyalty
- Targeted marketing
- Better customer service

**How to Use:**
1. Click "Customers" in sidebar
2. Click "Add Customer"
3. Fill in customer details
4. Save customer
5. View customer list with stats

---

### 2. Discounts & Promotions

**Location:** `/dashboard/discounts`

**Features:**
- Create discount codes (e.g., SUMMER2025)
- Percentage discounts (10%, 20% off)
- Fixed amount discounts (₱50, ₱100 off)
- Minimum purchase requirements
- Maximum discount caps
- Date range validity
- Usage limits
- Applicable scope (All/Category/Product/Customer Type)
- Track usage count

**Key Benefits:**
- Increase sales volume
- Clear old inventory
- Attract new customers
- Seasonal promotions

**How to Use:**
1. Click "Discounts" in sidebar
2. Click "Create Discount"
3. Enter discount code (e.g., SALE20)
4. Set discount type and value
5. Set date range
6. Save discount
7. Customers can use code at POS (to be integrated)

**Example Discounts:**
- `SALE20` - 20% off entire purchase
- `SAVE100` - ₱100 off minimum ₱500 purchase
- `STUDENT10` - 10% student discount
- `VIP25` - 25% VIP customer discount

---

### 3. Product Images

**Location:** Upload API at `/api/upload`

**Features:**
- Upload product images
- Upload category images
- Automatic file validation
- Size limit: 5MB
- Supported formats: JPG, PNG, WebP
- Unique filename generation
- Organized storage

**Key Benefits:**
- Visual product identification
- Better user experience
- Professional appearance
- E-commerce ready

**How to Use (API):**
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('type', 'products'); // or 'categories'

const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { imageUrl } = await res.json();
// imageUrl: '/uploads/products/1234567890-abc123.jpg'
```

**Note:** Product page integration coming in next update!

---

## 📊 Database Changes

### New Models Added:

```prisma
// Customer Management
model Customer {
  customerNumber String
  name           String
  email          String?
  phone          String?
  customerType   String  // REGULAR, VIP, WHOLESALE
  loyaltyPoints  Int
  storeCredit    Float
  // ... relationships
}

// Discount System
model Discount {
  code           String
  name           String
  discountType   String  // PERCENTAGE, FIXED_AMOUNT
  discountValue  Float
  minPurchase    Float
  maxDiscount    Float?
  startDate      DateTime
  endDate        DateTime
  usageLimit     Int?
  usageCount     Int
  // ...
}

model SaleDiscount {
  saleId         String
  discountId     String
  discountAmount Float
  // ...
}
```

### Enhanced Models:

```prisma
model Product {
  // New fields:
  imageUrl   String?
  barcode    String?
  costPrice  Float
  expiryDate DateTime?
  // ...
}

model Sale {
  // New fields:
  customerId String?
  // ...
}
```

---

## 🛠️ Testing the Features

### Test Customer Management:

1. Navigate to Customers page
2. Click "Add Customer"
3. Create a test customer:
   - Name: John Doe
   - Type: VIP
   - Phone: +63 912 345 6789
4. Save and view customer list
5. Check customer statistics at top

### Test Discount System:

1. Navigate to Discounts page
2. Click "Create Discount"
3. Create a test discount:
   - Code: TEST20
   - Name: Test Discount
   - Type: Percentage
   - Value: 20
   - Start: Today
   - End: +7 days
4. Save and view discount list
5. Test validation API:

```bash
curl -X POST http://localhost:3000/api/discounts/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"TEST20","totalAmount":1000}'
```

### Test Image Upload:

1. Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<body>
  <input type="file" id="fileInput" accept="image/*">
  <button onclick="uploadImage()">Upload</button>
  <img id="preview" style="max-width:200px">
  
  <script>
    async function uploadImage() {
      const file = document.getElementById('fileInput').files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'products');
      
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      document.getElementById('preview').src = data.imageUrl;
      alert('Uploaded: ' + data.imageUrl);
    }
  </script>
</body>
</html>
```

2. Open file in browser and upload an image
3. Check `public/uploads/products/` folder

---

## 📝 API Documentation

### Customer API

**List Customers**
```
GET /api/customers?search=john&type=VIP
```

**Create Customer**
```
POST /api/customers
Body: { name, email, phone, customerType, ... }
```

**Get Customer**
```
GET /api/customers/:id
```

**Update Customer**
```
PUT /api/customers/:id
Body: { name, loyaltyPoints, ... }
```

**Delete Customer**
```
DELETE /api/customers/:id
```

---

### Discount API

**List Discounts**
```
GET /api/discounts?search=sale&active=true
```

**Create Discount**
```
POST /api/discounts
Body: { code, name, discountType, discountValue, startDate, endDate, ... }
```

**Validate Discount**
```
POST /api/discounts/validate
Body: { code: "SALE20", totalAmount: 1000 }
```

**Update Discount**
```
PUT /api/discounts/:id
Body: { isActive: false }
```

**Delete Discount**
```
DELETE /api/discounts/:id
```

---

### Upload API

**Upload Image**
```
POST /api/upload
Content-Type: multipart/form-data
Body: 
  file: [image file]
  type: "products" | "categories"
  
Response: { imageUrl: "/uploads/products/123.jpg" }
```

---

## 🐛 Troubleshooting

### Issue: "Table not found" error

**Solution:**
```bash
npm run db:push
```

### Issue: "Prisma client not generated"

**Solution:**
```bash
npm run db:generate
```

### Issue: Upload directory doesn't exist

**Solution:**
```bash
mkdir public\uploads\products
mkdir public\uploads\categories
```

### Issue: Changes not showing

**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Restart dev server
3. Check you're on correct branch:
```bash
git branch
# Should show: * feature/real-world-enhancements
```

---

## ⚡ Performance Tips

1. **Image Optimization**: Images are stored as-is. Consider adding compression in production.
2. **Database Indexing**: Already optimized with Prisma indexes.
3. **Caching**: Consider Redis for discount validation in high-traffic scenarios.

---

## 📦 What's Next?

The branch is ready for:

### Planned Features:
- [ ] POS integration for discounts (apply code at checkout)
- [ ] Customer selection at POS
- [ ] Product page image upload UI
- [ ] Email notifications
- [ ] Dashboard charts
- [ ] Barcode support
- [ ] Invoice generation
- [ ] Return/refund management

See [REAL_WORLD_FEATURES.md](./REAL_WORLD_FEATURES.md) for full roadmap.

---

## 🎓 Merging to Main

When ready to merge these features:

```bash
# Switch to main
git checkout main

# Merge feature branch
git merge feature/real-world-enhancements

# Push to remote
git push origin main
```

**Important:** Make sure to backup your database before merging!

---

## ❓ Support

If you encounter issues:
1. Check this guide
2. Review [REAL_WORLD_FEATURES.md](./REAL_WORLD_FEATURES.md)
3. Check Git commit history for changes
4. Create a GitHub issue

---

## 🎉 Congratulations!

You now have a **production-ready sales system** with:
- ✅ Customer Management
- ✅ Discount System
- ✅ Image Upload
- ✅ All previous features

**Happy coding! 🚀**