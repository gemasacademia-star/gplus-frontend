export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    COMPLETAR_EMAIL: "/auth/completar-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    UPDATE_PROFILE: "/auth/profile",
  },
  ROLES: {
    BASE: "/roles",
  },
  HORARIOS: {
    BASE: "/horarios",
    BY_ID: (id) => `/horarios/${id}`,
    // BL-003: disponibilidad por fecha para Clase Única
    // → [{ fecha: 'YYYY-MM-DD', ocupados, capacidad_max, disponible, es_feriado }]
    DISPONIBILIDAD: (id, desde, hasta) => `/horarios/${id}/disponibilidad?desde=${desde}&hasta=${hasta}`,
  },
  USUARIOS: {
    BASE: "/usuarios",
    PROFESORES: "/usuarios/role/profesor",
    COORDINADORES: "/usuarios/role/coordinador",
    ALUMNOS: "/usuarios/role/alumno",
    ALUMNO_BY_ID: (id) => `/usuarios/${id}`,
    STATS: "/usuarios/count/usuarios-stats",
    REPORTE: "/usuarios/reporte/detallado",
    REGISTER: "/usuarios/register",
    MOVIMIENTOS: "/usuarios/reporte/maestro",
    EDIT_PAGO: (id) => `/usuarios/pago/${id}/inline-edit`,
    GRAFICOS_AVANZADOS: "/usuarios/reporte/graficos-avanzados",
  },
  INSCRIPCIONES: {
    BASE: "/inscripciones",
    INDIVIDUAL: "/inscripciones/individual",
    SEPARAR_FINALIZAR: (id) => `/inscripciones/${id}/separar-finalizar`,
    ACTUALIZAR_FECHA_PAQUETE: (cuentaId) => `/inscripciones/paquete/fecha/${cuentaId}`,
    HISTORIAL_CICLOS: (alumnoId) => `/inscripciones/alumno/${alumnoId}/historial-ciclos`,
    AJUSTE_FECHA: (cuentaId) => `/inscripciones/paquete/${cuentaId}/ajuste-fecha`,
    PLANES_HISTORICOS: (alumnoId) => `/inscripciones/alumno/${alumnoId}/planes-historicos`,
    RENOVAR_HISTORICO: (alumnoId, cuentaId) => `/inscripciones/alumno/${alumnoId}/renovar/${cuentaId}`,
    // BL-012: mes y anio son obligatorios (400 si faltan).
    HISTORIAL_CICLOS_POR_MES: (alumnoId, mes, anio) =>
      `/inscripciones/alumno/${alumnoId}/historial-ciclos/por-mes?mes=${mes}&anio=${anio}`,
    REPORTE_INDIVIDUALES: "/inscripciones/reportes/individuales",
    INDIVIDUAL_ADMIN: "/inscripciones/individual-admin",
    ALUMNO: (alumnoId) => `/inscripciones/alumno/${alumnoId}`,
    ALUMNO_NO_FINALIZADAS: (alumnoId) => `/inscripciones/alumno-no-finalizadas/${alumnoId}`,
    HORARIO_INSCRIPCION: "/inscripciones/horario-inscripcion",
  },
  PAGOS: {
    BASE: "/pagos",
    BASEADMIN: "/pagos/gestion-admin",
    ALUMNO_HISTORIAL: (id) => `/pagos/alumno/${id}`,
    REPORTAR: "/pagos/reportar",
    VALIDAR: "/pagos/validar",
    DETALLE_MAESTRO: (id) => `/pagos/detalle-maestro/${id}`,
  },
  SEDES: {
    BASE: "/sedes",
    ACTIVOS: "/sedes?activo=true&limit=100",
    OCUPACION: "/sedes/dashboard/ocupacion",
    BY_ID: (id) => `/sedes/${id}`,
  },
  RECUPERACIONES: {
    BASE: "/recuperaciones",
    HISTORIAL: "/recuperaciones/historial",
    ALUMNO_HISTORIAL: (id) => `/recuperaciones/alumno/${id}`,
    ELIMINAR: (id) => `/recuperaciones/${id}`,
    LISTAR_DEPURACION: "/recuperaciones/depuracion",
  },
  CANCHAS: {
    BASE: "/canchas",
    ACTIVAS: "/canchas/activas",
  },
  NIVELES: {
    BASE: "/niveles",
    BY_ID: (id) => `/niveles/${id}`,
  },
  TIPOS_BENEFICIO: {
    BASE: "/tipos-beneficio",
    BY_ID: (id) => `/tipos-beneficio/${id}`,
  },
  DESCUENTOS: {
    APLICAR: "/descuentos/aplicar",
  },
  ASISTENCIAS: {
    BASE: "/asistencias",
    PREVISUALIZAR: "/asistencias/previsualizar-fechas",
    ALUMNO_HISTORIAL: (id) => `/asistencias/alumno/${id}`,
    ALUMNO_ESTADISTICAS: (id) => `/asistencias/alumno/${id}/estadisticas`,
  },
  CUENTAS_POR_COBRAR: {
    BASE: "/cuentas-por-cobrar",
    HISTORIAL: (id) => `/cuentas-por-cobrar/historial/${id}`,
    SUGERIR_FECHA: (id) => `/cuentas-por-cobrar/renovacion-sugerida/${id}`,
    GENERAR_ADELANTADO: (id) => `/cuentas-por-cobrar/generar-adelantado/${id}`,
    GENERAR_ADELANTADO_VALIDADO: (id) => `/cuentas-por-cobrar/generar-adelantado-validado/${id}`,
  },
  CLASES: {
    BASE: "/clases",
    REPROGRAMAR_MASIVO: "/clases/reprogramar-masivo",
    REVERTIR_MASIVO: "/clases/revertir-masivo",
    ACTIVAS_MASIVAS: "/clases/reprogramaciones-masivas-activas",
    HORARIOS_CON_ASISTENCIA: "/clases/horarios-con-asistencia",
  },
  CATALOGO: {
    BASE: "/catalogo",
    ACTIVOS: "/catalogo/activos",
    VIGENTES: "/catalogo/vigentes",
    LEGACY: "/catalogo/legacy",
    BY_ID: (id) => `/catalogo/${id}`,
  },
  PARAMETROS: {
    BASE: "/parametros",
    BY_ID: (id) => `/parametros/${id}`,
  },
  CLOUDINARY: {
    BASE: "/cloudinary",
  },
  LESIONES: {
    BASE: "/lesiones",
    ALUMNO: (id) => `/lesiones/alumno/${id}`,
  },
  TIPOS_DOCUMENTO: {
    BASE: "/tipos-documento",
  },
  BENEFICIOS_PENDIENTES: {
    BASE: "/beneficioPendiente",
  },
  ALUMNOS: {
    BASE: "/alumno",
    MI_PERFIL: "/alumno/mi-perfil",
    DIA_CORTE: "/alumno/gestion/resumen-cortes",
    DIA_CORTE_COORDINADOR: "/alumno/gestion/cortes-alumnos",
    CAMBIAR_HISTORIAL: "/alumno/gestion/cambiar-historial",
    VERIFICAR_ANTIGUEDAD: "/alumno/verificar-antiguedad",
    CONTACTOS: {
      BASE: "/alumno/mi-perfil/contactos",
      BY_ID: (id) => `/alumno/mi-perfil/contactos/${id}`,
    },
  },
  PUBLICACIONES: {
    BASE: "/publicaciones",
    BY_ID: (id) => `/publicaciones/${id}`,
  },
  NOTIFICACIONES: {
    BASE: "/notificaciones",
    MARCAR_LEIDA: (id) => `/notificaciones/${id}/leer`,
  },
  METODOS_PAGO: {
    BASE: "/metodos-pago",
  },
  COORDINADORES: {
    BASE: "/coordinadores",
    BY_ID: (id) => `/coordinadores/${id}`,
  },
  FERIADOS: {
    BASE: "/feriados",
    BY_ID: (id) => `/feriados/${id}`,
  },
  ANUNCIOS_BENEFICIOS: {
    BASE: '/anuncios-beneficios',
    ACTIVOS: '/anuncios-beneficios/activos',
    BY_ID: (id) => `/anuncios-beneficios/${id}`,
  },
  MERCH: {
    CATALOGO: "/merch",
    CATALOGO_COMPLETO: "/merch?incluir_inactivos=true", // solo Administrador
    BY_ID: (id) => `/merch/${id}`,
    COLECCION_ALUMNO: (alumnoId) => `/merch/alumno/${alumnoId}`,
    COMPRAR: "/merch/comprar", // solo Administrador
    ORDEN: "/merch/orden",     // compra del alumno: genera una deuda pendiente (contrato asumido)
    ORDEN_BY_ID: (cuentaId) => `/merch/orden/${cuentaId}`, // cancelar orden pendiente (contrato asumido)
    // Logística de recepción
    LOGISTICA: "/merch/logistica",                                        // ?sede_id= & ?busqueda=
    ENTREGAR_ITEM: (itemId) => `/merch/logistica/${itemId}/entregar`,
    REVERTIR_ENTREGA: (itemId) => `/merch/logistica/${itemId}/revertir`,
    ESTADO_ITEM: (itemId) => `/merch/items/${itemId}/estado`,
  },
  CAJA: {
    BASE: "/caja",
    RESUMEN: "/caja/resumen",
    RESUMEN_ANUAL: "/caja/resumen-anual",
    DESGLOSE_INGRESOS: "/caja/desglose-ingresos",
    BY_ID: (id) => `/caja/${id}`,
  },
  HISTORIAL_ACADEMICO: {
    BASE: "/historial-academico",
    ALUMNO: (alumnoId) => `/historial-academico/alumno/${alumnoId}`,
    ALUMNO_DETALLE: (alumnoId) => `/historial-academico/alumno-detalle/${alumnoId}`,
    RESUMEN_TABLA: (sedeId) => sedeId
      ? `/historial-academico/resumen-tabla?sede_id=${sedeId}`
      : `/historial-academico/resumen-tabla`,
    // BL-013: las llaves de cada fila ya son los encabezados del Excel.
    EXPORTAR_ALUMNOS: "/historial-academico/exportar-alumnos",
    RESUMEN_INDIVIDUAL: (sedeId) => sedeId
      ? `/historial-academico/resumen-individual?sede_id=${sedeId}`
      : `/historial-academico/resumen-individual`,
  },
};