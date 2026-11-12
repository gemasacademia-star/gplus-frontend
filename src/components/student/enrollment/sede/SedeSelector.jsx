import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronLeft, ChevronRight, MapPin, Layers, Plus, ChevronDown, Check, Search } from 'lucide-react';
import { formatBrandingText } from '../../../../utils/formatBrandingText';

const SedeSelector = ({
  sedes = [],
  active,
  selectedSedes = [],
  allowMultiSede = false,
  esMultiSede = false,
  onChangeModoSede,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);

  // Cerrar al hacer clic fuera del desplegable multisede
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const sedesFiltradas = sedes.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const tieneSeleccion = selectedSedes.length > 0 || (active !== undefined && active !== null && active !== '');

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {allowMultiSede && sedes.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-brand-surface p-2 rounded-[2rem] border-2 border-brand-border-soft shadow-sm">
          <button
            type="button"
            onClick={() => {
              onChangeModoSede?.(false);
              setIsOpen(false);
            }}
            className={`p-3.5 rounded-[1.5rem] font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${!esMultiSede
              ? 'bg-brand-primary text-white shadow-md'
              : 'text-brand-muted hover:text-brand-primary hover:bg-brand-bg'
              }`}
          >
            <MapPin size={16} className={!esMultiSede ? 'text-brand-accent' : 'text-brand-muted'} />
            <span>Entrenar en 1 sola sede</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeModoSede?.(true);
              setIsOpen(false);
            }}
            className={`p-3.5 rounded-[1.5rem] font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${esMultiSede
              ? 'bg-brand-primary text-white shadow-md'
              : 'text-brand-muted hover:text-brand-primary hover:bg-brand-bg'
              }`}
          >
            <Layers size={16} className={esMultiSede ? 'text-brand-accent' : 'text-brand-muted'} />
            <span>Combinar varias sedes (Inter-Sedes)</span>
          </button>
        </div>
      )}

      {!esMultiSede ? (
        <div className="relative group">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-brand-surface p-3 rounded-full shadow-xl hidden md:group-hover:flex hover:bg-brand-primary hover:text-white transition-all -ml-6 border border-brand-border-soft"
          >
            <ChevronLeft size={20} />
          </button>

          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-4 px-2 scroll-smooth">
            {sedes.map((sede) => {
              const isActive = active === sede || selectedSedes.includes(sede);
              return (
                <button
                  key={sede}
                  type="button"
                  onClick={() => onSelect(sede)}
                  className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase italic transition-all duration-500 border-2 flex-shrink-0 flex items-center gap-2.5 ${isActive
                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg'
                    : 'bg-brand-surface border-brand-border-soft text-brand-muted hover:border-brand-primary/40'
                    }`}
                >
                  <Building2 size={16} /> {formatBrandingText(sede)}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-brand-surface p-3 rounded-full shadow-xl hidden md:group-hover:flex hover:bg-brand-primary hover:text-white transition-all -mr-6 border border-brand-border-soft"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full p-4 sm:p-5 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between gap-4 text-left shadow-sm cursor-pointer ${isOpen
              ? 'border-brand-primary ring-4 ring-brand-primary/10 bg-brand-surface shadow-xl'
              : tieneSeleccion
                ? 'border-brand-primary/80 bg-brand-surface hover:border-brand-primary hover:shadow-md'
                : 'border-brand-border-soft bg-brand-surface hover:border-brand-primary/40 hover:shadow-md'
              }`}
          >
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${tieneSeleccion
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'bg-brand-primary-soft text-brand-primary'
                  }`}
              >
                <Plus size={22} className="text-brand-accent" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-brand-muted">
                  {tieneSeleccion
                    ? `Sedes elegidas (${selectedSedes.length}) · Haz clic para añadir o quitar`
                    : 'Inscripción Inter-Sedes'}
                </span>
                <span className="block text-base sm:text-lg font-black uppercase italic tracking-tight truncate text-brand-primary">
                  {tieneSeleccion ? selectedSedes.map(s => formatBrandingText(s)).join(' + ') : 'Despliega para elegir tus sedes...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {tieneSeleccion && (
                <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider bg-brand-accent-soft text-brand-accent-dark px-3 py-1 rounded-full border border-brand-accent/30">
                  + Añadir otra sede
                </span>
              )}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-brand-primary-soft text-brand-primary' : 'bg-slate-100 text-slate-500'
                  }`}
              >
                <ChevronDown size={18} />
              </div>
            </div>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-brand-surface rounded-[2rem] border-2 border-brand-border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {sedes.length > 3 && (
                <div className="p-2 mb-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar sede..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-brand-border-soft rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto space-y-1.5 p-1 custom-scrollbar">
                {sedesFiltradas.length === 0 ? (
                  <div className="py-6 text-center text-xs font-bold text-slate-400">
                    No se encontraron sedes con ese nombre
                  </div>
                ) : (
                  sedesFiltradas.map((sede) => {
                    const isSelected = selectedSedes.includes(sede);
                    return (
                      <button
                        key={sede}
                        type="button"
                        onClick={() => onSelect(sede)}
                        className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 group cursor-pointer ${isSelected
                          ? 'bg-brand-primary text-white shadow-md'
                          : 'hover:bg-brand-primary-soft text-slate-700 hover:text-brand-primary'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected
                              ? 'bg-white/10 text-brand-accent'
                              : 'bg-slate-100 text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors'
                              }`}
                          >
                            <Building2 size5={16} size={16} />
                          </div>
                          <span className="font-black text-xs uppercase italic tracking-wider truncate">
                            {formatBrandingText(sede)}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center shrink-0 text-white shadow-sm">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SedeSelector;