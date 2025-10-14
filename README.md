# 🚀 Taliyo Marketplace

A modern, full-featured marketplace platform for service booking with WhatsApp integration.

## ✨ Features

### 🛍️ **Complete Marketplace**
- **Service Discovery** - Browse categories, search, and filter services
- **Shopping Cart** - Add multiple services and checkout via WhatsApp
- **Wishlist** - Save favorite services for later
- **User Profiles** - Manage account and view booking history
- **Order Tracking** - Track booking status from pending to completed

### 📱 **Modern UI/UX**
- **Mobile-First Design** - Responsive across all devices
- **Professional Interface** - Clean, modern design with smooth animations
- **Intuitive Navigation** - Easy-to-use bottom navigation and search
- **Interactive Elements** - Hover effects, loading states, and micro-animations

### 💬 **WhatsApp Integration**
- **Direct Booking** - Book services directly via WhatsApp
- **Customer Support** - Instant support through WhatsApp chat
- **Order Updates** - Receive booking confirmations and updates
- **Provider Contact** - Direct communication with service providers

### 🔧 **Admin Panel**
- **Service Management** - Add, edit, and manage services
- **Category Management** - Organize services by categories
- **Order Management** - Track and manage all bookings
- **Analytics Dashboard** - View business metrics and insights
- **Settings Panel** - Configure platform settings (2FA disabled for development)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd taliyo-marketplace
```

2. **Install dependencies**
```bash
# Main website
npm install

# Admin panel
cd admin-panel
npm install
cd ..
```

3. **Set up environment variables**
```bash
# Copy environment files
cp .env.example .env.local
cp admin-panel/.env.example admin-panel/.env.local
```

4. **Run the applications**

**Main Website:**
```bash
npm run dev
```
Access at: http://localhost:3000

**Admin Panel:**
```bash
cd admin-panel
npm run dev
```
Access at: http://localhost:3001

**Admin Login:**
- Email: `admin@taliyo.com`
- Password: `admin123`

## 📱 Pages & Features

### **Main Website**
- **Home** (`/`) - Featured services, categories, statistics
- **Categories** (`/categories`) - Browse service categories
- **Services** (`/services/[id]`) - Detailed service information
- **Search** (`/search`) - Advanced search with filters
- **Cart** (`/cart`) - Shopping cart with WhatsApp checkout
- **Profile** (`/profile`) - User account management
- **Wishlist** (`/wishlist`) - Saved services
- **Orders** (`/orders`) - Booking history and status
- **Help** (`/help`) - FAQ and customer support

### **Admin Panel**
- **Dashboard** - Overview of platform metrics
- **Categories** - Manage service categories
- **Services** - Add and manage services
- **Orders** - Track customer bookings
- **Analytics** - Business insights and reports
- **Settings** - Platform configuration

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### **Backend & Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Data security policies

### **Integration**
- **WhatsApp API** - Direct messaging integration
- **Mock Data** - Development-ready sample data

## 📊 Sample Data

The platform comes with realistic sample data:

### **Services (6 total)**
1. Professional Web Development (₹5,000-₹15,000)
2. Mobile App Development (₹8,000-₹25,000)
3. Digital Marketing Services (₹3,000-₹10,000/hr)
4. Logo & Brand Design (₹2,000-₹8,000)
5. Home Cleaning Service (₹500-₹1,500)
6. Math & Science Tutoring (₹300-₹800/hr)

### **Categories (6 total)**
- Web Development 💻
- Mobile Development 📱
- Digital Marketing 📈
- Graphic Design 🎨
- Home Services 🏠
- Education 📚

## 🔧 Development

### **Build for Production**
```bash
# Main website
npm run build
npm start

# Admin panel
cd admin-panel
npm run build
npm start
```

### **Environment Variables**
Key environment variables needed:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_SUPPORT_WHATSAPP` - WhatsApp support number
- `NEXT_PUBLIC_SUPPORT_PHONE` - Support phone number

## 📞 Support

### **WhatsApp Integration**
The platform uses WhatsApp for:
- Service bookings
- Customer support
- Order updates
- Provider communication

Default support number: `+917042523611`

### **Customer Support Features**
- Live chat via WhatsApp
- FAQ system with search
- Multi-channel support (WhatsApp, Phone, Email)
- Order tracking and status updates

## 🚀 Deployment

The platform is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS**
- **Digital Ocean**

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for modern service marketplaces**