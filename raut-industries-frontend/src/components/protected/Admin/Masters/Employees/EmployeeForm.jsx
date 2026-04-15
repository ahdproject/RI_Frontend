import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import {
  FormPageWrapper, LoadingState, Toast,
} from '../_components/MasterPageWrapper'
import { extractError, todayISO } from '../../../../../utils/helpers'

const DEPARTMENTS = [
  'Production', 'Processing', 'QC',
  'Stores', 'Admin', 'Accounts', 'Maintenance',
]

const EMPTY = {
  emp_code: '', name: '', role: '',
  department: 'Production', phone: '',
  joining_date: todayISO(), salary: '',
}

export default function EmployeeForm() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState({ type: '', message: '' })

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await MastersRepo.getEmployeeById(id)
        const d   = res.data
        setForm({
          emp_code:     d.emp_code     || '',
          name:         d.name         || '',
          role:         d.role         || '',
          department:   d.department   || 'Production',
          phone:        d.phone        || '',
          joining_date: d.joining_date
            ? d.joining_date.split('T')[0] : todayISO(),
          salary:       d.salary       || '',
        })
      } catch (err) {
        setToast({ type: 'error', message: extractError(err) })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        emp_code:     form.emp_code.trim().toUpperCase(),
        name:         form.name.trim(),
        role:         form.role.trim(),
        department:   form.department,
        phone:        form.phone.trim() || null,
        joining_date: form.joining_date,
        salary:       Number(form.salary),
      }
      if (isEdit) {
        await MastersRepo.updateEmployee(id, payload)
      } else {
        await MastersRepo.createEmployee(payload)
      }
      navigate('/admin/masters/employees')
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <FormPageWrapper
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      subtitle={isEdit ? 'Update employee details' : 'Register a new employee'}
      backPath="/admin/masters/employees"
    >
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* Code + Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Employee Code *</label>
            <input
              name="emp_code"
              value={form.emp_code}
              onChange={handleChange}
              placeholder="EMP009"
              required
              disabled={isEdit}
              className="input-field font-mono uppercase
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="label">Full Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Tiwari"
              required
              className="input-field"
            />
          </div>
        </div>

        {/* Role + Department */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Role / Designation *</label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="e.g. Machine Operator"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Department *</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="select-field"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone + Joining Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength={15}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Joining Date *</label>
            <input
              type="date"
              name="joining_date"
              value={form.joining_date}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="label">Monthly Salary (₹) *</label>
          <input
            type="number"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            placeholder="18000"
            min="0"
            step="100"
            required
            className="input-field"
          />
          <p className="text-xs text-gray-600 mt-1.5">
            Used for payroll calculation in attendance summary.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/admin/masters/employees')}
            className="btn-secondary flex-1 justify-center"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 justify-center"
            disabled={saving}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : isEdit ? 'Save Changes' : 'Add Employee'
            }
          </button>
        </div>

      </form>
    </FormPageWrapper>
  )
}