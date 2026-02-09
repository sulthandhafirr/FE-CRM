# FE-CRM - Capstone CRM Frontend

Customer Relationship Management (CRM) application frontend built with React, Vite, and Supabase.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run development server
npm run dev
```

Application will run at: **http://localhost:5173**

---

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher  
- **Supabase** account and project

Check your versions:
```bash
node --version
npm --version
```

---

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages (~200MB including dependencies):

**Production:**
- React 19.2.0 & React-DOM
- React Router DOM 7.13.0
- Supabase JS 2.91.1
- Material-UI 7.3.7
- Tailwind CSS 4.1.18
- Axios 1.13.3

**Development:**
- Vite 7.2.4
- ESLint 9.39.1
- TypeScript types

### 2. Configure Environment

Create `.env` file in root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...your-key
```

**Get Supabase credentials:**
1. Login to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy **Project URL** and **anon/public key**

⚠️ **Important:** Don't commit `.env` to version control!

### 3. Run Application

```bash
# Development mode with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check code quality
npm run lint
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 7.2.4 | Build Tool & Dev Server |
| React Router | 7.13.0 | Client-side Routing |
| Supabase | 2.91.1 | Authentication & Backend |
| Material-UI | 7.3.7 | UI Component Library |
| Tailwind CSS | 4.1.18 | Utility-first CSS |
| Axios | 1.13.3 | HTTP Client |
| ESLint | 9.39.1 | Code Quality |

---

## 📁 Project Structure

```
FE-CRM/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx      # Global auth state
│   ├── hooks/
│   │   └── useAuth.js           # Auth custom hook
│   ├── lib/
│   │   └── supabase.js          # Supabase client config
│   ├── pages/
│   │   ├── AuthTest.jsx         # Login page
│   │   └── MainPage.jsx         # Dashboard (protected)
│   ├── router/
│   │   ├── Router.jsx           # Route definitions
│   │   └── routes.js            # Route constants
│   ├── assets/                  # Images, icons
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static files
├── .env                         # Environment (create this!)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── vite.config.js               # Vite configuration
└── eslint.config.js             # ESLint rules
```

---

## 🎯 Features

- ✅ **Authentication** - Supabase Auth dengan email/password
- ✅ **Protected Routes** - Auto-redirect untuk unauthorized access
- ✅ **State Management** - Context API untuk global state
- ✅ **Modern UI** - Material-UI + Tailwind CSS
- ✅ **Fast Development** - Vite HMR (Hot Module Replacement)
- ✅ **Code Quality** - ESLint dengan React rules
- ✅ **Responsive** - Mobile-friendly design

---

## 🌐 Routes

| Path | Access | Description |
|------|--------|-------------|
| `/login` | Public | Login page |
| `/main` | Protected | Main dashboard (requires authentication) |
| `/*` | - | Redirect to `/login` |

---

## 🏗️ Architecture

### Authentication Flow
```
Login Page → Supabase Auth → Success → Redirect to /main
                           → Failed  → Show error message
```

### Protected Routes
```
User not logged in → Redirect to /login
User logged in     → Access granted
```

### State Management
```
AuthContext (Provider) → useAuth() hook → Components
```

---

## 🔑 Key Components

### `AuthContext.jsx`
Global authentication state using React Context API. Manages user session and provides auth state to all components.

### `useAuth.js`
Custom hook for accessing authentication context. Use this in any component that needs user data:
```jsx
const { user, loading } = useAuth();
```

### `supabase.js`
Supabase client configuration. Initializes connection using environment variables.

### `Router.jsx`
Route definitions with protected route wrapper. Handles authentication checks and redirects.

---

## 📚 Dependencies Guide

### Core Dependencies

**React (19.2.0)**
- Core UI library
- Hooks: `useState`, `useEffect`, `useContext`
- [Documentation](https://react.dev)

**Vite (7.2.4)**
- Lightning-fast build tool
- HMR for instant updates
- Optimized production builds
- [Documentation](https://vite.dev)

**Supabase (2.91.1)**
- Backend as a Service
- Authentication & database
- Real-time capabilities
- [Documentation](https://supabase.com/docs)

**Material-UI (7.3.7)**
- Material Design components
- 2000+ icons available
- Customizable theme
- [Documentation](https://mui.com)

**Tailwind CSS (4.1.18)**
- Utility-first CSS framework
- Rapid UI development
- Auto-purge unused styles
- [Documentation](https://tailwindcss.com)

**React Router (7.13.0)**
- Client-side routing
- Nested routes support
- Navigation hooks
- [Documentation](https://reactrouter.com)

**Axios (1.13.3)**
- Promise-based HTTP client
- Request/response interceptors
- Automatic JSON transformation
- [Documentation](https://axios-http.com)

### Development Dependencies

**ESLint (9.39.1)**
- Code quality enforcement
- React-specific rules
- Auto-fix capabilities

**TypeScript Types**
- Better IDE intellisense
- Type definitions for React & React-DOM

---

## 🐛 Troubleshooting

### Port Already in Use
Vite will automatically use next available port (5173 → 5174 → 5175...)

### Module Not Found
```bash
# Reinstall dependencies
npm install

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Error
- ✓ Check `.env` file exists
- ✓ Verify credentials are correct
- ✓ Ensure Supabase project is active
- ✓ Check environment variables start with `VITE_`

### Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run dev
```

### ESLint Errors
```bash
# Check issues
npm run lint

# Auto-fix
npx eslint . --fix
```

---

## 💡 Development Tips

1. **Hot Module Replacement** - Changes reflect instantly without full reload
2. **Component Import** - Import only what you need from MUI:
   ```jsx
   import { Button } from '@mui/material';  // ✓ Good
   import * as MUI from '@mui/material';     // ✗ Bad (large bundle)
   ```
3. **Environment Variables** - Always prefix with `VITE_` for Vite access
4. **Code Quality** - Run `npm run lint` before committing
5. **Auth Hook** - Use `useAuth()` instead of directly accessing context

---

## 🔒 Security

- Environment variables stored in `.env` (gitignored)
- Supabase publishable key safe for frontend
- Configure Row Level Security (RLS) in Supabase
- Never commit `.env` file
- Use `HTTPS` in production

---

## 📊 Performance

- **Vite** - Native ES modules for fast dev server
- **Tree-shaking** - Removes unused code in production
- **Code-splitting** - Automatic route-based splitting
- **Lazy loading** - Import components on-demand
- **CSS purging** - Tailwind removes unused styles

---

## 🔄 Version Management

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit
npm audit fix
```

---

## 📖 Additional Resources

- **React:** https://react.dev
- **Vite:** https://vite.dev  
- **Supabase:** https://supabase.com/docs
- **Material-UI:** https://mui.com
- **Tailwind:** https://tailwindcss.com
- **React Router:** https://reactrouter.com

---

## 📄 License

Private - Capstone Project 2026

---

**Last Updated:** February 1, 2026
