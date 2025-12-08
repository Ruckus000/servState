import { Document, Page, View, Text } from '@react-pdf/renderer';
import { baseStyles, colors, transactionTypeStyles } from './styles';
import {
  PDFHeader,
  PDFFooter,
  LoanInfoBar,
  SummaryCards,
  formatCurrencyForPDF,
  formatDateString,
} from './components';
import type { Loan } from '@/types/loan';
import type { Transaction } from '@/types/transaction';
import type { CompanyConfig } from '@/types/company-settings';

export interface PaymentHistoryTotals {
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  escrowPaid: number;
  transactionCount: number;
}

interface PaymentHistoryProps {
  loan: Loan;
  transactions: Transaction[];
  dateRange: { from: string; to: string };
  totals: PaymentHistoryTotals;
  generatedDate: Date;
  config: CompanyConfig;
}

export function PaymentHistory({
  loan,
  transactions,
  dateRange,
  totals,
  generatedDate,
  config,
}: PaymentHistoryProps) {
  return (
    <Document>
      <Page size="LETTER" style={baseStyles.page}>
        {/* Header */}
        <PDFHeader
          title="Payment History"
          subtitle={`${formatDateString(dateRange.from)} - ${formatDateString(dateRange.to)}`}
          generatedDate={generatedDate}
          companyName={config.name}
          companyTagline={config.tagline}
        />

        {/* Loan Info Bar */}
        <LoanInfoBar loan={loan} />

        {/* Summary Cards */}
        <SummaryCards
          cards={[
            { label: 'Total Payments', value: formatCurrencyForPDF(totals.totalPaid) },
            { label: 'Principal Paid', value: formatCurrencyForPDF(totals.principalPaid) },
            { label: 'Interest Paid', value: formatCurrencyForPDF(totals.interestPaid) },
            { label: 'Escrow Paid', value: formatCurrencyForPDF(totals.escrowPaid) },
          ]}
        />

        {/* Transactions Table */}
        <View style={baseStyles.section}>
          <Text style={baseStyles.sectionTitle}>
            Transaction Details ({totals.transactionCount} transactions)
          </Text>
          <View style={baseStyles.table}>
            {/* Table Header */}
            <View style={baseStyles.tableHeader}>
              <Text style={[baseStyles.tableHeaderCell, { width: 70 }]}>DATE</Text>
              <Text style={[baseStyles.tableHeaderCell, { width: 90 }]}>TYPE</Text>
              <Text style={[baseStyles.tableHeaderCell, baseStyles.textRight]}>PRINCIPAL</Text>
              <Text style={[baseStyles.tableHeaderCell, baseStyles.textRight]}>INTEREST</Text>
              <Text style={[baseStyles.tableHeaderCell, baseStyles.textRight]}>ESCROW</Text>
              <Text style={[baseStyles.tableHeaderCell, baseStyles.textRight]}>TOTAL</Text>
            </View>

            {/* Table Rows */}
            {transactions.map((tx, index) => {
              const typeStyle = transactionTypeStyles[tx.type] || { bg: colors.background, color: colors.text };
              const isLast = index === transactions.length - 1;

              return (
                <View
                  key={tx.id}
                  style={[
                    isLast ? baseStyles.tableRowLast : baseStyles.tableRow,
                  ]}
                >
                  <Text style={[baseStyles.tableCell, { width: 70 }]}>
                    {formatDateString(tx.date)}
                  </Text>
                  <View style={[baseStyles.tableCell, { width: 90 }]}>
                    <View style={{
                      backgroundColor: typeStyle.bg,
                      paddingVertical: 2,
                      paddingHorizontal: 6,
                      borderRadius: 4,
                      alignSelf: 'flex-start',
                    }}>
                      <Text style={{
                        fontSize: 7,
                        fontWeight: 'bold',
                        color: typeStyle.color,
                      }}>
                        {tx.type}
                      </Text>
                    </View>
                  </View>
                  <Text style={[baseStyles.tableCell, baseStyles.textRight]}>
                    {tx.breakdown?.principal ? formatCurrencyForPDF(tx.breakdown.principal) : '-'}
                  </Text>
                  <Text style={[baseStyles.tableCell, baseStyles.textRight]}>
                    {tx.breakdown?.interest ? formatCurrencyForPDF(tx.breakdown.interest) : '-'}
                  </Text>
                  <Text style={[baseStyles.tableCell, baseStyles.textRight]}>
                    {tx.breakdown?.escrow ? formatCurrencyForPDF(tx.breakdown.escrow) : '-'}
                  </Text>
                  <Text style={[baseStyles.tableCellBold, baseStyles.textRight]}>
                    {formatCurrencyForPDF(tx.amount)}
                  </Text>
                </View>
              );
            })}

            {/* Totals Row */}
            <View style={baseStyles.tableTotalsRow}>
              <Text style={[baseStyles.tableCellBold, { width: 70 }]}>TOTALS</Text>
              <Text style={[baseStyles.tableCell, { width: 90 }]}></Text>
              <Text style={[baseStyles.tableCellBold, baseStyles.textRight]}>
                {formatCurrencyForPDF(totals.principalPaid)}
              </Text>
              <Text style={[baseStyles.tableCellBold, baseStyles.textRight]}>
                {formatCurrencyForPDF(totals.interestPaid)}
              </Text>
              <Text style={[baseStyles.tableCellBold, baseStyles.textRight]}>
                {formatCurrencyForPDF(totals.escrowPaid)}
              </Text>
              <Text style={[baseStyles.tableCellBold, baseStyles.textRight]}>
                {formatCurrencyForPDF(totals.totalPaid)}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Balance Info */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: colors.background,
          borderRadius: 4,
          padding: 12,
          marginTop: 16,
        }}>
          <View>
            <Text style={{ fontSize: 8, color: colors.textMuted }}>CURRENT PRINCIPAL BALANCE</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>
              {formatCurrencyForPDF(loan.current_principal)}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 8, color: colors.textMuted }}>ESCROW BALANCE</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>
              {formatCurrencyForPDF(loan.escrow_balance)}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 8, color: colors.textMuted }}>NEXT PAYMENT DUE</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>
              {formatDateString(loan.next_due_date)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <PDFFooter
          companyName={config.name}
          companyEmail={config.email}
          companyPhone={config.phone}
        />
      </Page>
    </Document>
  );
}
