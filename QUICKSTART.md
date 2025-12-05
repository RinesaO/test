# Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (new terminal)
cd client
npm install
```

### 2. Setup Environment Variables

**Backend** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharmacare
JWT_SECRET=your_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
CLIENT_URL=http://localhost:3000
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### 3. Start MongoDB

Make sure MongoDB is running locally, or use MongoDB Atlas connection string.

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🧪 Test the Application

1. **Register a Pharmacy**: Go to http://localhost:3000/register
2. **Login**: Use your credentials at http://localhost:3000/login
3. **Manage Profile**: Update pharmacy information
4. **Add Products**: Create products with images
5. **Subscribe**: Use Stripe test card `4242 4242 4242 4242`
6. **Browse**: View pharmacies at http://localhost:3000/pharmacies

## 🔑 Create Admin User

### Option 1: Using the Script (Recommended)

Run the admin creation script:

```bash
cd server
npm run create-admin
```

This will create an admin user with:
- **Email**: `admin@pharmacare.com` (or set `ADMIN_EMAIL` in `.env`)
- **Password**: `admin123` (or set `ADMIN_PASSWORD` in `.env`)

### Option 2: Using MongoDB Shell/Compass

1. Register a user first (via the registration page)
2. Then update their role in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then login with that email to access admin panel.

## 📝 Notes

- Stripe webhook testing: Use Stripe CLI for local development
- Image uploads: Automatically creates `uploads/` directory
- All pharmacies start as inactive until subscription is active

