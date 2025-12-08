import { Document, Page, View, Text } from '@react-pdf/renderer';
import { baseStyles, colors } from './styles';
import {
  PDFHeader,
  PDFFooter,
  LoanInfoSection,
  TableHeader,
  TableRow,
  formatCurrencyForPDF,
  formatDateString,
} from './components';
import type { Loan } from '@/types/loan';
import type { CompanyConfig } from '@/types/company-settings';

export interface PayoffData {
  principalBalance: number;
  accruedInterest: number;
  escrowCredit: number;
  recordingFee: number;
  payoffFee: number;
  totalPayoff: number;
  perDiem: number;
  goodThroughDate: string;
}

interface PayoffStatementProps {
  loan: Loan;
  payoffData: PayoffData;
  generatedDate: Date;
  config: CompanyConfig;
}

export function PayoffStatement({ loan, payoffData, generatedDate, config }: PayoffStatementProps) {
  const columns = [
    { label: 'Description', width: 300 },
    { label: 'Amount', align: 'right' as const },
  ];

  const rows = [
    { description: 'Principal Balance', amount: payoffData.principalBalance },
    { description: 'Accrued Interest', amount: payoffData.accruedInterest },
    { description: 'Escrow Credit', amount: payoffData.escrowCredit },
    { description: 'Recording Fee', amount: payoffData.recordingFee },
    { description: 'Payoff Processing Fee', amount: payoffData.payoffFee },
  ];

  return (
    <Document>
      <Page size="LETTER" style={baseStyles.page}>
        {/* Header */}
        <PDFHeader
          title="Payoff Statement"
          generatedDate={generatedDate}
          companyName={config.name}
          companyTagline={config.tagline}
        />

        {/* Borrower and Loan Info */}
        <LoanInfoSection loan={loan} />

        {/* Payoff Breakdown Table */}
        <View style={baseStyles.section}>
          <Text style={baseStyles.sectionTitle}>Payoff Amount Breakdown</Text>
          <View style={baseStyles.table}>
            <TableHeader columns={columns} />
            {rows.map((row, index) => (
              <TableRow
                key={index}
                cells={[
                  { value: row.description, width: 300 },
                  { value: formatCurrencyForPDF(row.amount), align: 'right' },
                ]}
                isLast={index === rows.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Total Payoff Highlight Box */}
        <View style={baseStyles.highlightBox}>
          <Text style={baseStyles.highlightBoxTitle}>Total Payoff Amount</Text>
          <Text style={baseStyles.highlightBoxValue}>
            {formatCurrencyForPDF(payoffData.totalPayoff)}
          </Text>
          <Text style={baseStyles.highlightBoxSubtext}>
            Good Through: {formatDateString(payoffData.goodThroughDate)}
          </Text>
          <Text style={[baseStyles.highlightBoxSubtext, { marginTop: 8 }]}>
            Per Diem Interest: {formatCurrencyForPDF(payoffData.perDiem)} per day after this date
          </Text>
        </View>

        {/* Important Notes */}
        <View style={{
          backgroundColor: '#fef3c7',
          borderWidth: 1,
          borderColor: '#f59e0b',
          borderRadius: 4,
          padding: 12,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#92400e', marginBottom: 4 }}>
            Important Notice
          </Text>
          <Text style={{ fontSize: 8, color: '#92400e', lineHeight: 1.4 }}>
            This payoff quote is valid through the date shown above. If payment is received after
            this date, additional per diem interest will be due. Please allow 2-3 business days
            for payment processing. Wire transfer is the recommended payment method for payoffs.
          </Text>
        </View>

        {/* Wire Instructions */}
        <View style={baseStyles.wireInstructions}>
          <Text style={baseStyles.wireInstructionsTitle}>Wire Transfer Instructions</Text>
          <View style={baseStyles.wireRow}>
            <Text style={baseStyles.wireLabel}>Bank Name:</Text>
            <Text style={baseStyles.wireValue}>{config.wire.bankName}</Text>
          </View>
          <View style={baseStyles.wireRow}>
            <Text style={baseStyles.wireLabel}>Routing Number:</Text>
            <Text style={baseStyles.wireValue}>{config.wire.routingNumber}</Text>
          </View>
          <View style={baseStyles.wireRow}>
            <Text style={baseStyles.wireLabel}>Account Number:</Text>
            <Text style={baseStyles.wireValue}>{config.wire.accountNumber}</Text>
          </View>
          <View style={baseStyles.wireRow}>
            <Text style={baseStyles.wireLabel}>Account Name:</Text>
            <Text style={baseStyles.wireValue}>{config.wire.accountName}</Text>
          </View>
          <View style={baseStyles.wireRow}>
            <Text style={baseStyles.wireLabel}>Reference:</Text>
            <Text style={baseStyles.wireValue}>Loan #{loan.loan_number}</Text>
          </View>
          <Text style={{ fontSize: 8, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' }}>
            Please include the loan number in the wire reference to ensure proper credit.
          </Text>
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
