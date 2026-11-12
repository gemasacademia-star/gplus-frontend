import apiFetch from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";
import { parseJsonResponse } from "./httpHelpers";
import { COMPANY_NAME } from '../config/branding';

const alumnoService = {
  // Resumen para la tabla de gestion: el backend ya calcula sede/nivel vigente,
  // deuda pendiente y el flag de plan individual.
  getResumenTabla: async (sedeId) => {
    const response = await apiFetch.get(API_ROUTES.HISTORIAL_ACADEMICO.RESUMEN_TABLA(sedeId));
    const result = await parseJsonResponse(response, `Error al sincronizar Base ${COMPANY_NAME}`);
    return result.data || [];
  },

  // BL-013: filas listas para exportar; sus llaves (con espacios y tildes) son los
  // encabezados del Excel, asi que no se renombran ni se filtran aqui.
  getReporteExportacion: async () => {
    const response = await apiFetch.get(API_ROUTES.HISTORIAL_ACADEMICO.EXPORTAR_ALUMNOS);
    const result = await parseJsonResponse(response, 'Error al generar el reporte de alumnos');
    return result.data || [];
  },

  getById: async (id) => {
    const response = await apiFetch.get(API_ROUTES.USUARIOS.ALUMNO_BY_ID(id));
    const result = await parseJsonResponse(response, "Error al obtener alumno");
    return result.data || result;
  },

  update: async (id, payload) => {
    const response = await apiFetch.put(API_ROUTES.USUARIOS.ALUMNO_BY_ID(id), payload);
    const result = await parseJsonResponse(response, "Error al actualizar alumno");
    return result.data || result;
  },

  changeStatusHistory: async (payload) => {
    const response = await apiFetch.post(API_ROUTES.ALUMNOS.CAMBIAR_HISTORIAL, payload);
    const result = await parseJsonResponse(response, 'Error al cambiar el historial académico del alumno');
    return result;
  },

  verificarAntiguedad: async () => {
    const response = await apiFetch.get(API_ROUTES.ALUMNOS.VERIFICAR_ANTIGUEDAD);
    const result = await parseJsonResponse(response, `Error al verificar antiguedad`);
    return result.data;
  }
};

export default alumnoService;
