import Connector from '../../Connector'
import Apis from '../../Apis'

const UserManagementRepo = {

  // ── Users ──────────────────────────────────────────────────
  getAll: async () => {
    const response = await Connector.get(Apis.users)
    return response.data
  },

  getById: async (id) => {
    const response = await Connector.get(Apis.userById(id))
    return response.data
  },

  create: async (payload) => {
    const response = await Connector.post(Apis.users, payload)
    return response.data
  },

  update: async (id, payload) => {
    const response = await Connector.put(Apis.userById(id), payload)
    return response.data
  },

  changePassword: async (current_password, new_password) => {
    const response = await Connector.put(Apis.changePassword, {
      current_password,
      new_password,
    })
    return response.data
  },
}

export default UserManagementRepo