import { StyleSheet } from '@react-pdf/renderer';

// Brand colors
export const colors = {
  primary: '#14b8a6', // Teal
  primaryDark: '#0f766e',
  secondary: '#6366f1', // Indigo
  text: '#1f2937',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  background: '#f9fafb',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
};

// Base styles for PDF documents
export const baseStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: colors.text,
  },

  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 9,
    color: colors.textMuted,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 9,
    color: colors.textMuted,
  },

  // Info boxes section (side by side)
  infoBoxesContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  infoBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoBoxTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoBoxLabel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  infoBoxValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },

  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Table styles
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    color: colors.text,
  },
  tableCellBold: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },
  tableTotalsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
  },

  // Highlight box (for important info like totals)
  highlightBox: {
    backgroundColor: '#ecfdf5', // Light teal
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    padding: 16,
    marginVertical: 16,
  },
  highlightBoxTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  highlightBoxValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  highlightBoxSubtext: {
    fontSize: 9,
    color: colors.textMuted,
  },

  // Wire instructions
  wireInstructions: {
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 16,
    marginTop: 20,
  },
  wireInstructionsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  wireRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  wireLabel: {
    width: 120,
    fontSize: 9,
    color: colors.textMuted,
  },
  wireValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerContact: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Summary cards (for payment history)
  summaryCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryCardLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },

  // Badge styles for transaction types
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 'bold',
  },
  badgePayment: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  badgeEscrow: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  badgeFee: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeAdjustment: {
    backgroundColor: '#f3e8ff',
    color: '#7c3aed',
  },

  // Alignment helpers
  textRight: {
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
});

// Type badges color mapping
export const transactionTypeStyles: Record<string, { bg: string; color: string }> = {
  Payment: { bg: '#dcfce7', color: '#166534' },
  'Escrow Disbursement': { bg: '#dbeafe', color: '#1e40af' },
  'Late Fee': { bg: '#fef3c7', color: '#92400e' },
  'NSF Fee': { bg: '#fef3c7', color: '#92400e' },
  Adjustment: { bg: '#f3e8ff', color: '#7c3aed' },
  Refund: { bg: '#ecfdf5', color: '#047857' },
};
