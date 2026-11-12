import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';
import { parseJsonResponse } from './httpHelpers';

export const beneficioService = {
    // Obtener todos los conceptos (Admin)
    getBeneficios: async (idAlumno) => {
        const response = await apiFetch.get(`/beneficioPendiente/alumno/${idAlumno}`);

        const result = await parseJsonResponse(response, 'Error al obtener el beneficios del alumno');
        console.log(result.data)
        return result.data || [];
    },
};
