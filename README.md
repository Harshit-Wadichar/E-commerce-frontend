# 🛒 E-Commerce Frontend

A modern, full-featured e-commerce frontend built with **React 18**, **TypeScript**, and **Vite**. It includes a customer-facing storefront and a fully functional admin panel — both backed by Redux Toolkit for state management and Firebase for authentication.

---

## 📦 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite (with SWC plugin) |
| State Management | Redux Toolkit + RTK Query |
| Routing | React Router DOM v6 |
| Authentication | Firebase (Google Sign-In) |
| Payments | Stripe (`@stripe/react-stripe-js`) |
| Charts | Chart.js + `react-chartjs-2` |
| Styling | SCSS / Sass |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | react-icons |
| Data Tables | react-table v7 |
| Date Handling | moment.js |

---

## 📁 Project Structure

```
src/
├── App.tsx                  # Root component — routing, auth listener
├── main.tsx                 # Entry point (Redux Provider, React DOM)
├── firebase.ts              # Firebase app + auth initialization
│
├── pages/                   # All application pages
│   ├── home.tsx             # Homepage with featured products
│   ├── search.tsx           # Product search & filter page
│   ├── product-details.tsx  # Single product view with reviews
│   ├── cart.tsx             # Shopping cart
│   ├── login.tsx            # Firebase Google Sign-In
│   ├── shipping.tsx         # Shipping address form
│   ├── checkout.tsx         # Stripe payment checkout
│   ├── orders.tsx           # User's order history
│   ├── order-details.tsx    # Single order detail view
│   ├── not-found.tsx        # 404 page
│   │
│   └── admin/               # Admin-only pages
│       ├── dashboard.tsx        # Overview with stats & charts
│       ├── products.tsx         # Product listing table
│       ├── customers.tsx        # Customer listing table
│       ├── transaction.tsx      # All orders/transactions
│       ├── discount.tsx         # Coupon/discount listing
│       ├── ratings.tsx          # Product ratings view
│       │
│       ├── charts/
│       │   ├── barcharts.tsx    # Revenue & product bar charts
│       │   ├── piecharts.tsx    # Category distribution pie charts
│       │   └── linecharts.tsx   # Sales trend line charts
│       │
│       ├── apps/
│       │   ├── coupon.tsx       # Coupon code generator tool
│       │   ├── stopwatch.tsx    # Admin utility — stopwatch
│       │   └── toss.tsx         # Admin utility — coin toss
│       │
│       └── management/
│           ├── newproduct.tsx           # Create a new product
│           ├── productmanagement.tsx    # Edit/delete a product
│           ├── transactionmanagement.tsx # View & process an order
│           ├── newdiscount.tsx          # Create a new coupon
│           └── discountManagement.tsx   # Edit/delete a coupon
│
├── components/
│   ├── header.tsx           # Navbar with cart icon and user menu
│   ├── footer.tsx           # Site footer
│   ├── loader.tsx           # Fullscreen loading spinner
│   ├── product-card.tsx     # Reusable product card component
│   ├── cart-item.tsx        # Cart item row component
│   ├── rating.tsx           # Star rating display component
│   ├── protected-route.tsx  # Route guard for auth & admin roles
│   │
│   └── admin/
│       └── AdminSidebar.tsx # Sidebar navigation for admin panel
│
├── redux/
│   ├── store.ts             # Redux store configuration
│   │
│   ├── api/                 # RTK Query API slices (server state)
│   │   ├── userAPI.ts       # User fetch & login
│   │   ├── productAPI.ts    # Product CRUD, search, categories
│   │   ├── orderAPI.ts      # Order creation & management
│   │   └── dashboardAPI.ts  # Admin dashboard stats
│   │
│   └── reducer/             # Redux slices (client state)
│       ├── userReducer.ts   # Logged-in user state
│       └── cartReducer.ts   # Cart items, quantities, totals
│
├── types/                   # TypeScript type definitions
├── styles/                  # Global SCSS stylesheets
└── utils/                   # Helper/utility functions
```

---

## 🔄 How It Works

### 1. Authentication (Firebase)
- Users sign in via **Google OAuth** using Firebase Authentication.
- On app load, `onAuthStateChanged` in `App.tsx` listens for auth state changes.
- When a user is detected, their Firebase UID is used to fetch their profile from the backend (`GET /api/v1/user/:id`).
- The user object is stored in the Redux `userReducer` slice for global access.

### 2. Routing & Route Protection (`react-router-dom` v6)
All pages are **lazy-loaded** with `React.lazy()` + `Suspense` for optimal performance.

Three tiers of route protection via `ProtectedRoute`:
- **Public routes** — Home, Search, Product Details, Cart
- **Authenticated routes** — Shipping, Orders, Checkout (requires login)
- **Admin-only routes** — `/admin/*` (requires `role === "admin"`)

### 3. State Management (Redux Toolkit)

**RTK Query** handles all **server state** (data fetching, caching, mutations):
- `productAPI` — `getAllProducts`, `getLatestProducts`, `getSingleProduct`, `newProduct`, `updateProduct`, `deleteProduct`, `getAllCategories`, product reviews
- `orderAPI` — `newOrder`, `myOrders`, `allOrders`, `updateOrder`, `deleteOrder`
- `userAPI` — `getUser`, login/register
- `dashboardAPI` — admin stats (revenue, users, inventory, orders)

**Redux Slices** handle **client state**:
- `userReducer` — stores the logged-in user (`userExist` / `userNotExist` actions)
- `cartReducer` — manages cart items (add, remove, quantity change, shipping info, discount)

### 4. Payments (Stripe)
- On checkout, a **Payment Intent** is created by calling the backend (`POST /api/v1/payment/create`).
- The frontend uses `@stripe/react-stripe-js` with the returned `clientSecret` to render the Stripe Elements form.
- Coupon codes are validated via `POST /api/v1/payment/discount` before payment.

### 5. Admin Dashboard
- Visualizes business data using **Chart.js** (bar, pie, line charts).
- Admins can manage products (with multi-image upload), orders, customers, and discount coupons.
- Data tables are powered by **react-table v7**.
- All admin routes are protected by the `adminOnly` guard.

### 6. Image Upload
- Product images are uploaded using `multipart/form-data` (FormData API).
- The backend stores them in **Cloudinary** and returns public URLs.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of `E-commerce-Frontend/`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SERVER=http://localhost:4000
VITE_STRIPE_KEY=your_stripe_publishable_key
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs on `http://localhost:5173` by default.

---

## 🛤️ All Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/search` | Search & Filter | Public |
| `/product/:id` | Product Details | Public |
| `/cart` | Shopping Cart | Public |
| `/login` | Google Sign-In | Guest only |
| `/shipping` | Shipping Address | Auth |
| `/pay` | Stripe Checkout | Auth |
| `/orders` | My Orders | Auth |
| `/orders/:id` | Order Details | Auth |
| `/admin/dashboard` | Admin Overview | Admin |
| `/admin/product` | All Products | Admin |
| `/admin/product/new` | Create Product | Admin |
| `/admin/product/:id` | Edit Product | Admin |
| `/admin/customer` | All Customers | Admin |
| `/admin/transaction` | All Orders | Admin |
| `/admin/transaction/:id` | Manage Order | Admin |
| `/admin/discount` | All Coupons | Admin |
| `/admin/discount/new` | Create Coupon | Admin |
| `/admin/discount/:id` | Edit Coupon | Admin |
| `/admin/chart/bar` | Bar Charts | Admin |
| `/admin/chart/pie` | Pie Charts | Admin |
| `/admin/chart/line` | Line Charts | Admin |
| `/admin/app/coupon` | Coupon Generator | Admin |
| `/admin/app/stopwatch` | Stopwatch | Admin |
| `/admin/app/toss` | Coin Toss | Admin |

---

## 🐳 Docker

```bash
# Development
docker build -f Dockerfile.dev -t ecommerce-frontend-dev .

# Production
docker build -t ecommerce-frontend .
```

Also managed via `compose.yaml` at the root of the monorepo.
