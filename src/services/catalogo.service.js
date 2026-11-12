import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';
import { parseJsonResponse } from './httpHelpers';

export const catalogoService = {
    // Obtener todos los conceptos (Admin)
    getAll: async () => {
        const response = await apiFetch.get(API_ROUTES.CATALOGO.BASE);
        const result = await parseJsonResponse(response, 'Error al obtener el catálogo');
        return result.data || [];
    },

    // Obtener solo los planes vigentes (Landing/Público)
    getVigentes: async () => {
        const response = await apiFetch.get(API_ROUTES.CATALOGO.VIGENTES);
        if (!response.ok) {
            throw new Error('Error al obtener planes vigentes');
        }
        return await response.json();
    },

    getLegacy: async () => {
        const response = await apiFetch.get(API_ROUTES.CATALOGO.LEGACY);
        if (!response.ok) {
            throw new Error('Error al obtener planes LEGACY');
        }
        return await response.json();
    }
};
