import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  Users,
  FileText,
  ArrowRight,
  Shield,
} from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'Bill Management',
    desc: 'Create GST-compliant invoices with automatic tax calculations.',
  },
  {
    icon: BarChart3,
    title: 'Reports & P&L',
    desc: 'Monthly profit & loss, GST reconciliation, and sales analytics.',
  },
  {
    icon: ClipboardList,
    title: 'Attendance',
    desc: 'Daily attendance register with payroll summary.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'SuperAdmin, Admin, and Manager roles with scoped permissions.',
  },
]

export default function HeroPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#f59e0b 1px, transparent 1px),
                            linear-gradient(90deg, #f59e0b 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200/60 bg-gray-100/40
                          backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16
                        flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center
                            justify-center shadow-lg shadow-amber-500/20">
              <span className="text-gray-900 font-black text-sm">RI</span>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 leading-none">
                RAUT INDUSTRIES
              </p>
              <p className="text-[10px] text-gray-600 tracking-widest uppercase">
                ERP System
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-xs px-4 py-2"
          >
            Sign In <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center
                        justify-center text-center px-4 py-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border
                        border-amber-500/30 rounded-full px-4 py-1.5 mb-8">
          <Shield size={12} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-semibold tracking-wide uppercase">
            Internal ERP Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold
                        text-gray-900 leading-tight tracking-tight max-w-3xl">
          Raut Industries
          <span className="block text-amber-500 mt-1">
            Management System
          </span>
        </h1>

        <p className="text-gray-600 text-base sm:text-lg mt-6 max-w-xl leading-relaxed">
          Manage bills, attendance, GST reports and business operations
          for Raut Industries from a single platform.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
          <button
            onClick={() => navigate('/login')}
            className="btn-primary px-8 py-3 text-sm"
          >
            Get Started <ArrowRight size={16} />
          </button>
          <div className="text-gray-600 text-xs">
            Authorized personnel only
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4
                        max-w-5xl w-full mt-20">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card p-5 text-left hover:border-gray-600
                         transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border
                              border-amber-500/20 flex items-center justify-center
                              mb-4 group-hover:bg-amber-500/20 transition-colors">
                <f.icon size={18} className="text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/60 py-5">
        <p className="text-center text-gray-600 text-xs">
          © 2025 Raut Industries · Khairane MIDC, Navi Mumbai ·
          Built by FyreGig LLP
        </p>
      </footer>

    </div>
  )
}