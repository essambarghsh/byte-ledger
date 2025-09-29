# 🤝 Contributing to ByteLedger

Thank you for your interest in contributing to ByteLedger! We welcome contributions from developers of all skill levels. This guide will help you get started with contributing to our modern invoice and sales management system.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [API Guidelines](#api-guidelines)
- [UI/UX Guidelines](#uiux-guidelines)
- [Internationalization](#internationalization)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Security](#security)
- [Getting Help](#getting-help)

## 📜 Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and professional in all interactions.

### Our Standards

- **Be respectful** - Treat everyone with respect and kindness
- **Be inclusive** - Welcome newcomers and help them learn
- **Be collaborative** - Work together towards common goals
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Remember that everyone has different experience levels

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- A code editor (VS Code recommended)

### First-time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/byte-ledger.git
   cd byte-ledger
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/essambarghsh/byte-ledger.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Initialize the data structure**:
   ```bash
   npm run setup
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🛠️ Development Setup

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Application settings
NEXT_PUBLIC_APP_NAME=ByteLedger
NEXT_PUBLIC_DEFAULT_LOCALE=ar

# Development settings
NODE_ENV=development

# Storage settings (optional)
# STORAGE_PROVIDER=local
```

### Recommended VS Code Extensions

- **TypeScript** - Enhanced TypeScript support
- **ES7+ React/Redux/React-Native snippets** - Useful code snippets
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags

### Development Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Initialize data structure
npm run setup
```

## 📁 Project Structure

Understanding the project structure is crucial for effective contribution:

```
byte-ledger/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── archives/      # Archive management endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── employees/     # Employee management endpoints
│   │   ├── invoices/      # Invoice management endpoints
│   │   └── settings/      # Application settings endpoints
│   ├── dashboard/         # Dashboard pages
│   ├── history/           # Archive history pages
│   ├── settings/          # Settings pages
│   ├── test/              # Test utilities page
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── icons/            # Custom icon components
│   └── *.tsx             # Feature-specific components
├── data/                  # JSON data storage
│   ├── archives/         # Archived data files
│   ├── storage/          # File uploads (avatars)
│   ├── archives.json     # Archive metadata
│   ├── employees.json    # Employee data
│   ├── invoices.json     # Invoice data
│   └── settings.json     # Application settings
├── dictionaries/          # i18n translations
│   ├── en.json           # English translations
│   └── ar.json           # Arabic translations
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── data-access.ts    # Data access layer
│   ├── session.ts        # Session management
│   ├── date-utils.ts     # Date utilities
│   ├── i18n.ts           # Internationalization
│   └── utils.ts          # General utilities
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

### Key Architecture Patterns

- **File-based Routing** - Using Next.js App Router
- **Server Components** - Leveraging React Server Components
- **API Routes** - RESTful API design with Next.js route handlers
- **Component Composition** - Reusable UI components with Radix UI
- **Type Safety** - Comprehensive TypeScript usage
- **File-based Storage** - JSON files for data persistence (easily extensible)

## 🔄 Development Workflow

### Branch Naming Convention

Use descriptive branch names that follow this pattern:

- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation updates
- `refactor/description` - For code refactoring
- `chore/description` - For maintenance tasks

Examples:
- `feature/employee-bulk-import`
- `fix/invoice-date-validation`
- `docs/api-documentation`

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(invoices): add bulk invoice creation functionality

fix(auth): resolve session expiration issue

docs(api): update employee endpoints documentation

refactor(components): extract reusable table component
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if necessary
5. **Run linting** with `npm run lint`
6. **Commit your changes** with descriptive messages
7. **Push to your fork** and create a pull request
8. **Respond to feedback** and make requested changes

## 💻 Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Define interfaces** for all data structures
- **Use proper typing** - avoid `any` type
- **Export types** from `types/index.ts`
- **Use generic types** where appropriate

```typescript
// ✅ Good
interface CreateInvoiceRequest {
  customerName: string | null
  amount: number
  description: string | null
  transactionType: string
}

// ❌ Avoid
const createInvoice = (data: any) => {
  // ...
}
```

### React Component Guidelines

- **Use functional components** with hooks
- **Prefer Server Components** when possible
- **Use proper prop types** with TypeScript interfaces
- **Follow component naming** with PascalCase
- **Keep components focused** - single responsibility

```tsx
// ✅ Good
interface InvoiceCardProps {
  invoice: Invoice
  onStatusChange: (id: string, status: Invoice['status']) => void
}

export function InvoiceCard({ invoice, onStatusChange }: InvoiceCardProps) {
  return (
    <Card>
      {/* Component content */}
    </Card>
  )
}

// ❌ Avoid
export function InvoiceCard(props: any) {
  // ...
}
```

### CSS and Styling Guidelines

- **Use Tailwind CSS** for styling
- **Follow mobile-first** approach
- **Use consistent spacing** (Tailwind spacing scale)
- **Implement dark mode** support when applicable
- **Use semantic color names** from the design system

```tsx
// ✅ Good
<div className="flex flex-col gap-4 p-6 bg-card text-card-foreground rounded-lg border">
  <h2 className="text-2xl font-semibold">Invoice Details</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Content */}
  </div>
</div>

// ❌ Avoid
<div style={{ backgroundColor: '#ffffff', padding: '24px' }}>
  {/* Content */}
</div>
```

### API Route Guidelines

- **Follow RESTful conventions**
- **Use proper HTTP status codes**
- **Implement error handling**
- **Validate request data**
- **Return consistent response formats**

```typescript
// ✅ Good
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.name || !body.amount) {
      return NextResponse.json(
        { error: 'Name and amount are required' },
        { status: 400 }
      )
    }
    
    // Process request
    const result = await createInvoice(body)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### File Organization

- **Group related files** together
- **Use index files** for clean imports
- **Keep components small** and focused
- **Separate concerns** (UI, logic, data)
- **Use descriptive file names**

## 🧪 Testing Guidelines

### Testing Philosophy

- **Test user behavior** rather than implementation details
- **Focus on critical paths** and edge cases
- **Keep tests simple** and maintainable
- **Mock external dependencies** appropriately

### Testing Structure

```
__tests__/
├── components/
│   ├── InvoiceCard.test.tsx
│   └── EmployeeSelection.test.tsx
├── lib/
│   ├── data-access.test.ts
│   └── date-utils.test.ts
└── api/
    ├── invoices.test.ts
    └── employees.test.ts
```

### Writing Tests

```typescript
// Example component test
import { render, screen } from '@testing-library/react'
import { InvoiceCard } from '@/components/invoice-card'

describe('InvoiceCard', () => {
  it('displays invoice information correctly', () => {
    const mockInvoice = {
      id: '1',
      customerName: 'John Doe',
      amount: 100,
      status: 'paid' as const,
      // ... other required fields
    }
    
    render(<InvoiceCard invoice={mockInvoice} onStatusChange={jest.fn()} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})
```

## 🔌 API Guidelines

### Endpoint Design

- **Use noun-based URLs** for resources
- **Use HTTP verbs** appropriately
- **Implement proper status codes**
- **Support filtering and pagination** where needed
- **Version APIs** when necessary

### API Response Format

```typescript
// Success response
{
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error response
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* additional error details */ }
}

// List response
{
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Authentication

- **Use session-based auth** for the current implementation
- **Validate sessions** on protected routes
- **Handle session expiration** gracefully
- **Implement proper logout** functionality

## 🎨 UI/UX Guidelines

### Design Principles

- **Mobile-first** - Design for mobile, enhance for desktop
- **Accessibility** - Follow WCAG guidelines
- **Consistency** - Use the established design system
- **Performance** - Optimize for fast loading
- **User feedback** - Provide clear feedback for actions

### Component Guidelines

- **Use shadcn/ui components** as the foundation
- **Extend components** when needed
- **Maintain design consistency**
- **Support dark mode** where applicable
- **Implement proper loading states**

### Responsive Design

```tsx
// ✅ Good - Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

// ✅ Good - Responsive text sizing
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Page Title
</h1>
```

## 🌍 Internationalization

### Adding New Languages

1. **Create translation file** in `dictionaries/[locale].json`
2. **Follow existing structure** from `en.json`
3. **Update type definitions** if needed
4. **Test RTL support** for Arabic-like languages

### Translation Guidelines

- **Use meaningful keys** that describe the content
- **Group related translations** logically
- **Support pluralization** where needed
- **Consider cultural context** in translations

```json
{
  "dashboard": {
    "title": "Dashboard",
    "salesToday": "Sales Today",
    "salesYesterday": "Sales Yesterday",
    "actions": {
      "addInvoice": "Add Invoice",
      "archiveData": "Archive Data"
    }
  }
}
```

## 📤 Submitting Changes

### Pre-submission Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation have been made
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or the feature works
- [ ] New and existing unit tests pass locally

### Pull Request Template

When creating a pull request, include:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information or context.
```

## 🐛 Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, browser, Node.js version)
5. **Screenshots or videos** if applicable
6. **Error messages** or console logs

### Feature Requests

When requesting features:

1. **Describe the problem** you're trying to solve
2. **Explain the proposed solution**
3. **Consider alternative solutions**
4. **Provide use cases** and examples
5. **Discuss potential impact** on existing functionality

### Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `feature` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority issue
- `priority: low` - Low priority issue

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public issue
2. **Email** security concerns to: contact@esssam.com
3. **Include** detailed steps to reproduce
4. **Wait** for confirmation before public disclosure

### Security Best Practices

- **Validate all inputs** on both client and server
- **Sanitize data** before storage or display
- **Use HTTPS** in production
- **Keep dependencies updated**
- **Follow OWASP guidelines**

## 🆘 Getting Help

### Community Resources

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and general discussion
- **Documentation** - Check the README and code comments

### Contact

- **Project Maintainer**: Essam Barghsh
- **Email**: contact@esssam.com
- **Website**: https://www.esssam.com
- **GitHub**: @essambarghsh

### Response Times

- **Bug reports**: Within 48 hours
- **Feature requests**: Within 1 week
- **Pull requests**: Within 72 hours
- **Security issues**: Within 24 hours

## 🎉 Recognition

Contributors will be recognized in several ways:

- **Contributors list** in the README
- **Release notes** mention significant contributions
- **GitHub profile** contributions graph
- **Special thanks** for major features or fixes

## 📚 Additional Resources

### Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

### Tools and Extensions

- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [TypeScript Error Translator](https://ts-error-translator.vercel.app/)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

Thank you for contributing to ByteLedger! Your efforts help make this project better for everyone. 🚀

**Happy coding!** 💻✨
