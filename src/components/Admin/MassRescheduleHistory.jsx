import React, { useState, useEffect } from 'react';
import { 
    CalendarClock, 
    CalendarX2,
    Users,
    MapPin,
    AlertCircle,
    FastForward,
    User
} from 'lucide-react';
import apiFetch from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import LoadingSpinner from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';

const MassRescheduleHistory = ({ refreshSignal }) => { // 📥 Recibe la señal
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔥 Reacciona cuando refreshSignal cambia en el padre
    useEffect(() => {
        fetchHistory();
    }, [refreshSignal]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch.get(API_ROUTES.CLASES.ACTIVAS_MASIVAS);
            const json = await response.json();
            setHistory(json.data || json || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatearFechaUTC = (fechaStr) => {
        if (!fechaStr) return 'S/F';
        const date = new Date(fechaStr);
        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
    };

    if (isLoading) return (
        <LoadingSpinner
            className="flex flex-col items-center justify-center p-20 space-y-3"
            colorClassName="text-blue-600"
            size={32}
            label="Actualizando..."
            labelClassName="text-[10px] font-black text-brand-muted uppercase tracking-widest italic text-center"
        />
    );

    if (history.length === 0) return (
        <EmptyState
            className="p-10 text-center bg-brand-bg/50 rounded-[2rem] border-2 border-dashed border-brand-border"
            icon={CalendarX2}
            message="Sin registros"
            messageClassName="text-[10px] font-black text-brand-muted uppercase italic"
        />
    );

    return (
        <div className="space-y-5 px-2">
            {history.map((item) => (
                <div key={item.id} className="bg-brand-surface rounded-[2.2rem] border border-brand-border shadow-sm p-6 relative overflow-hidden transition-all hover:border-blue-200">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Identificador</span>
                            <h4 className="text-xs font-black text-brand-primary italic uppercase">Lote {item.grupo_uuid?.split('-')[0]}</h4>
                        </div>
                        <div className="bg-brand-primary px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                            <Users size={16} className="text-blue-300" />
                            <span className="text-white font-black text-sm">{item._count?.registros_asistencia || 0}</span>
                            <span className="text-[8px] text-blue-200 font-bold uppercase tracking-tighter">Afectados</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-brand-bg rounded-2xl border border-brand-border-soft p-4 mb-4">
                        <div className="border-r border-brand-border pr-2">
                            <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest mb-1 block">Cancelada</span>
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase">
                                <CalendarClock size={14} className="text-red-500" />
                                {formatearFechaUTC(item.fecha_origen)}
                            </div>
                        </div>
                        <div className="pl-2 text-right">
                            <span className="text-[8px] font-black text-brand-accent uppercase tracking-widest mb-1 block">Acción</span>
                            <div className="flex items-center gap-1 text-brand-accent-dark font-black text-[9px] uppercase italic justify-end">
                                <FastForward size={14} /> Ciclo +7 Días
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-x-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase">
                                <MapPin size={12} className="text-blue-500" />
                                {item.horarios_clases?.canchas?.nombre}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-brand-muted uppercase">
                                <User size={12} />
                                {item.usuarios?.nombres}
                            </div>
                        </div>

                        <div className="bg-brand-primary-soft/50 p-4 rounded-2xl border-l-4 border-blue-500 relative">
                            <AlertCircle size={14} className="text-blue-500 absolute -top-1.5 -left-1.5 bg-brand-surface rounded-full" />
                            <p className="text-[10px] text-brand-body italic font-bold leading-relaxed">"{item.motivo}"</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MassRescheduleHistory;