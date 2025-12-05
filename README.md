# PharmaCare - E-Pharmacy Platform

A full-stack web application for managing pharmacies in Kosovo. Pharmacies can subscribe to appear on the platform, manage their profiles and products, while users can browse and find pharmacies easily.

## 🚀 Features

### Public Features
- **Homepage**: Modern landing page with hero section, benefits, and how it works
- **Pharmacy Directory**: Browse all active pharmacies with search and filter functionality
- **Pharmacy Profiles**: View detailed information about each pharmacy including products, services, and opening hours

### Pharmacy Dashboard
- **Profile Management**: Edit pharmacy information, upload logo, manage opening hours
- **Product Management**: Add, edit, delete products with images
- **Subscription Management**: Subscribe to appear on the platform using Stripe
- **Analytics**: View views, clicks, and subscription status

### Admin Panel
- **Pharmacy Management**: View, activate/deactivate, and delete pharmacies
- **Product Management**: View and delete products
- **Dashboard Statistics**: Overview of platform statistics

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Stripe** for subscription payments
- **Multer** for file uploads

### Frontend
- **React** with **Vite**
- **React Router** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Stripe.js** for payment processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (running locally or MongoDB Atlas account)
- **npm** or **yarn**
- **Stripe Account** (for payment processing)

## 🔧 Installation

### 1. Clone the repository

```bash
cd pharmacare
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Environment Variables

#### Backend (.env file in `server/` directory)

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharmacare
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env file in `client/` directory)

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 5. Stripe Setup

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your test API keys from the Stripe Dashboard
3. Set up a webhook endpoint:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `http://localhost:5000/api/subscription/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook signing secret to your `.env` file

### 6. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/pharmacare`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `.env`

## 🚀 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal:

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
pharmacare/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files
│   ├── server.js          # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 Authentication

The application uses JWT-based authentication:

- **Pharmacy Role**: Can access dashboard, manage profile and products
- **Admin Role**: Can access admin panel and manage all pharmacies

### Creating an Admin User

To create an admin user, you can either:
1. Manually update the database to set a user's role to 'admin'
2. Use MongoDB shell or Compass to update the user document

Example MongoDB command:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 💳 Subscription Flow

1. Pharmacy registers and logs in
2. Navigates to Dashboard → Subscription
3. Clicks "Subscribe Now"
4. Redirected to Stripe Checkout
5. After successful payment, webhook updates pharmacy status
6. Pharmacy becomes active and appears in public directory

## 🧪 Testing

### Manual Testing

1. **Register a Pharmacy**:
   - Go to `/register`
   - Fill in pharmacy details
   - Create account

2. **Login**:
   - Go to `/login`
   - Use registered credentials

3. **Manage Profile**:
   - Go to Dashboard → Profile
   - Update information, upload logo

4. **Add Products**:
   - Go to Dashboard → Products
   - Add products with images

5. **Subscribe**:
   - Go to Dashboard → Subscription
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC

6. **Browse Pharmacies**:
   - Go to `/pharmacies`
   - Search and filter pharmacies
   - View pharmacy profiles

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register pharmacy
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Pharmacy (Protected)
- `GET /api/pharmacy/profile` - Get profile
- `PUT /api/pharmacy/profile` - Update profile
- `POST /api/pharmacy/logo` - Upload logo
- `GET /api/pharmacy/analytics` - Get analytics

### Products (Protected)
- `GET /api/products` - Get my products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/image` - Upload product image

### Subscription (Protected)
- `POST /api/subscription/create-checkout-session` - Create checkout
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/webhook` - Stripe webhook

### Public
- `GET /api/public/pharmacies` - Get all active pharmacies
- `GET /api/public/pharmacies/:id` - Get pharmacy details
- `GET /api/public/pharmacies/:id/products` - Get pharmacy products
- `GET /api/public/cities` - Get cities list

### Admin (Protected)
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/pharmacies` - Get all pharmacies
- `PUT /api/admin/pharmacies/:id/status` - Update pharmacy status
- `DELETE /api/admin/pharmacies/:id` - Delete pharmacy
- `GET /api/admin/products` - Get all products
- `DELETE /api/admin/products/:id` - Delete product

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity if using Atlas

### Stripe Webhook Not Working
- Ensure webhook URL is correct
- Check webhook secret in `.env`
- Verify webhook events are selected in Stripe Dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5000/api/subscription/webhook`

### Image Upload Issues
- Ensure `uploads` directory exists in `server/`
- Check file permissions
- Verify file size limits (5MB default)

### CORS Errors
- Check `CLIENT_URL` in backend `.env`
- Ensure frontend URL matches

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email info@pharmacare.com or create an issue in the repository.

---

**Built with ❤️ for pharmacies in Kosovo**

