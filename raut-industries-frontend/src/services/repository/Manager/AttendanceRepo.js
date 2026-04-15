import Connector from '../../Connector'
import Apis from '../../Apis'

const AttendanceRepo = {

  // ── Single mark ────────────────────────────────────────────
  mark: async (payload) => {
    const response = await Connector.post(Apis.attendance, payload)
    return response.data
  },

  // ── Bulk mark (entire day) ─────────────────────────────────
  bulkMark: async (payload) => {
    const response = await Connector.post(Apis.attendanceBulk, payload)
    return response.data
  },

  // ── Update single record ───────────────────────────────────
  update: async (id, payload) => {
    const response = await Connector.put(Apis.attendanceById(id), payload)
    return response.data
  },

  // ── Monthly grid data ──────────────────────────────────────
  getMonthly: async (month, year, filters = {}) => {
    const response = await Connector.get(Apis.attendance, {
      params: { month, year, ...filters },
    })
    return response.data
  },

  // ── Monthly summary with payroll ───────────────────────────
  getSummary: async (month, year, department = '') => {
    const response = await Connector.get(Apis.attendanceSummary, {
      params: {
        month,
        year,
        ...(department ? { department } : {}),
      },
    })
    return response.data
  },

  // ── Daily attendance for a date ────────────────────────────
  getDaily: async (date) => {
    const response = await Connector.get(Apis.attendanceDaily(date))
    return response.data
  },

  // ── Single employee monthly ────────────────────────────────
  getEmployeeMonthly: async (employeeId, month, year) => {
    const response = await Connector.get(
      Apis.attendanceEmployee(employeeId),
      { params: { month, year } }
    )
    return response.data
  },
}

export default AttendanceRepo