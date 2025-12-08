import { View, Text } from '@react-pdf/renderer';
import { baseStyles, colors, transactionTypeStyles } from './styles';
import type { Loan } from '@/types/loan';

interface PDFHeaderProps {
  title: string;
  subtitle?: string;
  generatedDate: Date;
  companyName: string;
  companyTagline: string;
}

export function PDFHeader({ title, subtitle, generatedDate, companyName, companyTagline }: PDFHeaderProps) {
  return (
    <View style={baseStyles.header}>
      <View style={baseStyles.headerLeft}>
        <Text style={baseStyles.companyName}>{companyName}</Text>
        <Text style={baseStyles.companyTagline}>{companyTagline}</Text>
      </View>
      <View style={baseStyles.headerRight}>
        <Text style={baseStyles.documentTitle}>{title}</Text>
        {subtitle && (
          <Text style={baseStyles.documentDate}>{subtitle}</Text>
        )}
        <Text style={baseStyles.documentDate}>
          Generated: {formatDateForPDF(generatedDate)}
        </Text>
      </View>
    </View>
  );
}

interface PDFFooterProps {
  pageNumber?: number;
  totalPages?: number;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
}

export function PDFFooter({ pageNumber, totalPages, companyName, companyEmail, companyPhone }: PDFFooterProps) {
  return (
    <View style={baseStyles.footer} fixed>
      <View style={baseStyles.footerDivider}>
        <Text style={baseStyles.footerText}>
          This document is provided for informational purposes only. The actual payoff amount may vary
          based on the payment posting date and any additional fees or adjustments.
        </Text>
        <Text style={baseStyles.footerContact}>
          {companyName} | {companyEmail} | {companyPhone}
        </Text>
        {pageNumber && totalPages && (
          <Text style={[baseStyles.footerText, { marginTop: 8 }]}>
            Page {pageNumber} of {totalPages}
          </Text>
        )}
      </View>
    </View>
  );
}

interface LoanInfoSectionProps {
  loan: Loan;
  showFullDetails?: boolean;
}

export function LoanInfoSection({ loan, showFullDetails = true }: LoanInfoSectionProps) {
  return (
    <View style={baseStyles.infoBoxesContainer}>
      {/* Borrower Information */}
      <View style={baseStyles.infoBox}>
        <Text style={baseStyles.infoBoxTitle}>Borrower Information</Text>
        <View style={baseStyles.infoBoxRow}>
          <Text style={baseStyles.infoBoxLabel}>Name</Text>
          <Text style={baseStyles.infoBoxValue}>{loan.borrower_name}</Text>
        </View>
        <View style={baseStyles.infoBoxRow}>
          <Text style={baseStyles.infoBoxLabel}>Property Address</Text>
          <Text style={baseStyles.infoBoxValue}>{loan.address}</Text>
        </View>
        {showFullDetails && (
          <>
            <View style={baseStyles.infoBoxRow}>
              <Text style={baseStyles.infoBoxLabel}>Email</Text>
              <Text style={baseStyles.infoBoxValue}>{loan.email}</Text>
            </View>
            <View style={baseStyles.infoBoxRow}>
              <Text style={baseStyles.infoBoxLabel}>Phone</Text>
              <Text style={baseStyles.infoBoxValue}>{formatPhone(loan.phone)}</Text>
            </View>
          </>
        )}
      </View>

      {/* Loan Information */}
      <View style={baseStyles.infoBox}>
        <Text style={baseStyles.infoBoxTitle}>Loan Information</Text>
        <View style={baseStyles.infoBoxRow}>
          <Text style={baseStyles.infoBoxLabel}>Loan Number</Text>
          <Text style={baseStyles.infoBoxValue}>{loan.loan_number}</Text>
        </View>
        <View style={baseStyles.infoBoxRow}>
          <Text style={baseStyles.infoBoxLabel}>Loan Type</Text>
          <Text style={baseStyles.infoBoxValue}>{loan.loan_type}</Text>
        </View>
        {showFullDetails && (
          <>
            <View style={baseStyles.infoBoxRow}>
              <Text style={baseStyles.infoBoxLabel}>Interest Rate</Text>
              <Text style={baseStyles.infoBoxValue}>{formatPercent(loan.interest_rate)}</Text>
            </View>
            <View style={baseStyles.infoBoxRow}>
              <Text style={baseStyles.infoBoxLabel}>Origination Date</Text>
              <Text style={baseStyles.infoBoxValue}>{formatDateString(loan.origination_date)}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

interface LoanInfoBarProps {
  loan: Loan;
}

export function LoanInfoBar({ loan }: LoanInfoBarProps) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 4,
      padding: 12,
      marginBottom: 16,
      justifyContent: 'space-between',
    }}>
      <View>
        <Text style={{ fontSize: 8, color: colors.textMuted }}>BORROWER</Text>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.text }}>{loan.borrower_name}</Text>
      </View>
      <View>
        <Text style={{ fontSize: 8, color: colors.textMuted }}>LOAN NUMBER</Text>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.text }}>{loan.loan_number}</Text>
      </View>
      <View>
        <Text style={{ fontSize: 8, color: colors.textMuted }}>PROPERTY</Text>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.text }}>{loan.address}</Text>
      </View>
    </View>
  );
}

interface TableHeaderProps {
  columns: Array<{ label: string; width?: number; align?: 'left' | 'right' | 'center' }>;
}

export function TableHeader({ columns }: TableHeaderProps) {
  return (
    <View style={baseStyles.tableHeader}>
      {columns.map((col, index) => (
        <Text
          key={index}
          style={[
            baseStyles.tableHeaderCell,
            col.width ? { flex: 0, width: col.width } : {},
            col.align === 'right' ? baseStyles.textRight : {},
            col.align === 'center' ? baseStyles.textCenter : {},
          ]}
        >
          {col.label}
        </Text>
      ))}
    </View>
  );
}

interface TableRowProps {
  cells: Array<{ value: string; width?: number; align?: 'left' | 'right' | 'center'; bold?: boolean }>;
  isLast?: boolean;
  isTotal?: boolean;
}

export function TableRow({ cells, isLast = false, isTotal = false }: TableRowProps) {
  return (
    <View style={[
      isLast ? baseStyles.tableRowLast : baseStyles.tableRow,
      isTotal ? baseStyles.tableTotalsRow : {},
    ]}>
      {cells.map((cell, index) => (
        <Text
          key={index}
          style={[
            cell.bold ? baseStyles.tableCellBold : baseStyles.tableCell,
            cell.width ? { flex: 0, width: cell.width } : {},
            cell.align === 'right' ? baseStyles.textRight : {},
            cell.align === 'center' ? baseStyles.textCenter : {},
          ]}
        >
          {cell.value}
        </Text>
      ))}
    </View>
  );
}

interface TransactionTypeBadgeProps {
  type: string;
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  const style = transactionTypeStyles[type] || { bg: colors.background, color: colors.text };

  return (
    <View style={{
      backgroundColor: style.bg,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      alignSelf: 'flex-start',
    }}>
      <Text style={{
        fontSize: 7,
        fontWeight: 'bold',
        color: style.color,
      }}>
        {type}
      </Text>
    </View>
  );
}

interface SummaryCardsProps {
  cards: Array<{ label: string; value: string }>;
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <View style={baseStyles.summaryCardsContainer}>
      {cards.map((card, index) => (
        <View key={index} style={baseStyles.summaryCard}>
          <Text style={baseStyles.summaryCardLabel}>{card.label}</Text>
          <Text style={baseStyles.summaryCardValue}>{card.value}</Text>
        </View>
      ))}
    </View>
  );
}

// Utility functions for formatting in PDFs
export function formatCurrencyForPDF(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDateForPDF(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(3)}%`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}
