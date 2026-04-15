import Connector from '../../Connector'
import Apis from '../../Apis'

const MastersRepo = {

  // ── GST Slabs ─────────────────────────────────────────────
  getAllGstSlabs: async (activeOnly = false) => {
    const response = await Connector.get(Apis.gstSlabs, {
      params: { active: activeOnly },
    })
    return response.data
  },

  getGstSlabById: async (id) => {
    const response = await Connector.get(Apis.gstSlabById(id))
    return response.data
  },

  createGstSlab: async (data) => {
    const response = await Connector.post(Apis.gstSlabs, data)
    return response.data
  },

  updateGstSlab: async (id, data) => {
    const response = await Connector.put(Apis.gstSlabById(id), data)
    return response.data
  },

  // ── Charge Types ──────────────────────────────────────────
  getAllChargeTypes: async (activeOnly = false) => {
    const response = await Connector.get(Apis.chargeTypes, {
      params: { active: activeOnly },
    })
    return response.data
  },

  getChargeTypeById: async (id) => {
    const response = await Connector.get(Apis.chargeTypeById(id))
    return response.data
  },

  createChargeType: async (data) => {
    const response = await Connector.post(Apis.chargeTypes, data)
    return response.data
  },

  updateChargeType: async (id, data) => {
    const response = await Connector.put(Apis.chargeTypeById(id), data)
    return response.data
  },

  // ── Clients ───────────────────────────────────────────────
  getAllClients: async (search = '') => {
    const response = await Connector.get(Apis.clients, {
      params: { search },
    })
    return response.data
  },

  getClientById: async (id) => {
    const response = await Connector.get(Apis.clientById(id))
    return response.data
  },

  createClient: async (data) => {
    const response = await Connector.post(Apis.clients, data)
    return response.data
  },

  updateClient: async (id, data) => {
    const response = await Connector.put(Apis.clientById(id), data)
    return response.data
  },

  // ── Products ──────────────────────────────────────────────
  getAllProducts: async (search = '', activeOnly = false) => {
    const response = await Connector.get(Apis.products, {
      params: { search, active: activeOnly },
    })
    return response.data
  },

  getProductById: async (id) => {
    const response = await Connector.get(Apis.productById(id))
    return response.data
  },

  createProduct: async (data) => {
    const response = await Connector.post(Apis.products, data)
    return response.data
  },

  updateProduct: async (id, data) => {
    const response = await Connector.put(Apis.productById(id), data)
    return response.data
  },

  // ── Employees ─────────────────────────────────────────────
  getAllEmployees: async (search = '', department = '', activeOnly = false) => {
    const response = await Connector.get(Apis.employees, {
      params: { search, department, active: activeOnly },
    })
    return response.data
  },

  getEmployeeById: async (id) => {
    const response = await Connector.get(Apis.employeeById(id))
    return response.data
  },

  createEmployee: async (data) => {
    const response = await Connector.post(Apis.employees, data)
    return response.data
  },

  updateEmployee: async (id, data) => {
    const response = await Connector.put(Apis.employeeById(id), data)
    return response.data
  },
}

export default MastersRepo