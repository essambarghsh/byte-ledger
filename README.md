# ByteLedger - بايت ليدجر

A modern sales management system built with Next.js, featuring Arabic-first internationalization and clean, intuitive design.

## 🚀 Features

- **Multi-language Support**: Arabic (default) and English with RTL support
- **Employee Management**: Simple login system with employee selection
- **Sales Tracking**: Add, edit, and delete daily sales records
- **Archive System**: Automatically archive daily sales and view historical data
- **Revenue Analytics**: Track today's and yesterday's revenue
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support

## 📋 Requirements

- Node.js 18+
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
byte-ledger/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── archive/        # Archive page
│   │   ├── layout.tsx      # Locale layout
│   │   └── page.tsx        # Home page
│   ├── api/                # API routes
│   │   ├── employees/      # Employee management
│   │   ├── sales/          # Sales CRUD operations
│   │   ├── archive/        # Archive operations
│   │   └── revenue/        # Revenue calculations
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── Dashboard.tsx       # Main dashboard
│   ├── EmployeeLogin.tsx   # Employee selection
│   ├── SalesTable.tsx      # Sales data table
│   ├── SalesForm.tsx       # Add/edit sales form
│   └── LanguageSwitcher.tsx # Language toggle
├── data/                   # JSON data files
│   ├── employees.json      # Employee data
│   ├── sales.json          # Current day sales
│   └── archive-*.json      # Archived daily sales
├── lib/                    # Utilities and types
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # File operations
├── messages/               # Translations
│   ├── ar.json             # Arabic translations
│   └── en.json             # English translations
├── i18n.ts                 # i18n configuration
└── middleware.ts           # Next.js middleware
```

## 💼 Usage

### Employee Login
- Select an employee from the main screen to access the dashboard
- Default employees: Ahmed (أحمد), Hamdy (حمدي), Yassin (ياسين)

### Managing Sales
- Add new sales with operation type, customer info, and payment details
- Edit existing sales by clicking the edit button
- Delete sales with confirmation
- View today's total revenue and yesterday's comparison

### Day Management
- Click "Close Day" to archive all sales and reset for a new day
- Archived data includes all sales and total revenue

### Archive
- Navigate to the Archive page to view historical sales data
- Select any date to load archived sales records
- View detailed sales information and revenue totals

### Language Support
- Toggle between Arabic (العربية) and English
- Full RTL support for Arabic interface
- All text, numbers, and dates are properly localized

## 🔧 API Endpoints

- `GET /api/employees` - Get all employees
- `GET /api/sales` - Get today's sales
- `POST /api/sales` - Add new sale
- `PUT /api/sales/[id]` - Update sale
- `DELETE /api/sales/[id]` - Delete sale
- `POST /api/archive` - Archive current day
- `GET /api/archive/[date]` - Get archived data for date
- `GET /api/revenue` - Get revenue comparison

## 🎨 Styling

- Tailwind CSS for styling
- Custom RTL support
- Responsive design
- Arabic font optimization
- Modern glassmorphism effects

## 🌐 Internationalization

Built with next-intl:
- Arabic (ar) - Default language
- English (en) - Secondary language
- RTL/LTR support
- Localized date/currency formatting

## 📝 Data Structure

### Employee
```typescript
interface Employee {
  id: number;
  name: string;        // Arabic name
  nameEn: string;      // English name
}
```

### Sale
```typescript
interface Sale {
  id: string;
  operationType: 'product-sale' | 'package-renewal';
  customerName: string;
  paymentStatus: 'paid' | 'partially-paid' | 'not-paid';
  amountPaid: number;
  amountUnpaid: number;
  employeeId: number;
  createdAt: string;
}
```

## 🚀 Production Build

```bash
npm run build
npm start
```

## 📄 License

This project is open source and available under the MIT License.