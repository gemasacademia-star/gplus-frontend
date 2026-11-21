import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';
import { parseJsonResponse } from './httpHelpers';

export const metodoPagoService = {
  getAllActivos: async () => {
    const response = await apiFetch.get(API_ROUTES.METODOS_PAGO.BASE);
    const result = await parseJsonResponse(response, 'Error al obtener métodos de pago');
    return result.data || [];
  },

  getAllAdmin: async () => {
    const response = await apiFetch.get(API_ROUTES.METODOS_PAGO.ADMIN);
    const result = await parseJsonResponse(response, 'Error al obtener métodos de pago');
    return result.data || [];
  },

  create: async (payload) => {
    const response = await apiFetch.post(API_ROUTES.METODOS_PAGO.BASE, payload);
    return await parseJsonResponse(response, 'Error al crear método de pago');
  },

  update: async (id, payload) => {
    const response = await apiFetch.put(API_ROUTES.METODOS_PAGO.BY_ID(id), payload);
    return await parseJsonResponse(response, 'Error al actualizar método de pago');
  },

  remove: async (id) => {
    const response = await apiFetch.delete(API_ROUTES.METODOS_PAGO.BY_ID(id));
    return await parseJsonResponse(response, 'Error al eliminar método de pago');
  },
};
