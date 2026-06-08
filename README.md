# Watah Vida - Campus Food Ordering System

A fully functional 3-tier web application for campus food ordering with real-time synchronization powered by Supabase.

## Portals

### 1. Kiosk Portal (`/kiosk`)
- Staff and customer order placement
- Dynamic product pricing (₱65 per unit)
- Dual payment options (GCash/InstaPay or Cash)
- Success confirmation screen
- Quick order reset

### 2. Customer Tracker Portal (`/tracker`)
- Secure login via Name + Section
- Real-time order status tracking
- Digital loyalty rewards (10th order free)
- Direct messaging with kitchen staff
- Live updates across all devices

### 3. Admin Console (`/admin`)
- Password-protected dashboard (watahvidaadmin123!)
- Real-time order management
- Revenue analytics
- Customer messaging system
- Loyalty point management

## Asset Configuration

### SVG Placeholder Assets (Current)
The app currently uses SVG placeholder files:
- `public/assets/images/logo.svg` - Brand logo
- `public/assets/images/product.svg` - Product image
- `public/assets/images/gcash_qr.svg` - Payment QR code

### To Add Real Assets
Replace the SVG files with your actual brand assets:

1. **Logo** - Replace `public/assets/images/logo.svg` with PNG/JPG
   - Recommended size: 200x200px
   - File: `logo.png` or rename accordingly

2. **Product Image** - Replace `public/assets/images/product.svg`
   - Recommended size: 300x300px
   - File: `product.png`

3. **Payment QR Code** - Replace `public/assets/images/gcash_qr.svg`
   - Recommended size: 300x300px
   - File: `gcash_qr.png`

4. **Brand Font** - Add at `public/assets/fonts/BRANDFONT.jpeg`
   - Update src/index.css if using different format
   - Currently uses system font fallback (Comic Sans MS, Segoe Print)

### If Adding New Assets
Update the file paths in:
- `src/pages/Home.tsx` - Logo reference
- `src/pages/Kiosk.tsx` - Product and QR code references
- `src/index.css` - Font face declaration

## Build & Development

```bash
# Install dependencies
npm install

# Development server (auto-runs at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build**: Vite
- **Design**: Glassmorphism UI with custom brand colors

## Brand Colors

- **Cream**: #F5F5F5
- **Watermelon Red**: #C0394B
- **Lime Green**: #A8C64F
- **Forest Green**: #4A7C2A
- **Onyx Black**: #1A1A1A

## Database Schema

### Tables
- `customers` - Unique customer profiles (Name + Section)
- `orders` - Order details with status tracking
- `messages` - Two-way customer-admin messaging

All tables have Row-Level Security (RLS) policies for data protection.

## Features

✓ Real-time order synchronization
✓ Live status updates across portals
✓ Loyalty rewards system
✓ Secure admin access
✓ Direct messaging
✓ Responsive mobile design
✓ Glassmorphism UI
✓ Accessibility-ready

## Notes

- Admin password: `watahvidaadmin123!`
- Product price: ₱65.00 per order
- Loyalty threshold: 10 orders for free item
- All data syncs in real-time via Supabase websockets
