# 📊 ByteLedger - Modern Invoice & Sales Management System

<div align="center">

**A powerful, modern invoice and sales management application built with Next.js 15 and TypeScript**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[🚀 Live Demo](https://byte-ledger.vercel.app) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/essambarghsh/byte-ledger/issues) • [✨ Request Feature](https://github.com/essambarghsh/byte-ledger/issues)

</div>

## 🌟 Overview

ByteLedger is a comprehensive invoice and sales management system designed for modern businesses. Built with cutting-edge technologies like Next.js 15, React 19, and TypeScript, it provides a seamless experience for managing invoices, tracking sales, and handling employee operations with multi-language support.

### ✨ Key Features

- **📋 Invoice Management** - Create, edit, and track invoices with real-time status updates
- **👥 Employee Management** - Multi-user support with avatar management and role-based access
- **📊 Sales Analytics** - Real-time sales tracking with daily, weekly, and monthly reports
- **🗄️ Data Archiving** - Automated data archiving system with historical data preservation
- **🌍 Multi-language Support** - Built-in internationalization (i18n) with Arabic and English support
- **📱 Responsive Design** - Mobile-first design that works seamlessly across all devices
- **⚡ High Performance** - Built with Next.js 15 and Turbopack for lightning-fast performance
- **🎨 Modern UI/UX** - Beautiful interface built with Radix UI and Tailwind CSS
- **💾 File-based Storage** - Simple JSON-based data storage (easily extensible to databases)
- **🔒 Session Management** - Secure employee authentication and session handling

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/essambarghsh/byte-ledger.git
   cd byte-ledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Initialize data structure**
   ```bash
   npm run setup
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend & Framework
- **[Next.js 15.5.3](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19.1.0](https://reactjs.org/)** - Latest React with concurrent features and Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework with modern features

### UI Components & Design
- **[Radix UI](https://www.radix-ui.com/)** - Headless, accessible UI components
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library built on Radix UI
- **[Lucide React](https://lucide.dev/)** - Beautiful SVG icon library
- **[Class Variance Authority](https://cva.style/docs)** - Component variant management
- **[Tailwind Merge](https://github.com/dcastil/tailwind-merge)** - Utility for merging Tailwind classes

### State Management & Data
- **[React Hooks](https://react.dev/reference/react)** - Built-in state management with useState, useEffect
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Server-side API endpoints
- **File-based Storage** - JSON-based data persistence (easily extensible to databases)
- **[UUID](https://github.com/uuidjs/uuid)** - Unique identifier generation

### Utilities & Libraries
- **[date-fns](https://date-fns.org/)** - Modern date utility library
- **[js-cookie](https://github.com/js-cookie/js-cookie)** - Simple cookie handling
- **[Sonner](https://sonner.emilkowal.ski/)** - Beautiful toast notifications
- **[CLSX](https://github.com/lukeed/clsx)** - Utility for constructing className strings
- **[CMDK](https://cmdk.paco.me/)** - Command menu component

### Development & Build Tools
- **[ESLint 9](https://eslint.org/)** - Modern JavaScript linting
- **[Turbopack](https://turbo.build/pack)** - Ultra-fast bundler for development and production
- **[PostCSS](https://postcss.org/)** - CSS processing and transformation
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - Theme management for Next.js

### Internationalization & Accessibility
- **Custom i18n System** - Built-in internationalization with Arabic and English support
- **RTL Support** - Right-to-left language support for Arabic
- **WCAG Compliance** - Accessibility-first component design with Radix UI

## 📁 Project Structure

```
byte-ledger/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── archives/      # Archive management endpoints
│   │   ├── auth/          # Authentication (login/logout/session)
│   │   ├── avatars/       # Avatar file serving
│   │   ├── employees/     # Employee management endpoints
│   │   ├── invoices/      # Invoice CRUD operations
│   │   ├── settings/      # Application settings
│   │   └── test-date/     # Development utilities
│   ├── dashboard/         # Main dashboard pages
│   │   ├── account/       # Account management
│   │   └── users/         # User management
│   ├── history/           # Archive browsing and details
│   ├── settings/          # Application settings UI
│   ├── test/              # Development testing tools
│   ├── layout.tsx         # Root layout with i18n support
│   ├── page.tsx           # Landing/authentication page
│   └── globals.css        # Global styles and Tailwind imports
├── components/            # React components
│   ├── ui/               # shadcn/ui reusable components
│   ├── icons/            # Custom SVG icon components
│   ├── *-page.tsx        # Page-specific components
│   ├── *-modal.tsx       # Modal components
│   └── *.tsx             # Feature-specific components
├── data/                  # File-based data storage
│   ├── archives/         # Daily archived data snapshots
│   ├── storage/          # File uploads (employee avatars)
│   │   └── buckets/      # Organized file storage
│   ├── archives.json     # Archive metadata index
│   ├── employees.json    # Employee profiles and data
│   ├── invoices.json     # Invoice transactions
│   └── settings.json     # Application configuration
├── dictionaries/          # Internationalization
│   ├── en.json           # English translations
│   └── ar.json           # Arabic translations (RTL support)
├── hooks/                 # Custom React hooks
├── lib/                   # Core utilities and business logic
│   ├── data-access.ts    # Data layer abstraction
│   ├── session.ts        # Session management utilities
│   ├── date-utils.ts     # Date formatting and manipulation
│   ├── i18n.ts           # Internationalization helpers
│   └── utils.ts          # General utility functions
├── types/                 # TypeScript type definitions
│   └── index.ts          # Core application types
├── contexts/              # React context providers
└── public/               # Static assets and icons
```

## 🎯 Core Features

### 📋 Invoice Management
- **Create & Edit Invoices** - Comprehensive invoice creation with customer details
- **Transaction Types** - Customizable transaction categories and types
- **Status Tracking** - Monitor invoice status (paid, pending, canceled)
- **Real-time Updates** - Instant status changes and notifications
- **Employee Attribution** - Track which employee created each invoice
- **Amount Validation** - Built-in validation for monetary amounts
- **Date Management** - Automatic timestamp tracking for all transactions

### 👥 Employee Management System
- **Multi-employee Support** - Handle multiple staff members simultaneously
- **Profile Management** - Individual employee profiles with custom information
- **Avatar Upload & Storage** - Image upload system with file management
- **Session-based Authentication** - Secure login system without external dependencies
- **Activity Tracking** - Monitor employee actions and invoice creation
- **Role-based Access** - Different access levels for different employees
- **Account Management** - Employee account settings and preferences

### 📊 Sales Analytics & Reporting
- **Daily Sales Tracking** - Real-time daily sales calculations
- **Opening Balance Management** - Track daily opening amounts
- **Historical Comparisons** - Compare current vs previous day sales
- **Archive-based Reporting** - Generate reports from archived data
- **Transaction Analysis** - Detailed breakdown of all transactions
- **Performance Metrics** - Employee and overall performance tracking

### 🗄️ Advanced Data Archiving
- **Automated Daily Archives** - Scheduled data archiving system
- **Historical Data Preservation** - Long-term data storage and retrieval
- **Archive Browsing** - User-friendly interface to explore past data
- **Data Integrity** - Checksums and validation for archived data
- **Snapshot Management** - Complete daily business state snapshots
- **Archive Search** - Find specific archived records quickly
- **Data Export** - Export archived data in various formats

### 🌐 Multi-language & Localization
- **Bilingual Support** - English and Arabic language support
- **RTL Layout** - Right-to-left text support for Arabic
- **Dynamic Language Switching** - Change language without page reload
- **Localized Formatting** - Currency, dates, and numbers formatted per locale
- **Cultural Adaptation** - UI elements adapted for different cultures

### ⚙️ System Configuration
- **Settings Management** - Comprehensive application configuration
- **Transaction Type Customization** - Define custom transaction categories
- **Timezone Configuration** - Support for different timezones
- **Archive Options** - Configurable archiving behavior
- **Storage Management** - File storage configuration and management

### 🔧 Developer Features
- **Test Tools** - Built-in testing utilities for development
- **API Documentation** - Well-documented REST API endpoints
- **Development Mode** - Enhanced debugging and development features
- **Hot Reload** - Instant updates during development with Turbopack
- **Type Safety** - Comprehensive TypeScript coverage

## 🌐 Internationalization

ByteLedger supports multiple languages out of the box:

- **English (en)** - Default language
- **Arabic (ar)** - RTL support included

Adding new languages is straightforward by adding translation files to the `dictionaries/` folder.

## 🔌 API Endpoints

ByteLedger provides a comprehensive REST API for all core functionality:

### Authentication & Session Management
- `POST /api/auth/login` - Employee authentication
- `POST /api/auth/logout` - Session termination  
- `POST /api/auth/update-session` - Update session data

### Employee Management
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee information
- `DELETE /api/employees/[id]` - Remove employee
- `POST /api/employees/[id]/avatar` - Upload employee avatar

### Invoice Operations
- `GET /api/invoices` - List invoices with filtering
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Archive Management
- `GET /api/archives` - List all archives
- `POST /api/archives` - Create new archive
- `GET /api/archives/[filename]` - Get archive details
- `DELETE /api/archives/[filename]` - Delete archive

### Settings & Configuration
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings

### File Management
- `GET /api/avatars/[filename]` - Serve avatar images
- `POST /api/avatars` - Upload new avatar

All API endpoints return JSON responses and follow RESTful conventions with appropriate HTTP status codes.

## 📸 Screenshots

*Coming soon - Screenshots will be added to showcase the application's interface*

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application settings
NEXT_PUBLIC_APP_NAME=ByteLedger
NEXT_PUBLIC_DEFAULT_LOCALE=ar

# Storage settings (if using external storage)
# STORAGE_PROVIDER=local
```

### Customization

- **Theme**: Modify `tailwind.config.js` for custom themes
- **Components**: Extend UI components in `components/ui/`
- **Translations**: Add new languages in `dictionaries/`
- **Data Storage**: Extend `lib/data-access.ts` for database integration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with default settings

### Docker

```bash
# Build the image
docker build -t byte-ledger .

# Run the container
docker run -p 3000:3000 byte-ledger
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Roadmap

### 🚀 Version 1.0 (Current Features)
- [x] **Core Invoice Management** - Create, edit, and track invoices
- [x] **Employee System** - Multi-user support with avatars
- [x] **Data Archiving** - Automated daily data archiving
- [x] **Multi-language Support** - English and Arabic with RTL
- [x] **Session Management** - Secure authentication system
- [x] **File-based Storage** - JSON-based data persistence
- [x] **Responsive Design** - Mobile-first UI/UX
- [x] **Settings Management** - Configurable application settings

### 🔮 Version 1.1 (Planned)
- [ ] **Enhanced Analytics** - Charts and visual reporting dashboard
- [ ] **Data Export** - PDF and CSV export functionality
- [ ] **Bulk Operations** - Mass invoice operations and imports
- [ ] **Advanced Search** - Complex filtering and search capabilities
- [ ] **Audit Logs** - Detailed activity tracking and logging
- [ ] **Backup System** - Automated data backup and recovery

### 🌟 Version 2.0 (Future)
- [ ] **Database Integration** - PostgreSQL/MySQL/SQLite support
- [ ] **API Documentation** - OpenAPI/Swagger integration
- [ ] **Advanced Authentication** - OAuth, 2FA, and role-based permissions
- [ ] **Cloud Storage** - AWS S3/Google Cloud integration for files
- [ ] **Real-time Notifications** - WebSocket-based live updates
- [ ] **Plugin System** - Extensible architecture for third-party integrations

### 📱 Mobile & Integration (Long-term)
- [ ] **Progressive Web App** - Enhanced mobile experience
- [ ] **Mobile App** - React Native companion application
- [ ] **Webhook Support** - Integration with external services
- [ ] **Third-party Integrations** - Accounting software connections
- [ ] **Multi-tenant Support** - Support for multiple businesses
- [ ] **Advanced Reporting** - Business intelligence and analytics

## 🐛 Known Issues

- None currently reported

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Essam Barghsh**
- Website: [https://www.esssam.com](https://www.esssam.com)
- Email: [contact@esssam.com](mailto:contact@esssam.com)
- GitHub: [@essambarghsh](https://github.com/essambarghsh)
- LinkedIn: [@essambarghsh](https://linkedin.com/in/essambarghsh)
- Twitter: [@essambarghsh](https://twitter.com/essambarghsh)

*Full-stack developer passionate about creating modern, accessible web applications with clean architecture and excellent user experience.*

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/team) for the amazing framework
- [Vercel](https://vercel.com) for hosting and deployment platform
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- Open source community for inspiration and contributions

## ⭐ Support

If you found this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing to the codebase
- 📢 Sharing with others

---

<div align="center">

**Made with ❤️ by [Essam Barghsh](https://www.esssam.com)**

[⬆ Back to Top](#-byteledger---modern-invoice--sales-management-system)

</div>
