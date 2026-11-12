import { useReducer, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Estado del asistente de matrícula (BL-003). Solo guarda lo que el alumno
 * ELIGE; todo lo calculable (horarios filtrados, bloques, validez de cada
 * paso) se deriva abajo con useMemo.
 *
 * Los extras (camiseta) NO viven aquí a propósito: pertenecen al contenedor y
 * se desacoplan de la lógica de matrícula (ver EnrollmentStepper).
 */
export const MODALIDAD = { MENSUAL: 'MENSUAL', UNICA: 'UNICA' };

const MENSUAL_VACIO = { horarioIds: [], opcionInicio: null, fechaInicio: null };
const UNICA_VACIA = { fecha: null, horarioId: null };

const initialState = {
  step: 1,
  modalidad: null,
  esMultiSede: false,
  sedesElegidas: [],
  nivelesPorSede: {},
  sede: null,
  nivelId: null,
  mensual: MENSUAL_VACIO,
  unica: UNICA_VACIA,
};

const filtrarHorariosValidos = (horarioIds, sedesElegidas, nivelesPorSede, horariosTodo = []) =>
  horarioIds.filter((id) => {
    const h = horariosTodo.find((item) => item.id === id);
    if (!h) return false;
    const s = h.cancha?.sede?.nombre;
    return sedesElegidas.includes(s) && nivelesPorSede[s] === h.nivel?.id;
  });

function reducer(state, action) {
  switch (action.type) {
    // Cambiar modalidad invalida lo elegido en el paso 2; si pasa a UNICA fuerza 1 sola sede.
    case 'SET_MODALIDAD': {
      const esUnica = action.value === MODALIDAD.UNICA;
      const nuevasSedes = esUnica ? state.sedesElegidas.slice(0, 1) : state.sedesElegidas;
      const nuevosNiveles = {};
      nuevasSedes.forEach((s) => {
        if (state.nivelesPorSede[s]) nuevosNiveles[s] = state.nivelesPorSede[s];
      });
      return {
        ...state,
        modalidad: action.value,
        esMultiSede: esUnica ? false : state.esMultiSede,
        sedesElegidas: nuevasSedes,
        nivelesPorSede: nuevosNiveles,
        sede: nuevasSedes.join(' + ') || null,
        nivelId: nuevasSedes[0] ? nuevosNiveles[nuevasSedes[0]] ?? null : null,
        mensual: MENSUAL_VACIO,
        unica: UNICA_VACIA,
      };
    }

    // Permite elegir explícitamente entre "Una sola sede" y "Varias sedes (Inter-Sedes)"
    case 'SET_MODO_SEDE': {
      const multi = Boolean(action.value) && state.modalidad === MODALIDAD.MENSUAL;
      const nuevasSedes = multi ? state.sedesElegidas : state.sedesElegidas.slice(0, 1);
      const nuevosNiveles = {};
      nuevasSedes.forEach((s) => {
        if (state.nivelesPorSede[s]) nuevosNiveles[s] = state.nivelesPorSede[s];
      });
      const horarioIdsValidos = filtrarHorariosValidos(
        state.mensual.horarioIds,
        nuevasSedes,
        nuevosNiveles,
        action.horarios
      );
      const cambiaronHorarios = horarioIdsValidos.length !== state.mensual.horarioIds.length;

      return {
        ...state,
        esMultiSede: multi,
        sedesElegidas: nuevasSedes,
        nivelesPorSede: nuevosNiveles,
        sede: nuevasSedes.join(' + ') || null,
        nivelId: nuevasSedes[0] ? nuevosNiveles[nuevasSedes[0]] ?? null : null,
        mensual: cambiaronHorarios
          ? { ...state.mensual, horarioIds: horarioIdsValidos, opcionInicio: null, fechaInicio: null }
          : state.mensual,
      };
    }

    case 'SET_SEDE': {
      const soloUnaSede = state.modalidad === MODALIDAD.UNICA || !state.esMultiSede;
      if (soloUnaSede) {
        const nuevasSedes = action.value ? [action.value] : [];
        // Si hace clic en la misma sede única, la mantiene seleccionada
        const mismoNivel =
          action.value === state.sedesElegidas[0] ? state.nivelesPorSede[action.value] : null;
        const nuevosNiveles = mismoNivel ? { [action.value]: mismoNivel } : {};
        return {
          ...state,
          sedesElegidas: nuevasSedes,
          nivelesPorSede: nuevosNiveles,
          sede: nuevasSedes[0] || null,
          nivelId: mismoNivel ?? null,
          mensual: action.value === state.sedesElegidas[0] ? state.mensual : MENSUAL_VACIO,
          unica: action.value === state.sedesElegidas[0] ? state.unica : UNICA_VACIA,
        };
      }

      // Modo Inter-Sedes (múltiples sedes)
      const yaEsta = state.sedesElegidas.includes(action.value);
      const nuevasSedes = yaEsta
        ? state.sedesElegidas.filter((s) => s !== action.value)
        : [...state.sedesElegidas, action.value];

      const nuevosNiveles = { ...state.nivelesPorSede };
      if (yaEsta) {
        delete nuevosNiveles[action.value];
      }

      const horarioIdsValidos = filtrarHorariosValidos(
        state.mensual.horarioIds,
        nuevasSedes,
        nuevosNiveles,
        action.horarios
      );
      const cambiaronHorarios = horarioIdsValidos.length !== state.mensual.horarioIds.length;

      return {
        ...state,
        sedesElegidas: nuevasSedes,
        nivelesPorSede: nuevosNiveles,
        sede: nuevasSedes.join(' + ') || null,
        nivelId: nuevasSedes[0] ? nuevosNiveles[nuevasSedes[0]] ?? null : null,
        mensual: cambiaronHorarios
          ? { ...state.mensual, horarioIds: horarioIdsValidos, opcionInicio: null, fechaInicio: null }
          : state.mensual,
        unica: UNICA_VACIA,
      };
    }

    // Permite asignar el nivel para una sede específica (o para la sede activa si no se pasa `sede`)
    case 'SET_NIVEL': {
      const sedeObjetivo = action.sede || state.sedesElegidas[0];
      if (!sedeObjetivo) return state;

      const nuevosNiveles = {
        ...state.nivelesPorSede,
        [sedeObjetivo]: action.value,
      };

      const horarioIdsValidos = filtrarHorariosValidos(
        state.mensual.horarioIds,
        state.sedesElegidas,
        nuevosNiveles,
        action.horarios
      );
      const cambiaronHorarios = horarioIdsValidos.length !== state.mensual.horarioIds.length;

      return {
        ...state,
        nivelesPorSede: nuevosNiveles,
        nivelId: state.sedesElegidas[0] ? nuevosNiveles[state.sedesElegidas[0]] ?? null : action.value,
        mensual: cambiaronHorarios
          ? { ...state.mensual, horarioIds: horarioIdsValidos, opcionInicio: null, fechaInicio: null }
          : state.mensual,
        unica: UNICA_VACIA,
      };
    }

    // Cambiar los días invalida la fecha de inicio (depende de los horarios).
    case 'TOGGLE_HORARIO': {
      const ids = state.mensual.horarioIds;
      const horarioIds = ids.includes(action.id) ? ids.filter(i => i !== action.id) : [...ids, action.id];
      return { ...state, mensual: { horarioIds, opcionInicio: null, fechaInicio: null } };
    }
    case 'SET_INICIO':
      return { ...state, mensual: { ...state.mensual, opcionInicio: action.opcion, fechaInicio: action.fecha } };

    case 'SET_FECHA_UNICA':
      return { ...state, unica: { fecha: action.fecha, horarioId: action.horarioId ?? null } };
    case 'SET_HORARIO_UNICA':
      return { ...state, unica: { ...state.unica, horarioId: action.id } };

    case 'GO_TO':
      return { ...state, step: action.step };
    default:
      return state;
  }
}

const haySolape = (a, b) =>
  a.dia_semana === b.dia_semana && a.hora_inicio < b.hora_fin && a.hora_fin > b.hora_inicio;

/** @param {Array} horarios Horarios activos del club (useCatalogos). */
export function useEnrollmentWizard(horarios) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, modalidad, sedesElegidas, nivelesPorSede, sede, mensual, unica } = state;

  const sedes = useMemo(
    () => [...new Set(horarios.map(h => h.cancha?.sede?.nombre).filter(Boolean))].sort(),
    [horarios]
  );

  const nivelesPorSedeOpciones = useMemo(() => {
    const mapa = {};
    sedesElegidas.forEach((sedeNombre) => {
      const porId = new Map();
      horarios
        .filter((h) => h.cancha?.sede?.nombre === sedeNombre && h.nivel)
        .forEach((h) => porId.set(h.nivel.id, h.nivel));
      mapa[sedeNombre] = [...porId.values()];
    });
    return mapa;
  }, [horarios, sedesElegidas]);

  const niveles = useMemo(() => {
    const porId = new Map();
    horarios
      .filter(h => sedesElegidas.includes(h.cancha?.sede?.nombre) && h.nivel)
      .forEach(h => porId.set(h.nivel.id, h.nivel));
    return [...porId.values()];
  }, [horarios, sedesElegidas]);

  const horariosFiltrados = useMemo(
    () =>
      horarios.filter((h) => {
        const sedeHorario = h.cancha?.sede?.nombre;
        return (
          sedesElegidas.includes(sedeHorario) &&
          h.nivel?.id === nivelesPorSede[sedeHorario]
        );
      }),
    [horarios, sedesElegidas, nivelesPorSede]
  );

  // Bloques "sede + nivel + franja" con sus días, soportando múltiples sedes y niveles por sede.
  const bloques = useMemo(() => {
    const grupos = {};
    horariosFiltrados.forEach(h => {
      const sedeHorario = h.cancha?.sede?.nombre || sede;
      const hora = `${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)}`;
      const key = `${sedeHorario}-${h.nivel?.nombre || 'General'}-${hora}`;
      if (!grupos[key]) grupos[key] = { key, sede: sedeHorario, nivel: h.nivel?.nombre || 'General', hora, cancha: h.cancha?.nombre, opciones: [] };
      grupos[key].opciones.push(h);
    });
    return Object.values(grupos);
  }, [horariosFiltrados, sede]);

  const horariosElegidos = useMemo(
    () => horarios.filter(h => mensual.horarioIds.includes(h.id)),
    [horarios, mensual.horarioIds]
  );

  const toggleHorario = useCallback((id) => {
    if (!mensual.horarioIds.includes(id)) {
      const nuevo = horarios.find(h => h.id === id);
      if (nuevo && horariosElegidos.some(h => haySolape(h, nuevo))) {
        toast.error('¡Cruce detectado!');
        return;
      }
    }
    dispatch({ type: 'TOGGLE_HORARIO', id });
  }, [horarios, horariosElegidos, mensual.horarioIds]);

  const canAdvance = useMemo(() => {
    if (step === 1) {
      return Boolean(
        modalidad &&
        sedesElegidas.length > 0 &&
        sedesElegidas.every((s) => Boolean(nivelesPorSede[s]))
      );
    }
    if (step === 2) {
      return modalidad === MODALIDAD.MENSUAL
        ? mensual.horarioIds.length > 0 && Boolean(mensual.fechaInicio)
        : Boolean(unica.fecha && unica.horarioId);
    }
    return false;
  }, [step, modalidad, sedesElegidas, nivelesPorSede, mensual, unica]);

  const actions = useMemo(() => ({
    setModalidad: (value) => dispatch({ type: 'SET_MODALIDAD', value }),
    setModoSede: (value) => dispatch({ type: 'SET_MODO_SEDE', value, horarios }),
    setSede: (value) => dispatch({ type: 'SET_SEDE', value, horarios }),
    setNivel: (value, sedeNombre) => dispatch({ type: 'SET_NIVEL', value, sede: sedeNombre, horarios }),
    setInicio: (opcion, fecha) => dispatch({ type: 'SET_INICIO', opcion, fecha }),
    setFechaUnica: (fecha, horarioId) => dispatch({ type: 'SET_FECHA_UNICA', fecha, horarioId }),
    setHorarioUnica: (id) => dispatch({ type: 'SET_HORARIO_UNICA', id }),
    next: () => dispatch({ type: 'GO_TO', step: Math.min(step + 1, 3) }),
    back: () => dispatch({ type: 'GO_TO', step: Math.max(step - 1, 1) }),
  }), [step, horarios]);

  return {
    state,
    actions: { ...actions, toggleHorario },
    derived: {
      sedes,
      niveles,
      nivelesPorSedeOpciones,
      horariosFiltrados,
      bloques,
      horariosElegidos,
      canAdvance,
    },
  };
}
