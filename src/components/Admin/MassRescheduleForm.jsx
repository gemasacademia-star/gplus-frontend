import React, { useState, useEffect } from 'react';
import {
    CalendarRange,
    AlertTriangle,
    Loader2,
    ShieldAlert,
} from 'lucide-react';
import apiFetch from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import toast from 'react-hot-toast';
import ConfirmModal from '../shared/ConfirmModal.jsx';
import HorarioFilterBar from './mass-reschedule/HorarioFilterBar';
import HorarioSelectionList from './mass-reschedule/HorarioSelectionList';
import FechaOrigenPicker from './mass-reschedule/FechaOrigenPicker';
import { COMPANY_NAME } from '../../config/branding';

const DIAS_SEMANA = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };

const MassRescheduleForm = ({ onSuccess }) => {
    const [horarios, setHorarios] = useState([]);
    const [, setIsLoadingHorarios] = useState(true);
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [isLoadingFechas, setIsLoadingFechas] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalStep, setModalStep] = useState(0);

    const [modoFechas, setModoFechas] = useState('futuras');
    const [horariosSeleccionados, setHorariosSeleccionados] = useState([]);

    const [formData, setFormData] = useState({
        fecha_origen: '',
        motivo: ''
    });

    const [filterDay, setFilterDay] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHorarios();
    }, []);

    useEffect(() => {
        if (horariosSeleccionados.length > 0) {
            fetchFechasDisponibles(horariosSeleccionados[0], modoFechas);
        } else {
            setFechasDisponibles([]);
            setFormData(prev => ({ ...prev, fecha_origen: '' }));
        }
    }, [horariosSeleccionados, modoFechas]);

    const fetchHorarios = async () => {
        try {
            const response = await apiFetch.get(API_ROUTES.HORARIOS.BASE);
            const json = await response.json();
            setHorarios(json.data || json || []);
        } catch (error) {
            console.error('Error en fetchHorarios:', error);
            toast.error('No se pudieron cargar los horarios.');
        } finally {
            setIsLoadingHorarios(false);
        }
    };

    const fetchFechasDisponibles = async (horarioId, modo) => {
        if (!horarioId || horarioId === "undefined" || horarioId === "") {
            setFechasDisponibles([]);
            return;
        }

        setIsLoadingFechas(true);
        try {
            const endpoint = modo === 'pasadas'
                ? `/clases/${horarioId}/fechas-pasadas`
                : `/clases/${horarioId}/fechas-disponibles`;

            const response = await apiFetch.get(endpoint);
            const json = await response.json();

            let finalArray = [];
            if (json && json.success && Array.isArray(json.data)) {
                finalArray = json.data;
            } else if (Array.isArray(json)) {
                finalArray = json;
            }
            setFechasDisponibles(finalArray);
        } catch (error) {
            console.error('Error en fetchFechasDisponibles:', error);
            setFechasDisponibles([]);
            toast.error('Error al obtener las fechas');
        } finally {
            setIsLoadingFechas(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleModoFechas = (modo) => {
        setModoFechas(modo);
        setFormData(prev => ({ ...prev, fecha_origen: '' }));
    };

    const handleFilterDayChange = (value) => {
        setFilterDay(value);
        setHorariosSeleccionados([]); // Limpiar selección al cambiar día
    };

    // VALIDACIÓN CRÍTICA: No dejar seleccionar si no hay filtro de día
    const toggleHorario = (id) => {
        if (!filterDay) {
            toast('⚠️ Primero selecciona un día en el filtro superior', {
                icon: '📅',
                style: { borderRadius: '15px', background: '#333', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
            });
            return;
        }
        setHorariosSeleccionados(prev =>
            prev.includes(id) ? prev.filter(hId => hId !== id) : [...prev, id]
        );
    };

    const toggleTodos = () => {
        if (!filterDay) {
            toast.error("Debes elegir un día específico para seleccionar todos.");
            return;
        }
        if (horariosSeleccionados.length === filteredHorarios.length) {
            setHorariosSeleccionados([]);
            setFormData(prev => ({ ...prev, fecha_origen: '' }));
        } else {
            setHorariosSeleccionados(filteredHorarios.map(h => h.id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (horariosSeleccionados.length === 0 || !formData.fecha_origen || !formData.motivo) {
            toast.error("Por favor completa todos los campos y selecciona al menos un horario.");
            return;
        }
        setModalStep(1);
    };

    const executeReschedule = async () => {
        setModalStep(0);
        setIsSubmitting(true);
        try {
            const promesas = horariosSeleccionados.map(async (id) => {
                const response = await apiFetch.post(API_ROUTES.CLASES.REPROGRAMAR_MASIVO, {
                    horario_origen_id: Number.parseInt(id),
                    fecha_origen: formData.fecha_origen,
                    motivo: formData.motivo
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = errorData.message || errorData.error || 'Error al procesar el horario';
                    throw new Error(errorMessage);
                }
                return response.json();
            });

            const resultados = await Promise.allSettled(promesas);
            const exitosos = resultados.filter(r => r.status === 'fulfilled');
            const fallidos = resultados.filter(r => r.status === 'rejected');

            if (fallidos.length === 0) {
                toast.success(`Se reprogramaron ${exitosos.length} bloques exitosamente.`, { duration: 5000, icon: '🚀' });
            } else if (exitosos.length === 0) {
                toast.error(`No se pudo procesar: ${fallidos[0].reason.message}`, { duration: 6000 });
            } else {
                toast.success(`Se reprogramaron ${exitosos.length} bloques.`, { duration: 4000 });
                toast.error(`${fallidos.length} bloques fallaron: ${fallidos[0].reason.message}`, { duration: 6000 });
            }

            setHorariosSeleccionados([]);
            setFormData({ fecha_origen: '', motivo: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.message || 'Error catastrófico al procesar.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFechaOrigenPlaceholder = () => {
        if (horariosSeleccionados.length === 0) return "Selecciona un horario primero";
        if (isLoadingFechas) return "Buscando fechas...";
        return modoFechas === 'futuras' ? "Elige el día a cancelar" : "Elige la clase pasada";
    };

    const filteredHorarios = horarios.filter(h => {
        const matchesDay = filterDay === '' || h.dia_semana.toString() === filterDay;
        const searchLower = searchTerm.toLowerCase();
        return matchesDay && (searchTerm === '' ||
            DIAS_SEMANA[h.dia_semana].toLowerCase().includes(searchLower) ||
            h.nivel?.nombre?.toLowerCase().includes(searchLower) ||
            h.cancha?.nombre?.toLowerCase().includes(searchLower));
    });

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-surface p-6 rounded-2xl border border-brand-border-soft shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-brand-accent-dark rounded-2xl shadow-inner">
                        <CalendarRange size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">REPROGRAMACIÓN MASIVA</h2>
                        <p className="text-slate-500 text-sm font-medium">{COMPANY_NAME} - Control de Contingencias</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-bg rounded-xl border border-brand-border-soft">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredHorarios.length} ACTIVOS</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-brand-accent p-6 rounded-r-2xl shadow-sm">
                    <div className="flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-brand-accent shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-orange-800 uppercase tracking-wider mb-1">Advertencia Crítica</h4>
                            <p className="text-xs text-orange-700 font-bold leading-relaxed italic">
                                Esta acción modificará permanentemente las asistencias y notificará a todos los alumnos.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border-soft shadow-xl space-y-8">

                    <HorarioFilterBar
                        filterDay={filterDay}
                        onFilterDayChange={handleFilterDayChange}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        diasSemana={DIAS_SEMANA}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <HorarioSelectionList
                            filterDay={filterDay}
                            filteredHorarios={filteredHorarios}
                            horariosSeleccionados={horariosSeleccionados}
                            onToggleHorario={toggleHorario}
                            onToggleTodos={toggleTodos}
                            diasSemana={DIAS_SEMANA}
                        />

                        <FechaOrigenPicker
                            modoFechas={modoFechas}
                            onModoFechasChange={handleModoFechas}
                            fechaOrigen={formData.fecha_origen}
                            onChange={handleChange}
                            disabled={horariosSeleccionados.length === 0 || isLoadingFechas}
                            placeholder={getFechaOrigenPlaceholder()}
                            fechasDisponibles={fechasDisponibles}
                        />

                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center text-center">
                            <h4 className="text-[10px] font-black text-indigo-800 uppercase italic mb-1">Algoritmo {COMPANY_NAME} V2</h4>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase">Reposición Individual x Próximo Día</p>
                        </div>

                        <div className="col-span-full space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">4. Motivo Institucional</label>
                            <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="3" className="w-full p-6 rounded-[2rem] border-2 border-brand-border-soft bg-brand-bg focus:border-brand-accent transition-all text-xs font-bold text-slate-600 italic" placeholder="Ej: Mantenimiento Preventivo de Canchas..." required></textarea>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-brand-border-soft flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-brand-primary-soft px-4 py-2 rounded-full border border-blue-100">
                            <ShieldAlert size={14} /> <span>Procesando {horariosSeleccionados.length} bloque(s)</span>
                        </div>
                        <button type="submit" disabled={isSubmitting || horariosSeleccionados.length === 0} className="w-full md:w-auto bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.03] disabled:grayscale">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "EJECUTAR REPROGRAMACIÓN"}
                        </button>
                    </div>
                </div>
            </form>

            <ConfirmModal
                isOpen={modalStep === 1}
                onClose={() => setModalStep(0)}
                onConfirm={() => setModalStep(2)}
                title={`¿Reprogramar ${horariosSeleccionados.length} bloque(s)?`}
                message="El sistema buscará el próximo día de clase disponible para cada alumno individualmente en TODOS los horarios seleccionados. ¿Deseas continuar?"
                confirmText="Sí, continuar"
            />

            <ConfirmModal
                isOpen={modalStep === 2}
                onClose={() => setModalStep(0)}
                onConfirm={executeReschedule}
                title="🛑 ¡ACCIÓN MASIVA EN LOTE!"
                message="Se crearán reposiciones automáticas y se ajustarán las fechas de pago proporcionalmente para todos los alumnos afectados. ¿Confirmas?"
                iconType="danger"
                confirmText="EJECUTAR AHORA"
            />
        </div>
    );
};

export default MassRescheduleForm;
