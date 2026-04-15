import Connector from '../../Connector'
import Apis from '../../Apis'

const AdminAuthRepo = {

  // ── Login ─────────────────────────────────────────────────
  login: async (email, password) => {
    const response = await Connector.post(Apis.login, { email, password })
    return response.data
  },

  // ── Get logged-in user ────────────────────────────────────
  getMe: async () => {
    const response = await Connector.get(Apis.getMe)
    return response.data
  },

  // ── Change password ───────────────────────────────────────
  changePassword: async (current_password, new_password) => {
    const response = await Connector.put(Apis.changePassword, {
      current_password,
      new_password,
    })
    return response.data
  },
}

export default AdminAuthRepo