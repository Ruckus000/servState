# Plan: Build ServState Mortgage Application from Scratch

## Overview

This plan provides **EXTREMELY DETAILED** step-by-step instructions to build a mortgage servicing application from the ground up. The application will be built as a single HTML file using React via CDN, suitable for rapid prototyping.

**Target**: Build basic framework first, then complete the borrower-facing interface before moving to servicer tools.

**Critical Constraint**: Instructions must be precise and unambiguous. Each step specifies EXACT code to write, WHERE to place it, and WHAT it should accomplish.

---

## Phase 1: Foundation & Basic Framework

### Step 1.1: Create Base HTML Structure

**File**: Create `index.html` in the project root

**Exact Code to Write**:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ServState | Mortgage Servicing</title>

    <!-- React 18 from CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

    <!-- Babel for JSX transformation -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Google Font -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Validation**: File must be exactly 26 lines. All CDN URLs must be present.

---

### Step 1.2: Configure Tailwind Theme

**File**: `index.html`
**Location**: Inside `<head>` tag, AFTER Tailwind script tag, BEFORE closing `</head>`

**Exact Code to Write**:

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        },
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
        },
      },
    },
  }
</script>
```

**Validation**: Config must define custom color palette using CSS variables.

---

### Step 1.3: Define CSS Variables

**File**: `index.html`
**Location**: Inside `<head>` tag, AFTER Tailwind config, BEFORE closing `</head>`

**Exact Code to Write**:

```html
<style>
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
</style>
```

**Validation**: Must define exactly 17 CSS variables. Body must reference Plus Jakarta Sans font.

---

### Step 1.4: Create Basic React Structure

**File**: `index.html`
**Location**: BEFORE closing `</body>` tag

**Exact Code to Write**:

```html
<script type="text/babel">
  const { useState, useEffect, useMemo } = React

  // ============ MAIN APP COMPONENT ============
  const App = () => {
    const [viewMode, setViewMode] = useState('borrower') // 'borrower' or 'servicer'

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">ServState</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {viewMode === 'borrower' ? 'Borrower Portal' : 'Servicer Portal'}
                </span>
                <button
                  onClick={() => setViewMode(viewMode === 'borrower' ? 'servicer' : 'borrower')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                >
                  Switch to {viewMode === 'borrower' ? 'Servicer' : 'Borrower'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-2">
              {viewMode === 'borrower' ? 'Borrower Dashboard' : 'Servicer Dashboard'}
            </h2>
            <p className="text-muted-foreground">
              Application framework loaded successfully
            </p>
          </div>
        </main>
      </div>
    )
  }

  // ============ RENDER APP ============
  ReactDOM.createRoot(document.getElementById('root')).render(<App />)
</script>
```

**Validation**:
- App component must use `useState` hook for viewMode
- Must have header with "ServState" title
- Must have switch button to toggle between borrower/servicer
- Main area shows current mode

**Checkpoint**: Open `index.html` in browser. You should see:
- Blue "ServState" header
- A button that toggles between "Borrower Portal" and "Servicer Portal"
- Content area showing current mode

---

## Phase 2: UI Component Library

**CRITICAL**: All components in this phase must be added INSIDE the `<script type="text/babel">` tag, BEFORE the `App` component definition.

### Step 2.1: Create Icon Component

**File**: `index.html`
**Location**: Inside `<script type="text/babel">`, BEFORE `const App =`

**Exact Code to Write**:

```javascript
// ============ UI COMPONENTS ============

const Icon = ({ name, size = 20, className = '', ...props }) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  return React.createElement('i', {
    'data-lucide': name,
    className: className,
    style: { width: size, height: size },
    ...props,
  })
}
```

**Validation**:
- Component must use React.createElement (NOT JSX)
- Must call lucide.createIcons() in useEffect
- Must accept name, size, className props

---

### Step 2.2: Create Button Component

**File**: `index.html`
**Location**: AFTER Icon component, BEFORE `const App =`

**Exact Code to Write**:

```javascript
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  }

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Validation**:
- Must support 5 variants: default, secondary, outline, ghost, destructive
- Must support 3 sizes: default, sm, lg
- Must merge className prop

---

### Step 2.3: Create Card Component

**File**: `index.html`
**Location**: AFTER Button component, BEFORE `const App =`

**Exact Code to Write**:

```javascript
const Card = ({ children, className = '', hover = false }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 ${
      hover ? 'transition-shadow hover:shadow-md cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </div>
)
```

**Validation**:
- Must have rounded corners, border, shadow
- Must support optional hover effect
- Must accept children and className

---

### Step 2.4: Create Input Component

**File**: `index.html`
**Location**: AFTER Card component, BEFORE `const App =`

**Exact Code to Write**:

```javascript
const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)
```

**Validation**:
- Must have focus ring styling
- Must support disabled state
- Must handle file inputs

---

### Step 2.5: Create Badge Component

**File**: `index.html`
**Location**: AFTER Input component, BEFORE `const App =`

**Exact Code to Write**:

```javascript
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'text-foreground border border-input',
    success: 'bg-green-500 text-white',
    warning: 'bg-amber-500 text-white',
    destructive: 'bg-destructive text-destructive-foreground',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
```

**Validation**:
- Must support 6 variants
- Must be inline-flex with rounded-full
- Text must be xs size

---

### Step 2.6: Create Modal Component

**File**: `index.html`
**Location**: AFTER Badge component, BEFORE `const App =`

**Exact Code to Write**:

```javascript
const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-card rounded-lg shadow-lg ${maxWidth} w-full mx-4 p-6 z-10 animate-in fade-in duration-200`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
```

**Validation**:
- Must render nothing if `open` is false
- Must have dark backdrop that closes modal on click
- Must have header with title and X button
- Modal content must be centered and have max-width

---

**Checkpoint**: Update the App component to test these components:

```javascript
const App = () => {
  const [viewMode, setViewMode] = useState('borrower')
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">ServState</h1>
            <Button onClick={() => setViewMode(viewMode === 'borrower' ? 'servicer' : 'borrower')}>
              Switch to {viewMode === 'borrower' ? 'Servicer' : 'Borrower'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Card>
            <h2 className="text-2xl font-bold mb-2">Component Test</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost"><Icon name="settings" size={16} className="mr-2" />Ghost</Button>
              </div>
              <div className="flex gap-2">
                <Badge>Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
              <Input placeholder="Enter text..." />
              <Button onClick={() => setShowModal(true)}>Open Modal</Button>
            </div>
          </Card>
        </div>
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Test Modal">
        <p>This is a test modal. Click the X or backdrop to close.</p>
      </Modal>
    </div>
  )
}
```

Refresh browser. You should see all components rendering correctly with icons displaying.

---

## Phase 3: Mock Data Structure

**Location**: Inside `<script type="text/babel">`, AFTER UI components, BEFORE `const App =`

### Step 3.1: Define Loan Mock Data

**Exact Code to Write**:

```javascript
// ============ MOCK DATA ============

const mockLoans = [
  {
    id: 'loan_1',
    loan_number: '10001089',
    borrower_name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    property_address: '123 Main Street, Springfield, IL 62701',
    loan_type: 'Conventional',
    original_balance: 350000,
    current_principal: 338500,
    interest_rate: 4.25,
    monthly_pi: 1720.14,
    monthly_escrow: 650.00,
    term_months: 360,
    months_remaining: 348,
    status: 'Current',
    next_due_date: '2024-01-01',
    last_payment_date: '2023-12-01',
    last_payment_amount: 2370.14,
    origination_date: '2023-01-15',
  },
  {
    id: 'loan_2',
    loan_number: '10001098',
    borrower_name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    property_address: '456 Oak Avenue, Chicago, IL 60601',
    loan_type: 'FHA',
    original_balance: 285000,
    current_principal: 278400,
    interest_rate: 3.875,
    monthly_pi: 1340.25,
    monthly_escrow: 520.00,
    term_months: 360,
    months_remaining: 354,
    status: 'Current',
    next_due_date: '2024-01-01',
    last_payment_date: '2023-12-01',
    last_payment_amount: 1860.25,
    origination_date: '2023-07-10',
  },
]
```

**Validation**:
- Must have exactly 2 loan objects
- Each loan must have all 19 properties
- Both loans must have status: 'Current'
- Loan IDs must be 'loan_1' and 'loan_2'

---

### Step 3.2: Define Transaction Mock Data

**Exact Code to Write**:

```javascript
const mockTransactions = [
  {
    id: 'txn_1',
    loan_id: 'loan_1',
    date: '2023-12-01',
    type: 'Payment',
    amount: 2370.14,
    principal: 935.14,
    interest: 1435.00,
    escrow: 650.00,
    balance_after: 338500,
    status: 'Posted',
  },
  {
    id: 'txn_2',
    loan_id: 'loan_1',
    date: '2023-11-01',
    type: 'Payment',
    amount: 2370.14,
    principal: 931.81,
    interest: 1438.33,
    escrow: 650.00,
    balance_after: 339431.81,
    status: 'Posted',
  },
  {
    id: 'txn_3',
    loan_id: 'loan_1',
    date: '2023-10-01',
    type: 'Payment',
    amount: 2370.14,
    principal: 928.50,
    interest: 1441.64,
    escrow: 650.00,
    balance_after: 340363.62,
    status: 'Posted',
  },
  {
    id: 'txn_4',
    loan_id: 'loan_2',
    date: '2023-12-01',
    type: 'Payment',
    amount: 1860.25,
    principal: 957.55,
    interest: 902.70,
    escrow: 520.00,
    balance_after: 278400,
    status: 'Posted',
  },
]
```

**Validation**:
- Must have 4 transaction objects
- 3 transactions for loan_1, 1 for loan_2
- Each transaction must have type: 'Payment' and status: 'Posted'
- Amounts must be numeric (not strings)

---

### Step 3.3: Define Document Mock Data

**Exact Code to Write**:

```javascript
const mockDocuments = [
  {
    id: 'doc_1',
    loan_id: 'loan_1',
    name: 'Monthly Statement - December 2023',
    type: 'Statement',
    date: '2023-12-05',
    size: '245 KB',
    url: '#',
  },
  {
    id: 'doc_2',
    loan_id: 'loan_1',
    name: 'Monthly Statement - November 2023',
    type: 'Statement',
    date: '2023-11-05',
    size: '238 KB',
    url: '#',
  },
  {
    id: 'doc_3',
    loan_id: 'loan_1',
    name: '2023 Year-End Tax Statement',
    type: 'Tax Document',
    date: '2023-12-31',
    size: '156 KB',
    url: '#',
  },
  {
    id: 'doc_4',
    loan_id: 'loan_1',
    name: 'Loan Closing Disclosure',
    type: 'Disclosure',
    date: '2023-01-15',
    size: '892 KB',
    url: '#',
  },
]
```

**Validation**:
- Must have 4 document objects
- All documents for loan_1
- Types must be: Statement, Tax Document, or Disclosure
- URLs can be '#' for now

---

**Checkpoint**: Test mock data is accessible in App component:

```javascript
const App = () => {
  const [viewMode, setViewMode] = useState('borrower')

  // Get current user's loan (first loan for now)
  const currentLoan = mockLoans[0]
  const loanTransactions = mockTransactions.filter(t => t.loan_id === currentLoan.id)
  const loanDocuments = mockDocuments.filter(d => d.loan_id === currentLoan.id)

  console.log('Current Loan:', currentLoan)
  console.log('Transactions:', loanTransactions)
  console.log('Documents:', loanDocuments)

  return (
    <div className="min-h-screen bg-background">
      {/* ... existing header ... */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">Mock Data Test</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Borrower:</strong> {currentLoan.borrower_name}</p>
            <p><strong>Loan #:</strong> {currentLoan.loan_number}</p>
            <p><strong>Balance:</strong> ${currentLoan.current_principal.toLocaleString()}</p>
            <p><strong>Transactions:</strong> {loanTransactions.length}</p>
            <p><strong>Documents:</strong> {loanDocuments.length}</p>
          </div>
        </Card>
      </main>
    </div>
  )
}
```

Open browser console. You should see loan, transactions, and documents logged.

---

## Phase 4: Borrower Dashboard

### Step 4.1: Create StatCard Component

**Location**: After Badge component, before Mock Data section

**Exact Code to Write**:

```javascript
const StatCard = ({ title, value, icon, subtitle, trend }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <Icon
              name={trend > 0 ? 'trending-up' : 'trending-down'}
              size={14}
              className={trend > 0 ? 'text-green-500' : 'text-red-500'}
            />
            <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-lg ${icon.bg}`}>
          <Icon name={icon.name} size={24} className={icon.color} />
        </div>
      )}
    </div>
  </Card>
)
```

**Validation**:
- Must display title, value, optional subtitle
- Must display optional icon with background color
- Must show trend indicator with up/down arrow if provided

---

### Step 4.2: Create Sidebar Navigation Component

**Location**: After StatCard component, before Mock Data

**Exact Code to Write**:

```javascript
const Sidebar = ({ items, activeView, onNavigate, collapsed = false }) => (
  <div className={`${collapsed ? 'w-16' : 'w-64'} border-r bg-card transition-all duration-300`}>
    <nav className="p-4 space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeView === item.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Icon name={item.icon} size={20} />
          {!collapsed && <span className="font-medium">{item.label}</span>}
          {!collapsed && item.badge && (
            <Badge variant="destructive" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </button>
      ))}
    </nav>
  </div>
)
```

**Validation**:
- Must render list of navigation items
- Active item must have primary background
- Must support collapsed state (icon only)
- Must show badges if provided

---

### Step 4.3: Create BorrowerDashboard Component

**Location**: After Sidebar component, before Mock Data

**Exact Code to Write**:

```javascript
const BorrowerDashboard = ({ loan, transactions }) => {
  const monthlyPayment = loan.monthly_pi + loan.monthly_escrow
  const lastPayment = transactions[0]
  const paymentDue = new Date(loan.next_due_date)
  const today = new Date()
  const daysUntilDue = Math.ceil((paymentDue - today) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {loan.borrower_name.split(' ')[0]}</h2>
        <p className="text-muted-foreground">Loan #{loan.loan_number}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Balance"
          value={`$${loan.current_principal.toLocaleString()}`}
          subtitle={`of $${loan.original_balance.toLocaleString()} original`}
          icon={{ name: 'dollar-sign', bg: 'bg-blue-500/10', color: 'text-blue-600' }}
        />
        <StatCard
          title="Monthly Payment"
          value={`$${monthlyPayment.toLocaleString()}`}
          subtitle="Principal, Interest & Escrow"
          icon={{ name: 'calendar', bg: 'bg-green-500/10', color: 'text-green-600' }}
        />
        <StatCard
          title="Interest Rate"
          value={`${loan.interest_rate}%`}
          subtitle="Fixed rate"
          icon={{ name: 'percent', bg: 'bg-purple-500/10', color: 'text-purple-600' }}
        />
        <StatCard
          title="Next Payment"
          value={daysUntilDue > 0 ? `${daysUntilDue} days` : 'Due Today'}
          subtitle={new Date(loan.next_due_date).toLocaleDateString()}
          icon={{ name: 'clock', bg: 'bg-amber-500/10', color: 'text-amber-600' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Payment</h3>
          {lastPayment ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="font-medium">{new Date(lastPayment.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">${lastPayment.amount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal</span>
                  <span>${lastPayment.principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest</span>
                  <span>${lastPayment.interest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow</span>
                  <span>${lastPayment.escrow.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No recent payments</p>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Type</span>
              <span className="font-medium">{loan.loan_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property Address</span>
              <span className="font-medium text-right text-sm">{loan.property_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Origination Date</span>
              <span className="font-medium">{new Date(loan.origination_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining Term</span>
              <span className="font-medium">{loan.months_remaining} months</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            <Icon name="credit-card" size={16} className="mr-2" />
            Make a Payment
          </Button>
          <Button variant="outline" className="justify-start">
            <Icon name="file-text" size={16} className="mr-2" />
            View Documents
          </Button>
          <Button variant="outline" className="justify-start">
            <Icon name="mail" size={16} className="mr-2" />
            Contact Support
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

**Validation**:
- Must show 4 stat cards with loan metrics
- Must calculate days until next payment
- Must show recent payment breakdown
- Must show loan summary information
- Must have 3 quick action buttons

---

### Step 4.4: Update App Component with Layout

**Replace the entire App component** with:

```javascript
const App = () => {
  const [viewMode, setViewMode] = useState('borrower')
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Get current user's loan (first loan for prototype)
  const currentLoan = mockLoans[0]
  const loanTransactions = mockTransactions.filter(t => t.loan_id === currentLoan.id)

  const borrowerNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'payments', label: 'Payments', icon: 'credit-card' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'escrow', label: 'Escrow', icon: 'piggy-bank' },
    { id: 'messages', label: 'Messages', icon: 'mail', badge: '2' },
  ]

  const servicerNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'loans', label: 'Loans', icon: 'folder' },
    { id: 'delinquency', label: 'Delinquency', icon: 'alert-triangle', badge: '3' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart-2' },
  ]

  const currentNav = viewMode === 'borrower' ? borrowerNav : servicerNav

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                <Icon name="menu" size={24} />
              </button>
              <h1 className="text-2xl font-bold text-primary">ServState</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {viewMode === 'borrower' ? currentLoan.borrower_name : 'Admin Portal'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewMode(viewMode === 'borrower' ? 'servicer' : 'borrower')
                  setActiveView('dashboard')
                }}
              >
                <Icon name="repeat" size={14} className="mr-2" />
                Switch to {viewMode === 'borrower' ? 'Servicer' : 'Borrower'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          items={currentNav}
          activeView={activeView}
          onNavigate={setActiveView}
          collapsed={sidebarCollapsed}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {viewMode === 'borrower' && (
            <>
              {activeView === 'dashboard' && (
                <BorrowerDashboard loan={currentLoan} transactions={loanTransactions} />
              )}
              {activeView !== 'dashboard' && (
                <Card>
                  <h2 className="text-2xl font-bold mb-2">
                    {currentNav.find(n => n.id === activeView)?.label}
                  </h2>
                  <p className="text-muted-foreground">Coming soon...</p>
                </Card>
              )}
            </>
          )}

          {viewMode === 'servicer' && (
            <Card>
              <h2 className="text-2xl font-bold mb-2">Servicer Dashboard</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
```

**Validation**:
- Header must be sticky at top
- Sidebar must show correct navigation items
- Clicking nav items must change activeView
- BorrowerDashboard must display when in borrower mode + dashboard view
- Other views must show "Coming soon" placeholder

**Checkpoint**: Open browser. You should see:
- Full borrower dashboard with 4 stat cards
- Sidebar navigation with 5 borrower menu items
- Recent payment card showing last transaction details
- Loan summary card
- Quick actions with 3 buttons
- Ability to switch to servicer mode (shows placeholder)

---

## Phase 5: Borrower Payments View

### Step 5.1: Create DataTable Component

**Location**: After Sidebar component, before BorrowerDashboard

**Exact Code to Write**:

```javascript
const DataTable = ({ columns, data, onRowClick }) => {
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }, [data, sortColumn, sortDirection])

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-sm font-medium ${
                  col.sortable !== false ? 'cursor-pointer hover:bg-muted/80' : ''
                } ${col.className || ''}`}
                onClick={() => col.sortable !== false && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {sortColumn === col.key && (
                    <Icon
                      name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
                      size={14}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr
              key={idx}
              className={`border-t ${
                onRowClick ? 'cursor-pointer hover:bg-accent' : ''
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm ${col.className || ''}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Validation**:
- Must support sortable columns (click header to sort)
- Must support custom render functions
- Must support row click handling
- Must show sort indicator (up/down chevron)

---

### Step 5.2: Create BorrowerPayments Component

**Location**: After BorrowerDashboard component

**Exact Code to Write**:

```javascript
const BorrowerPayments = ({ loan, transactions, onMakePayment }) => {
  const monthlyPayment = loan.monthly_pi + loan.monthly_escrow

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <Badge variant="outline">{val}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      className: 'text-right',
      render: (val) => `$${val.toLocaleString()}`,
    },
    {
      key: 'principal',
      label: 'Principal',
      className: 'text-right',
      render: (val) => `$${val.toLocaleString()}`,
    },
    {
      key: 'interest',
      label: 'Interest',
      className: 'text-right',
      render: (val) => `$${val.toLocaleString()}`,
    },
    {
      key: 'escrow',
      label: 'Escrow',
      className: 'text-right',
      render: (val) => `$${val.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'Posted' ? 'success' : 'warning'}>
          {val}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Payments</h2>
          <p className="text-muted-foreground mt-1">
            Payment history and manage automatic payments
          </p>
        </div>
        <Button onClick={onMakePayment}>
          <Icon name="credit-card" size={16} className="mr-2" />
          Make a Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Payment"
          value={`$${monthlyPayment.toLocaleString()}`}
          subtitle="Due on 1st of each month"
          icon={{ name: 'calendar', bg: 'bg-blue-500/10', color: 'text-blue-600' }}
        />
        <StatCard
          title="Last Payment"
          value={`$${transactions[0]?.amount.toLocaleString() || '0.00'}`}
          subtitle={transactions[0] ? new Date(transactions[0].date).toLocaleDateString() : 'No payments'}
          icon={{ name: 'check-circle', bg: 'bg-green-500/10', color: 'text-green-600' }}
        />
        <StatCard
          title="Year to Date"
          value={`$${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`}
          subtitle={`${transactions.length} payments made`}
          icon={{ name: 'trending-up', bg: 'bg-purple-500/10', color: 'text-purple-600' }}
        />
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        <DataTable columns={columns} data={transactions} />
      </Card>
    </div>
  )
}
```

**Validation**:
- Must show 3 stat cards (monthly payment, last payment, YTD)
- Must calculate YTD total from all transactions
- Must render DataTable with 7 columns
- Must have "Make a Payment" button

---

### Step 5.3: Create Payment Modal

**Location**: After BorrowerPayments component

**Exact Code to Write**:

```javascript
const PaymentModal = ({ open, onClose, loan, onSubmit }) => {
  const [amount, setAmount] = useState(loan.monthly_pi + loan.monthly_escrow)

  if (!loan) return null

  const totalDue = loan.monthly_pi + loan.monthly_escrow
  const interest = loan.current_principal * (loan.interest_rate / 100 / 12)
  const principal = Math.max(0, amount - interest - loan.monthly_escrow)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(amount)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Make a Payment" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Loan #{loan.loan_number}
          </p>
          <p className="font-medium">{loan.borrower_name}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-muted-foreground text-lg">$</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="pl-8 text-2xl font-bold h-14"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum due: ${totalDue.toLocaleString()}
          </p>
        </div>

        <Card className="bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Payment Allocation
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Interest</span>
              <span>${interest.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Escrow</span>
              <span>${loan.monthly_escrow.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Principal</span>
              <span>${principal.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>Bank Account ****1234</option>
            <option>Credit Card ****5678</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Submit Payment
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

**Validation**:
- Must calculate interest based on loan principal and rate
- Must allocate payment to interest, escrow, then principal
- Must show payment breakdown in card
- Must have payment method dropdown
- Must validate minimum payment amount

---

### Step 5.4: Update App to Include Payments View

**In the App component**, find the section:

```javascript
{activeView !== 'dashboard' && (
  <Card>
    <h2 className="text-2xl font-bold mb-2">
      {currentNav.find(n => n.id === activeView)?.label}
    </h2>
    <p className="text-muted-foreground">Coming soon...</p>
  </Card>
)}
```

**Replace with**:

```javascript
{activeView === 'payments' && (
  <BorrowerPayments
    loan={currentLoan}
    transactions={loanTransactions}
    onMakePayment={() => setPaymentModal(true)}
  />
)}
{activeView !== 'dashboard' && activeView !== 'payments' && (
  <Card>
    <h2 className="text-2xl font-bold mb-2">
      {currentNav.find(n => n.id === activeView)?.label}
    </h2>
    <p className="text-muted-foreground">Coming soon...</p>
  </Card>
)}
```

**And add state for payment modal at the top of App**:

```javascript
const [paymentModal, setPaymentModal] = useState(false)
```

**And add the PaymentModal render before the closing div of App**:

```javascript
<PaymentModal
  open={paymentModal}
  onClose={() => setPaymentModal(false)}
  loan={currentLoan}
  onSubmit={(amount) => {
    console.log('Payment submitted:', amount)
    // In real app, would process payment here
  }}
/>
```

**Checkpoint**: Test the payments view:
1. Click "Payments" in sidebar
2. Should see 3 stat cards and payment history table
3. Click "Make a Payment" button
4. Modal should open with payment form
5. Change payment amount and see allocation update
6. Submit payment (will just log to console for now)

---

## Phase 6: Borrower Documents View

### Step 6.1: Create BorrowerDocuments Component

**Location**: After PaymentModal component

**Exact Code to Write**:

```javascript
const BorrowerDocuments = ({ documents }) => {
  const [filter, setFilter] = useState('all')

  const filteredDocs = filter === 'all'
    ? documents
    : documents.filter(d => d.type === filter)

  const docTypes = ['all', ...new Set(documents.map(d => d.type))]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Documents</h2>
        <p className="text-muted-foreground mt-1">
          View and download your loan documents
        </p>
      </div>

      <div className="flex gap-2">
        {docTypes.map(type => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? 'All Documents' : type}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDocs.map(doc => (
          <Card key={doc.id} hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Icon name="file-text" size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{doc.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline">{doc.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(doc.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-muted-foreground">{doc.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Icon name="eye" size={16} className="mr-2" />
                  View
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="download" size={16} className="mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Icon name="inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents found</p>
          </div>
        </Card>
      )}
    </div>
  )
}
```

**Validation**:
- Must show filter buttons for each document type + "All"
- Active filter button must use default variant
- Must render document cards with icon, name, type badge, date, size
- Must have View and Download buttons
- Must show empty state if no documents match filter

---

### Step 6.2: Update App to Include Documents View

**In the App component**, update the borrower view section to include documents:

```javascript
{activeView === 'documents' && (
  <BorrowerDocuments documents={loanDocuments} />
)}
```

Add this BEFORE the existing fallback that shows "Coming soon".

**Checkpoint**: Test documents view:
1. Click "Documents" in sidebar
2. Should see filter buttons for "All Documents", "Statement", "Tax Document", "Disclosure"
3. Should see 4 document cards
4. Click filter buttons to filter documents
5. View and Download buttons should be visible

---

## Phase 7: Borrower Escrow View

### Step 7.1: Create BorrowerEscrow Component

**Location**: After BorrowerDocuments component

**Exact Code to Write**:

```javascript
const BorrowerEscrow = ({ loan }) => {
  const escrowTransactions = [
    { id: 1, date: '2023-12-15', type: 'Property Tax', amount: -2400, balance: 4200 },
    { id: 2, date: '2023-12-01', type: 'Homeowner Insurance', amount: -1200, balance: 6600 },
    { id: 3, date: '2023-12-01', type: 'Monthly Deposit', amount: 650, balance: 7800 },
    { id: 4, date: '2023-11-01', type: 'Monthly Deposit', amount: 650, balance: 7150 },
  ]

  const currentBalance = escrowTransactions[0].balance
  const monthlyDeposit = loan.monthly_escrow
  const annualTaxes = 4800
  const annualInsurance = 2400
  const projectedShortage = 0

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'type',
      label: 'Description',
    },
    {
      key: 'amount',
      label: 'Amount',
      className: 'text-right',
      render: (val) => (
        <span className={val > 0 ? 'text-green-600' : 'text-red-600'}>
          {val > 0 ? '+' : ''}${Math.abs(val).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      className: 'text-right',
      render: (val) => `$${val.toLocaleString()}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Escrow Account</h2>
        <p className="text-muted-foreground mt-1">
          Your escrow account holds funds for property taxes and insurance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Current Balance"
          value={`$${currentBalance.toLocaleString()}`}
          subtitle="Available funds"
          icon={{ name: 'piggy-bank', bg: 'bg-green-500/10', color: 'text-green-600' }}
        />
        <StatCard
          title="Monthly Deposit"
          value={`$${monthlyDeposit.toLocaleString()}`}
          subtitle="Included in payment"
          icon={{ name: 'trending-up', bg: 'bg-blue-500/10', color: 'text-blue-600' }}
        />
        <StatCard
          title="Annual Taxes"
          value={`$${annualTaxes.toLocaleString()}`}
          subtitle="Property tax estimate"
          icon={{ name: 'landmark', bg: 'bg-purple-500/10', color: 'text-purple-600' }}
        />
        <StatCard
          title="Annual Insurance"
          value={`$${annualInsurance.toLocaleString()}`}
          subtitle="Homeowner's insurance"
          icon={{ name: 'shield', bg: 'bg-amber-500/10', color: 'text-amber-600' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Escrow Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Annual Required</span>
                <span className="font-medium">${(annualTaxes + annualInsurance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Annual Deposits</span>
                <span className="font-medium">${(monthlyDeposit * 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cushion</span>
                <span className="font-medium">$1,800</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Projected Shortage/Surplus</span>
                <span className={`font-semibold ${projectedShortage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {projectedShortage === 0 ? 'Balanced' : `$${Math.abs(projectedShortage).toLocaleString()}`}
                </span>
              </div>
            </div>
            {projectedShortage === 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Icon name="check-circle" className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-900">Account is Balanced</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your escrow account has sufficient funds for upcoming payments
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Upcoming Disbursements</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Property Tax - Q1 2024</p>
                <p className="text-sm text-muted-foreground">Due Feb 1, 2024</p>
              </div>
              <p className="font-semibold">$1,200</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Homeowner Insurance Renewal</p>
                <p className="text-sm text-muted-foreground">Due Jan 15, 2024</p>
              </div>
              <p className="font-semibold">$1,200</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <DataTable columns={columns} data={escrowTransactions} />
      </Card>
    </div>
  )
}
```

**Validation**:
- Must show 4 stat cards (balance, monthly, taxes, insurance)
- Must show escrow analysis with calculations
- Must show green "balanced" alert if no shortage
- Must show upcoming disbursements
- Must show transaction history table
- Deposits must show in green, payments in red

---

### Step 7.2: Update App to Include Escrow View

```javascript
{activeView === 'escrow' && (
  <BorrowerEscrow loan={currentLoan} />
)}
```

**Checkpoint**: Test escrow view:
1. Click "Escrow" in sidebar
2. Should see 4 stat cards
3. Should see escrow analysis card showing balanced status
4. Should see upcoming disbursements
5. Should see transaction table with colored amounts

---

## Phase 8: Borrower Messages View

### Step 8.1: Add Messages Mock Data

**Location**: After mockDocuments, before the UI Components section

**Exact Code to Write**:

```javascript
const mockMessages = [
  {
    id: 'msg_1',
    loan_id: 'loan_1',
    from: 'ServState Support',
    subject: 'December Statement Available',
    date: '2023-12-05',
    preview: 'Your December 2023 mortgage statement is now available...',
    body: 'Your December 2023 mortgage statement is now available for download in the Documents section.',
    unread: true,
  },
  {
    id: 'msg_2',
    loan_id: 'loan_1',
    from: 'ServState Support',
    subject: 'Escrow Analysis Complete',
    date: '2023-11-28',
    preview: 'Your annual escrow analysis has been completed...',
    body: 'Your annual escrow analysis has been completed. Your account is currently balanced with no adjustments needed.',
    unread: true,
  },
  {
    id: 'msg_3',
    loan_id: 'loan_1',
    from: 'ServState Support',
    subject: 'Payment Confirmation',
    date: '2023-12-01',
    preview: 'We received your payment of $2,370.14...',
    body: 'Thank you for your payment of $2,370.14 received on December 1, 2023. Your payment has been applied to your account.',
    unread: false,
  },
]
```

---

### Step 8.2: Create BorrowerMessages Component

**Location**: After BorrowerEscrow component

**Exact Code to Write**:

```javascript
const BorrowerMessages = ({ messages }) => {
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showCompose, setShowCompose] = useState(false)

  const unreadCount = messages.filter(m => m.unread).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Messages</h2>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Icon name="plus" size={16} className="mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-2">
          {messages.map(msg => (
            <Card
              key={msg.id}
              hover
              className={`cursor-pointer ${selectedMessage?.id === msg.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedMessage(msg)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${msg.unread ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold truncate ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {msg.from}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(msg.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${msg.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {msg.preview}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <div className="border-b pb-4 mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{selectedMessage.subject}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                    <Icon name="x" size={16} />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium">{selectedMessage.from}</span>
                  <span>•</span>
                  <span>{new Date(selectedMessage.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p>{selectedMessage.body}</p>
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline">
                  <Icon name="reply" size={16} className="mr-2" />
                  Reply
                </Button>
                <Button variant="ghost">
                  <Icon name="archive" size={16} className="mr-2" />
                  Archive
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Icon name="inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a message to read</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="New Message" maxWidth="max-w-2xl">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCompose(false); }}>
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="Enter subject..." className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea
              rows={6}
              placeholder="Type your message..."
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCompose(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Icon name="send" size={16} className="mr-2" />
              Send Message
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

**Validation**:
- Must show unread count in header
- Message list must show unread indicator (blue dot)
- Clicking message must show detail in right panel
- Detail panel must have Reply and Archive buttons
- New Message button must open compose modal
- Selected message must have ring highlight

---

### Step 8.3: Update App to Include Messages View

**Update App component**:

1. Add messages data:
```javascript
const loanMessages = mockMessages.filter(m => m.loan_id === currentLoan.id)
```

2. Add messages view:
```javascript
{activeView === 'messages' && (
  <BorrowerMessages messages={loanMessages} />
)}
```

3. Update the borrower nav to use dynamic unread count:
```javascript
const borrowerNav = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'payments', label: 'Payments', icon: 'credit-card' },
  { id: 'documents', label: 'Documents', icon: 'file-text' },
  { id: 'escrow', label: 'Escrow', icon: 'piggy-bank' },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'mail',
    badge: loanMessages.filter(m => m.unread).length > 0
      ? loanMessages.filter(m => m.unread).length.toString()
      : null
  },
]
```

**Checkpoint**: Test messages view:
1. Click "Messages" - should show "2" badge in nav
2. Should see 3 messages in left panel
3. Two messages should have blue unread dot
4. Click a message - should show detail in right panel
5. Click "New Message" - compose modal should open

---

## COMPLETION CHECKLIST

At this point, you should have a fully functional borrower portal with:

✅ **Framework**
- HTML structure with React, Tailwind, Lucide
- Custom color theme with CSS variables
- Responsive layout

✅ **UI Components**
- Icon, Button, Card, Input, Badge, Modal
- StatCard, Sidebar, DataTable
- All components reusable and styled consistently

✅ **Mock Data**
- 2 loans with complete details
- 4 transactions
- 4 documents
- 3 messages

✅ **Borrower Views**
- Dashboard with 4 stat cards, recent payment, loan summary, quick actions
- Payments with payment history table and make payment modal
- Documents with filtering and download options
- Escrow with balance, analysis, disbursements, transactions
- Messages with inbox, message detail, compose

✅ **Features**
- Mode switching (borrower ↔ servicer)
- Sidebar navigation with badges
- Sortable data tables
- Interactive modals
- Responsive design

---

## NEXT PHASE: Servicer Portal (Not Included in This Plan)

The servicer portal would include:
- Servicer dashboard with portfolio metrics
- Loan portfolio view with search/filter
- Individual loan detail view
- Delinquency management
- Task management
- Reports system

**END OF BORROWER PORTAL BUILD PLAN**

---

## CRITICAL RULES FOR AGENTS

1. **Copy code EXACTLY** - Do not modify variable names, class names, or structure
2. **Place code in EXACT location specified** - Follow "Location:" instructions precisely
3. **Validate after each step** - Check that your code matches the validation criteria
4. **Test at checkpoints** - Open browser and verify features work as described
5. **Do not skip steps** - Each step builds on previous steps
6. **Do not add extra features** - Only implement what is specified
7. **Ask if unclear** - If any instruction is ambiguous, ask for clarification before proceeding
