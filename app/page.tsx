// @ts-nocheck
'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone, Monitor, Wifi, WifiOff, CheckCircle2, AlertTriangle,
  Camera, MapPin, FileText, Download, RefreshCw, ShieldAlert,
  HardHat, Truck, ClipboardCheck, Eye, Check, X, Building2,
  Calendar, User, Search, Filter, Sparkles, Send, Trash2, CheckSquare
} from 'lucide-react';

// Datos iniciales simulados para la tabla de auditoría SGC
const INITIAL_RECORDS = [
  {
    id: 'REG-2026-089',
    fecha: '02/11/2026 07:15',
    obra: 'Mina Pirquitas - Movimiento de Suelos',
    tipo: 'Checklist SST (ISO 45001)',
    norma: 'ISO 45001',
    responsable: 'Carlos Mamani (Capataz)',
    gps: '-22.6911, -66.5422 (Rinconada, Jujuy)',
    estado: 'Conformidad',
    syncMode: 'Offline Sync',
    fotos: 2,
    respuestas: [
      { item: 'Uso completo de EPP en cuadrilla (Casco, botines, chaleco, antiparras)', valor: 'OK' },
      { item: 'Vallado perimetral y señalización de excavación colocada', valor: 'OK' },
      { item: 'Extintor y botiquín verificados en frente de trabajo', valor: 'OK' },
      { item: 'Charla diaria de seguridad (5 min) registrada', valor: 'OK' }
    ],
    accionCorrectiva: '',
    firma: true
  },
  {
    id: 'REG-2026-088',
    fecha: '01/11/2026 16:40',
    obra: 'Obra: Acueducto Norte - Frente 2',
    tipo: 'Checklist SST (ISO 45001)',
    norma: 'ISO 45001',
    responsable: 'Roberto Sajama (Jefe de Obra)',
    gps: '-24.1858, -65.2995 (S.S. de Jujuy)',
    estado: 'No Conformidad Abierta',
    syncMode: 'Online 4G',
    fotos: 3,
    respuestas: [
      { item: 'Uso completo de EPP en cuadrilla (Casco, botines, chaleco, antiparras)', valor: 'OK' },
      { item: 'Vallado perimetral y señalización de excavación colocada', valor: 'NO CUMPLE' },
      { item: 'Extintor y botiquín verificados en frente de trabajo', valor: 'OK' },
      { item: 'Charla diaria de seguridad (5 min) registrada', valor: 'OK' }
    ],
    accionCorrectiva: 'El viento derribó 15 metros de malla naranja en zanja sector Norte. Se detuvo tarea y se repuso estacado metálico.',
    firma: true
  },
  {
    id: 'REG-2026-087',
    fecha: '01/11/2026 12:10',
    obra: 'Ruta Prov. 83 - Vial',
    tipo: 'Parte Diario de Obra (ISO 9001)',
    norma: 'ISO 9001',
    responsable: 'Ing. Marcos Tolaba',
    gps: '-23.7584, -64.8512 (Valle Grande)',
    estado: 'Conformidad',
    syncMode: 'Offline Sync',
    fotos: 4,
    respuestas: [
      { item: 'Avance físico de compactación de sub-base (Progresiva km 14 a 15.2)', valor: 'OK' },
      { item: 'Control de densidad in-situ aprobado por laboratorio', valor: 'OK' },
      { item: 'Personal presente: 18 operarios / Clima: Despejado', valor: 'OK' }
    ],
    accionCorrectiva: '',
    firma: true
  },
  {
    id: 'REG-2026-086',
    fecha: '01/11/2026 08:05',
    obra: 'Obra: Acueducto Norte - Frente 2',
    tipo: 'Inspección Pre-Uso Maquinaria',
    norma: 'ISO 45001',
    responsable: 'Miguel Quispe (Operador)',
    gps: '-24.1858, -65.2995 (S.S. de Jujuy)',
    estado: 'Conformidad',
    syncMode: 'Online 4G',
    fotos: 1,
    respuestas: [
      { item: 'Retroexcavadora CAT 416F - Nivel de fluidos y sistema hidráulico', valor: 'OK' },
      { item: 'Alarma acústica de retroceso y baliza estroboscópica operativa', valor: 'OK' },
      { item: 'Estado de neumáticos / tren de rodaje y frenos de servicio', valor: 'OK' }
    ],
    accionCorrectiva: '',
    firma: true
  }
];

const CHECKLIST_QUESTIONS = {
  sst: [
    'Uso completo de EPP en cuadrilla (Casco, botines, chaleco, antiparras)',
    'Vallado perimetral y señalización de excavación colocada',
    'Extintor y botiquín verificados en frente de trabajo',
    'Charla diaria de seguridad (5 min) registrada'
  ],
  parte: [
    'Conformidad de replanteo topográfico y niveles de proyecto (ISO 9001)',
    'Calidad de materiales recibidos en frente (Áridos / Hormigón H25)',
    'Cumplimiento de meta diaria de avance físico programado',
    'Orden y limpieza al cierre de jornada en obrador'
  ],
  equipos: [
    'Sistema de frenos, dirección y neumáticos en condiciones operativas',
    'Alarma de retroceso, bocina y luces de trabajo funcionando',
    'Ausencia de fugas de aceite hidráulico o combustible',
    'Matafuego vigente y elementos de izaje certificados'
  ]
};

export default function App() {
  // Vista activa: 'mobile' | 'desktop' | 'strategy'
  const [activeView, setActiveView] = useState('mobile');

  // Estados de la PWA Móvil
  const [isOffline, setIsOffline] = useState(true);
  const [mobileTab, setMobileTab] = useState('sst'); // 'parte' | 'sst' | 'equipos'
  const [selectedObra, setSelectedObra] = useState('Obra: Acueducto Norte - Frente 2');
  const [responsable, setResponsable] = useState('Roberto Sajama (Jefe de Obra)');

  // Estado de respuestas del checklist
  const [answers, setAnswers] = useState({
    0: 'OK',
    1: 'OK',
    2: 'OK',
    3: 'OK'
  });
  const [accionCorrectiva, setAccionCorrectiva] = useState('');
  const [observacionesParte, setObservacionesParte] = useState('Avance de 120m lineales de excavación. Clima despejado 22°C. Cuadrilla completa (12 operarios).');
  const [photos, setPhotos] = useState([
    { id: 1, label: 'Frente_Excavacion_01.jpg', time: '07:42:10', gps: '-24.1858, -65.2995' }
  ]);

  // Cola local IndexedDB / Serwist y Base de datos general
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [toastMessage, setToastMessage] = useState(null);

  // Filtros en Panel SGC
  const [filterObra, setFilterObra] = useState('TODAS');
  const [filterNorma, setFilterNorma] = useState('TODAS');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [selectedRecordModal, setSelectedRecordModal] = useState(null);

  // Canvas para Firma Digital
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(true);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Inicializar una firma simulada por defecto en el canvas
  useEffect(() => {
    if (activeView === 'mobile' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      // Dibujar un trazo inicial elegante
      ctx.beginPath();
      ctx.moveTo(40, 55);
      ctx.quadraticCurveTo(75, 15, 110, 50);
      ctx.quadraticCurveTo(140, 75, 185, 30);
      ctx.moveTo(65, 60);
      ctx.lineTo(175, 45);
      ctx.stroke();
    }
  }, [activeView, mobileTab]);

  // Funciones de dibujo en Canvas (Mouse y Touch)
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Verificar si hay algún ítem en "NO CUMPLE"
  const hasNonConformity = Object.values(answers).includes('NO CUMPLE');

  // Cambiar tab en móvil resetea respuestas a OK
  const handleTabChange = (tab) => {
    setMobileTab(tab);
    setAnswers({ 0: 'OK', 1: 'OK', 2: 'OK', 3: 'OK' });
    setAccionCorrectiva('');
  };

  // Simular captura de foto con metadatos GPS
  const handleAddPhoto = () => {
    const labels = [
      'Vallado_Seguridad_ISO.jpg',
      'Cuadrilla_EPP_Verificado.jpg',
      'Tablero_Electrico_Obra.jpg',
      'Compactacion_Suelo_Frente2.jpg'
    ];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newPhoto = {
      id: Date.now(),
      label: labels[photos.length % labels.length],
      time: timeStr,
      gps: '-24.1858, -65.2995'
    };
    setPhotos([...photos, newPhoto]);
    showToast('📸 Evidencia fotográfica georreferenciada adjuntada', 'info');
  };

  // Guardar el registro desde el celular
  const handleSaveRecord = () => {
    if (!hasSignature) {
      showToast('⚠️ Por favor firme el registro antes de guardar.', 'warning');
      return;
    }

    const currentQuestions = CHECKLIST_QUESTIONS[mobileTab];
    const formattedResponses = currentQuestions.map((q, idx) => ({
      item: q,
      valor: answers[idx] || 'OK'
    }));

    const tipoMap = {
      sst: 'Checklist SST (ISO 45001)',
      parte: 'Parte Diario de Obra (ISO 9001)',
      equipos: 'Inspección Pre-Uso Maquinaria'
    };

    const normaMap = {
      sst: 'ISO 45001',
      parte: 'ISO 9001',
      equipos: 'ISO 45001'
    };

    const newRecord = {
      id: `REG-2026-0${90 + records.length + offlineQueue.length}`,
      fecha: '02/11/2026 ' + new Date().toTimeString().slice(0, 5),
      obra: selectedObra,
      tipo: tipoMap[mobileTab],
      norma: normaMap[mobileTab],
      responsable: responsable,
      gps: '-24.1858, -65.2995 (S.S. de Jujuy)',
      estado: hasNonConformity ? 'No Conformidad Abierta' : 'Conformidad',
      syncMode: isOffline ? 'Offline Sync (Serwist)' : 'Online 4G',
      fotos: photos.length,
      respuestas: formattedResponses,
      accionCorrectiva: hasNonConformity
        ? (accionCorrectiva || 'Se instruye corrección inmediata en frente de obra y seguimiento por SGC.')
        : '',
      observaciones: observacionesParte,
      firma: true
    };

    if (isOffline) {
      setOfflineQueue([...offlineQueue, newRecord]);
      showToast('🟠 Sin señal: Registro encriptado y guardado en Cola Local (IndexedDB / Serwist).', 'warning');
    } else {
      setRecords([newRecord, ...records]);
      showToast(
        hasNonConformity
          ? '✅ Registro sincronizado. ⚠️ Alerta de No Conformidad enviada por WhatsApp a Jimena Aguirre (SGC).'
          : '✅ Registro sincronizado en tiempo real con el Panel SGC de GECO.',
        'success'
      );
    }

    // Resetear estados para otra carga limpia
    setAnswers({ 0: 'OK', 1: 'OK', 2: 'OK', 3: 'OK' });
    setAccionCorrectiva('');
  };

  // Simular reconexión 4G/WiFi y vaciar la cola offline hacia el servidor
  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    const count = offlineQueue.length;
    const hasNC = offlineQueue.some(r => r.estado === 'No Conformidad Abierta');

    setRecords([...offlineQueue.reverse(), ...records]);
    setOfflineQueue([]);
    setIsOffline(false);

    showToast(
      `🚀 Conexión restablecida: ${count} registro(s) subidos al Panel SGC.${hasNC ? ' Se disparó alerta n8n/WhatsApp por No Conformidad.' : ''}`,
      'success'
    );
  };

  // Filtrado en el Panel Web SGC
  const filteredRecords = records.filter(rec => {
    const matchObra = filterObra === 'TODAS' || rec.obra === filterObra;
    const matchNorma = filterNorma === 'TODAS' || rec.norma === filterNorma;
    const matchEstado = filterEstado === 'TODOS' || rec.estado === filterEstado;
    return matchObra && matchNorma && matchEstado;
  });

  // Cálculos dinámicos de KPIs
  const totalHoy = 12 + records.length;
  const totalNC = records.filter(r => r.estado === 'No Conformidad Abierta').length;
  const cumplimientoPct = Math.round(((records.length - totalNC) / records.length) * 100);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* Notificación Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${toastMessage.type === 'warning'
              ? 'bg-amber-950 text-amber-100 border-amber-500'
              : toastMessage.type === 'info'
                ? 'bg-slate-900 text-slate-100 border-slate-700'
                : 'bg-emerald-950 text-emerald-100 border-emerald-500'
            }`}>
            <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
            <span className="text-sm font-medium">{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Barra Superior Corporativa GECO + Conmutador de Vistas */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-inner">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg tracking-tight text-white">
                  GECO S.R.L.
                </h1>
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-semibold">
                  SGC ISO 9001 & 45001
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Obras Civiles, Viales y Mineras (Jujuy) · Prototipo <span className="text-amber-400 font-medium">DesignIA Tech</span>
              </p>
            </div>
          </div>

          {/* Selector Dual de Vistas */}
          <div className="flex flex-wrap items-center bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
            <button
              onClick={() => setActiveView('mobile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeView === 'mobile'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Vista Móvil en Obra (PWA Offline)</span>
              {offlineQueue.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded-full font-bold">
                  {offlineQueue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('desktop')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeView === 'desktop'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
            >
              <Monitor className="w-4 h-4" />
              <span>💻 Panel SGC & Auditoría (Web)</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-slate-900/30 rounded-full font-bold">
                {records.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">

        {/* =========================================================
            VISTA 1: SIMULADOR MÓVIL PWA OFFLINE EN FRENTE DE OBRA
        ========================================================= */}
        {activeView === 'mobile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Columna Izquierda: Explicación Interactiva de la Demo */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 mb-3">
                  <HardHat className="w-3.5 h-3.5" /> Modo Terreno / Capataz
                </span>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Carga en Obra sin Señal (PWA Offline-First)
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  En frentes viales o mineros de Jujuy donde no hay cobertura celular, el capataz abre la aplicación en su teléfono, completa el registro, adjunta fotos con GPS y firma en pantalla.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">¿Cómo probar esta demo en vivo?</div>
                  <div className="flex items-start gap-2">
                    <span className="bg-amber-500 text-slate-950 font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Alterná arriba del teléfono entre <strong>🟢 En línea (4G)</strong> y <strong>🟠 Modo Offline</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-amber-500 text-slate-950 font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Marcá algún punto del Checklist como <strong>NO CUMPLE</strong> para disparar el protocolo ISO de No Conformidad.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-amber-500 text-slate-950 font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Firmá en el recuadro táctil, presioná <strong>Guardar Registro</strong> y luego pasá al <strong>💻 Panel SGC</strong> para ver el reporte de auditoría generado.</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Cola de Sincronización Local (Serwist / IndexedDB) */}
              <div className={`rounded-2xl p-5 border transition-all shadow-sm ${offlineQueue.length > 0
                  ? 'bg-amber-50/90 border-amber-300'
                  : 'bg-white border-slate-200'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${offlineQueue.length > 0 ? 'text-amber-600 animate-spin' : 'text-slate-400'}`} />
                    <h3 className="font-bold text-sm text-slate-900">
                      Cola de Sincronización Local (IndexedDB / Serwist)
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${offlineQueue.length > 0
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                    {offlineQueue.length} pendientes
                  </span>
                </div>

                {offlineQueue.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No hay registros retenidos en el teléfono. Todo está sincronizado con el servidor central de GECO.
                  </p>
                ) : (
                  <div className="space-y-3 mt-3">
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {offlineQueue.map((item) => (
                        <div key={item.id} className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{item.id}</span> · {item.tipo}
                            <div className="text-[11px] text-slate-500">{item.obra}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${item.estado === 'No Conformidad Abierta'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {item.estado}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSyncOfflineQueue}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Wifi className="w-4 h-4" />
                      Simular Reconexión 4G y Sincronizar Ahora ({offlineQueue.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Marco de Teléfono Móvil (PWA) */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800">
                <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-700 flex flex-col">

                  {/* Barra Superior del Celular: Conmutador Online / Offline */}
                  <div className={`px-4 py-3 flex items-center justify-between transition-colors ${isOffline
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-700 text-white'
                    }`}>
                    <div className="flex items-center gap-2">
                      {isOffline ? <WifiOff className="w-4 h-4 shrink-0" /> : <Wifi className="w-4 h-4 shrink-0" />}
                      <div className="text-xs font-bold leading-tight">
                        {isOffline
                          ? '🟠 Modo Offline (Sin señal - Cola local activa)'
                          : '🟢 En línea (4G - Sincronización activa)'}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOffline(!isOffline)}
                      className="text-[11px] bg-black/25 hover:bg-black/40 px-2.5 py-1 rounded-full font-semibold shrink-0 transition cursor-pointer"
                    >
                      Cambiar señal
                    </button>
                  </div>

                  {/* Cabecera App Móvil */}
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                        GECO S.R.L. · SGC Móvil
                      </div>
                      <div className="text-sm font-bold">Registro de Campo ISO</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-300">
                      <div>Frente Activo</div>
                      <div className="font-mono text-emerald-400">GPS OK ±3m</div>
                    </div>
                  </div>

                  {/* Pestañas de Tipo de Formulario */}
                  <div className="grid grid-cols-3 bg-slate-200 p-1 gap-1 border-b border-slate-300">
                    <button
                      onClick={() => handleTabChange('parte')}
                      className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${mobileTab === 'parte'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>Parte Diario</span>
                    </button>
                    <button
                      onClick={() => handleTabChange('sst')}
                      className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${mobileTab === 'sst'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <HardHat className="w-3.5 h-3.5 text-amber-600" />
                      <span>Checklist SST</span>
                    </button>
                    <button
                      onClick={() => handleTabChange('equipos')}
                      className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${mobileTab === 'equipos'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Inspección Equipos</span>
                    </button>
                  </div>

                  {/* Cuerpo del Formulario Móvil */}
                  <div className="p-4 space-y-4 max-h-[560px] overflow-y-auto">

                    {/* Selector de Obra y Responsable */}
                    <div className="space-y-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Obra / Proyecto Asignado
                        </label>
                        <select
                          value={selectedObra}
                          onChange={(e) => setSelectedObra(e.target.value)}
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-amber-500"
                        >
                          <option value="Obra: Acueducto Norte - Frente 2">Obra: Acueducto Norte - Frente 2</option>
                          <option value="Mina Pirquitas - Movimiento de Suelos">Mina Pirquitas - Movimiento de Suelos</option>
                          <option value="Ruta Prov. 83 - Vial">Ruta Prov. 83 - Vial</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Responsable</label>
                          <input
                            type="text"
                            value={responsable}
                            onChange={(e) => setResponsable(e.target.value)}
                            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded px-2 py-1 mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Norma SGC</label>
                          <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mt-0.5">
                            {mobileTab === 'parte' ? 'ISO 9001 (Calidad)' : 'ISO 45001 (Seguridad)'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Campo adicional si es Parte Diario */}
                    {mobileTab === 'parte' && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Resumen de Avance Diario y Cuadrilla
                        </label>
                        <textarea
                          rows={2}
                          value={observacionesParte}
                          onChange={(e) => setObservacionesParte(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                    )}

                    {/* Ítems de Verificación con botones [OK / NO CUMPLE / N/A] */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Puntos de Control Auditoría
                        </span>
                        <span className="text-[11px] text-slate-500">Toque para calificar</span>
                      </div>

                      {CHECKLIST_QUESTIONS[mobileTab].map((question, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition ${answers[idx] === 'NO CUMPLE'
                              ? 'bg-red-50/70 border-red-300'
                              : 'bg-white border-slate-200'
                            }`}
                        >
                          <p className="text-xs font-medium text-slate-800 mb-2.5 leading-snug">
                            <span className="font-bold text-slate-400 mr-1">{idx + 1}.</span>
                            {question}
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {['OK', 'NO CUMPLE', 'N/A'].map((status) => {
                              const active = answers[idx] === status;
                              let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                              if (active && status === 'OK') btnStyle = 'bg-emerald-600 text-white shadow-xs';
                              if (active && status === 'NO CUMPLE') btnStyle = 'bg-red-600 text-white shadow-xs';
                              if (active && status === 'N/A') btnStyle = 'bg-slate-700 text-white shadow-xs';

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setAnswers({ ...answers, [idx]: status })}
                                  className={`py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${btnStyle}`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Alerta Automática de No Conformidad (NC) si algún ítem es NO CUMPLE */}
                    {hasNonConformity && (
                      <div className="bg-red-950 text-red-100 p-3.5 rounded-xl border border-red-500 space-y-2 animate-fadeIn">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs font-bold leading-snug">
                            ⚠️ Alerta de No Conformidad (NC) detectada - Se notificará a SGC vía n8n/WhatsApp al sincronizar
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-red-200 font-semibold mb-1">
                            Acción Correctiva Inmediata (Obligatorio ISO 45001):
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Describa la medida de mitigación tomada en el frente de obra..."
                            value={accionCorrectiva}
                            onChange={(e) => setAccionCorrectiva(e.target.value)}
                            className="w-full text-xs bg-red-900/60 border border-red-400/50 rounded-lg p-2 text-white placeholder-red-300/60 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Evidencia Fotográfica con Estampa GPS */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-amber-600" />
                          Evidencia Fotográfica ({photos.length})
                        </span>
                        <button
                          type="button"
                          onClick={handleAddPhoto}
                          className="text-[11px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-500/30 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                        >
                          + Capturar Foto GPS
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {photos.map((ph) => (
                          <div key={ph.id} className="bg-slate-900 text-white p-2 rounded-lg text-[10px] flex flex-col justify-between border border-slate-700">
                            <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
                              <span className="truncate">{ph.label}</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            </div>
                            <div className="text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="truncate">{ph.gps} - S.S. de Jujuy</span>
                            </div>
                            <div className="text-slate-500 text-[9px] mt-0.5">Estampa: 02/11/2026 {ph.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Firma Digital Manuscrita en Pantalla (HTML5 Canvas) */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          ✍️ Firma del Capataz / Responsable
                        </span>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Limpiar firma
                        </button>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                        <canvas
                          ref={canvasRef}
                          width={340}
                          height={90}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-[90px] cursor-crosshair touch-none"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>Validez interna SGC GECO S.R.L.</span>
                        <span>GPS: -24.1858, -65.2995</span>
                      </div>
                    </div>

                    {/* Botón Guardar Registro */}
                    <button
                      type="button"
                      onClick={handleSaveRecord}
                      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ClipboardCheck className="w-5 h-5" />
                      {isOffline ? 'Guardar en Cola Local (Modo Offline)' : 'Guardar y Sincronizar Registro ISO'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VISTA 2: PANEL SGC & AUDITORÍA WEB (JIMENA AGUIRRE)
        ========================================================= */}
        {activeView === 'desktop' && (
          <div className="space-y-6">

            {/* Banner Superior del Panel SGC */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    Auditoría Activa · ISO 9001 & 45001
                  </span>
                  <span className="text-xs text-slate-500">Responsable SGC: <strong>Jimena Aguirre</strong></span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Panel Central de Trazabilidad y Evidencias de Obra
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {offlineQueue.length > 0 && (
                  <button
                    onClick={handleSyncOfflineQueue}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recibir {offlineQueue.length} registro(s) en cola móvil
                  </button>
                )}

                <button
                  onClick={() => showToast('📦 Paquete de Auditoría ISO (.XLSX + .PDF firmados) generado y descargado correctamente.', 'success')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  Exportar Paquete Auditoría (.XLSX / .PDF)
                </button>
              </div>
            </div>

            {/* Tarjetas de KPIs en Tiempo Real */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Registros Hoy</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{totalHoy}</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">100% georreferenciados</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Cumplimiento SST</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{cumplimientoPct}%</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Meta anual SGC: ≥ 90%</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">No Conformidades Abiertas</p>
                  <p className="text-2xl font-black text-red-600 mt-1">{totalNC}</p>
                  <p className="text-[11px] text-red-600 font-medium mt-0.5">Alertadas vía WhatsApp</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Obras Activas</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">4</p>
                  <p className="text-[11px] text-amber-600 font-medium mt-0.5">Jujuy · Civil, Vial y Minería</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Barra de Filtros de Auditoría */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Filtrar por Obra / Frente
                </label>
                <select
                  value={filterObra}
                  onChange={(e) => setFilterObra(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="TODAS">Todas las Obras Activas (4)</option>
                  <option value="Obra: Acueducto Norte - Frente 2">Obra: Acueducto Norte - Frente 2</option>
                  <option value="Mina Pirquitas - Movimiento de Suelos">Mina Pirquitas - Movimiento de Suelos</option>
                  <option value="Ruta Prov. 83 - Vial">Ruta Prov. 83 - Vial</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Filtrar por Norma ISO
                </label>
                <select
                  value={filterNorma}
                  onChange={(e) => setFilterNorma(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="TODAS">Todas las Normas (ISO 9001 + ISO 45001)</option>
                  <option value="ISO 45001">ISO 45001 (Seguridad y Salud en el Trabajo)</option>
                  <option value="ISO 9001">ISO 9001 (Calidad de Obra)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Estado de Conformidad
                </label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="Conformidad">✅ En Conformidad</option>
                  <option value="No Conformidad Abierta">⚠️ No Conformidad Abierta</option>
                </select>
              </div>
            </div>

            {/* Tabla de Registros Auditables */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-200 text-[11px] uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-bold">Folio ID</th>
                      <th className="py-3.5 px-4 font-bold">Fecha / Hora</th>
                      <th className="py-3.5 px-4 font-bold">Obra / Ubicación</th>
                      <th className="py-3.5 px-4 font-bold">Tipo de Registro</th>
                      <th className="py-3.5 px-4 font-bold">Responsable</th>
                      <th className="py-3.5 px-4 font-bold">Estado ISO</th>
                      <th className="py-3.5 px-4 font-bold text-right">Acción Auditor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {rec.id}
                          <div className="text-[10px] font-sans font-normal text-slate-400">{rec.syncMode}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{rec.fecha}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{rec.obra}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            {rec.gps}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{rec.tipo}</span>
                          <div className="text-[10px] text-slate-500">{rec.norma} · {rec.fotos} foto(s)</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{rec.responsable}</td>
                        <td className="py-3.5 px-4">
                          {rec.estado === 'Conformidad' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Conformidad
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                              <AlertTriangle className="w-3.5 h-3.5" /> No Conformidad Abierta
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedRecordModal(rec)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-900 hover:text-slate-950 font-bold rounded-lg border border-amber-500/30 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Evidencia / PDF ISO
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL FORMAL DE AUDITORÍA ISO (PDF PREVIEW)
      ========================================================= */}
      {selectedRecordModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8">

            {/* Encabezado Formal Documento Controlado ISO */}
            <div className="bg-slate-100 p-4 border-b-2 border-slate-800">
              <div className="grid grid-cols-12 border border-slate-800 bg-white text-xs">
                <div className="col-span-3 p-3 border-r border-slate-800 flex flex-col justify-center items-center text-center">
                  <div className="font-black text-base tracking-tight text-slate-900">GECO S.R.L.</div>
                  <div className="text-[10px] text-slate-500">Constructora · Jujuy</div>
                </div>
                <div className="col-span-6 p-3 border-r border-slate-800 flex flex-col justify-center items-center text-center">
                  <div className="font-bold text-slate-900 uppercase text-[11px]">
                    Sistema de Gestión Integrado ISO 9001 / 45001
                  </div>
                  <div className="font-black text-xs text-amber-700 mt-1">
                    {selectedRecordModal.tipo.toUpperCase()}
                  </div>
                </div>
                <div className="col-span-3 p-2 text-[10px] space-y-1 font-mono text-slate-700 flex flex-col justify-center">
                  <div><strong>Código:</strong> REG-SST-04</div>
                  <div><strong>Revisión:</strong> 02</div>
                  <div><strong>Folio:</strong> {selectedRecordModal.id}</div>
                </div>
              </div>
            </div>

            {/* Contenido del Registro Auditado */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Obra / Frente</span>
                  <span className="font-bold text-slate-900">{selectedRecordModal.obra}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha y Hora</span>
                  <span className="font-bold text-slate-900">{selectedRecordModal.fecha}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsable en Obra</span>
                  <span className="font-bold text-slate-900">{selectedRecordModal.responsable}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordenadas GPS Certificadas</span>
                  <span className="font-mono text-slate-800">{selectedRecordModal.gps}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dictamen</span>
                  <span className={`font-bold ${selectedRecordModal.estado === 'Conformidad' ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                    {selectedRecordModal.estado}
                  </span>
                </div>
              </div>

              {/* Lista de puntos verificados */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2">
                  Detalle de Puntos Verificados en Terreno
                </h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-200">
                  {selectedRecordModal.respuestas.map((r, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between gap-2">
                      <span className="text-slate-700">{i + 1}. {r.item}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${r.valor === 'OK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.valor === 'NO CUMPLE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                        {r.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acción Correctiva si existe */}
              {selectedRecordModal.accionCorrectiva && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                  <div className="font-bold text-red-800 uppercase text-[10px] mb-1">
                    Acción Correctiva Registrada (Tratamiento de Hallazgo ISO 45001):
                  </div>
                  <p className="text-red-950 font-medium">{selectedRecordModal.accionCorrectiva}</p>
                </div>
              )}

              {/* Pie de Firma Digital y Trazabilidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 items-center">
                <div className="space-y-1 text-[11px] text-slate-500">
                  <div><strong>Método de captura:</strong> PWA Móvil ({selectedRecordModal.syncMode})</div>
                  <div><strong>Evidencias adjuntas:</strong> {selectedRecordModal.fotos} fotografías georreferenciadas</div>
                  <div><strong>Hash Integridad SGC:</strong> <span className="font-mono">sha256:9f84a2c...e71b</span></div>
                </div>
                <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-center">
                  <div className="italic font-serif text-lg text-slate-800 select-none">
                    {selectedRecordModal.responsable.split(' ')[0]} {selectedRecordModal.responsable.split(' ')[1]}
                  </div>
                  <div className="border-t border-slate-300 mt-1 pt-1 text-[10px] font-bold text-slate-600">
                    Firma Digital Registrada en Dispositivo
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  showToast(`📄 Documento ${selectedRecordModal.id} exportado en formato PDF oficial ISO.`, 'success');
                  setSelectedRecordModal(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Descargar PDF Firmado
              </button>
              <button
                onClick={() => setSelectedRecordModal(null)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}