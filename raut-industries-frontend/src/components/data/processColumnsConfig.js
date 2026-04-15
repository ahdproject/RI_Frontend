// ─── Column configuration for Bills table ─────────────────────
// Controls which columns appear, their labels, widths and render

import {
  formatCurrency,
  formatDate,
  formatNumber,
  billStatusBadge,
} from '../../utils/helpers'

const billColumns = [
  {
    key:   'bill_no',
    label: 'Bill No',
    width: 'w-20',
    render: (row) => `#${row.bill_no}`,
    className: 'font-mono font-semibold text-gray-900',
  },
  {
    key:   'bill_date',
    label: 'Date',
    width: 'w-28',
    render: (row) => formatDate(row.bill_date),
    className: 'text-gray-600 text-xs',
  },
  {
    key:   'client_name',
    label: 'Client',
    width: 'flex-1',
    render: (row) => row.client_name,
    className: 'font-medium text-gray-900',
    sub: (row) => row.client_gstin || null,
  },
  {
    key:   'total_pieces',
    label: 'Pieces',
    width: 'w-24',
    render: (row) => formatNumber(row.total_pieces, 0),
    className: 'text-gray-900 text-right',
  },
  {
    key:   'subtotal',
    label: 'Subtotal',
    width: 'w-32',
    render: (row) => formatCurrency(row.subtotal),
    className: 'text-gray-900 text-right',
  },
  {
    key:   'gst_total',
    label: 'GST',
    width: 'w-28',
    render: (row) => formatCurrency(row.gst_total),
    className: 'text-gray-600 text-right text-xs',
  },
  {
    key:   'total_with_gst',
    label: 'Total',
    width: 'w-32',
    render: (row) => formatCurrency(row.total_with_gst),
    className: 'font-semibold text-amber-400 text-right',
  },
  {
    key:   'status',
    label: 'Status',
    width: 'w-24',
    render: (row) => row.status,
    badge: (row) => billStatusBadge(row.status),
    className: 'capitalize',
  },
]

export { billColumns }
export default billColumns