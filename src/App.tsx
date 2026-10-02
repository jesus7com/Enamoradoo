import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Mail, Calendar, Clock, Check, X, Sparkles, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Stage = 'closed' | 'question' | 'form' | 'confirmed';

interface SavedDate {
  date_date: string;
  date_time: string;
  message: string | null;
}

function App() {
  const [stage, setStage] = useState<Stage>('closed');
  const [opening, setOpening] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noButtonStyle, setNoButtonStyle] = useState<React.CSSProperties>({});
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [messageValue, setMessageValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedDate, setSavedDate] = useState<SavedDate | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; delay: number; duration: number; size: number }[]>([]);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const heartsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Floating hearts background animation
  useEffect(() => {
    let id = 0;
    const createHeart = () => {
      setHearts((prev) => [
        ...prev.slice(-20),
        {
          id: id++,
          x: Math.random() * 100,
          delay: Math.random() * 2,
          duration: 6 + Math.random() * 6,
          size: 14 + Math.random() * 24,
        },
      ]);
    };
    heartsIntervalRef.current = setInterval(createHeart, 800);
    return () => {
      if (heartsIntervalRef.current) clearInterval(heartsIntervalRef.current);
    };
  }, []);

  const handleOpenLetter = () => {
    setOpening(true);
    setTimeout(() => {
      setStage('question');
      setOpening(false);
    }, 1200);
  };

  const handleYes = () => {
    setStage('form');
  };

  const handleNoHover = useCallback(() => {
    const padding = 40;
    const maxX = window.innerWidth - 200 - padding;
    const maxY = window.innerHeight - 60 - padding;
    const x = Math.random() * maxX - maxX / 2;
    const y = Math.random() * maxY - maxY / 2;
    setNoPosition({ x, y });
    setNoButtonStyle({
      transform: `translate(${x}px, ${y}px)`,
    });
  }, []);

  const handleConfirm = async () => {
    if (!dateValue || !timeValue) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('date_responses')
      .insert({
        date_date: dateValue,
        date_time: timeValue,
        message: messageValue || null,
        confirmed: true,
      })
      .select('date_date, date_time, message')
      .single();

    setSaving(false);

    if (error || !data) {
      // Still show the confirmation screen with the entered values
      setSavedDate({
        date_date: dateValue,
        date_time: timeValue,
        message: messageValue || null,
      });
      setStage('confirmed');
      return;
    }

    setSavedDate(data as SavedDate);
    setStage('confirmed');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const noButtonClicks = useRef(0);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-rose-900 via-red-800 to-rose-950 flex items-center justify-center p-4 sm:p-6 relative">
      {/* Floating hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="absolute text-rose-400/20 animate-float-up"
            style={{
              left: `${h.x}%`,
              bottom: '-40px',
              fontSize: `${h.size}px`,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
            }}
          >
            <Heart fill="currentColor" />
          </div>
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* === CLOSED LETTER === */}
      {stage === 'closed' && (
        <div className="relative z-10 text-center cursor-pointer group" onClick={handleOpenLetter}>
          <div
            className={`transition-all duration-1000 ease-out ${
              opening ? 'scale-90 opacity-0 -translate-y-10' : 'scale-100 opacity-100'
            }`}
          >
            {/* Envelope */}
            <div className="relative mx-auto w-72 h-48 sm:w-96 sm:h-64">
              {/* Envelope body */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-rose-100 rounded-lg shadow-2xl" />
              {/* Envelope flap */}
              <div
                className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-rose-300 to-rose-200 transition-all duration-1000 origin-top ${
                  opening ? 'rotate-180 -translate-y-1/2' : ''
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  zIndex: 2,
                }}
              />
              {/* Wax seal */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center shadow-xl ring-4 ring-red-300/40">
                  <Heart className="w-7 h-7 sm:w-9 sm:h-9 text-rose-100" fill="currentColor" />
                </div>
              </div>
              {/* Envelope shadow line */}
              <div className="absolute bottom-1/2 left-0 right-0 h-px bg-rose-300/40" />
            </div>

            <p className="mt-8 text-rose-100/90 text-sm sm:text-base tracking-wide group-hover:text-rose-50 transition-colors animate-pulse">
              Toca para abrir tu carta
            </p>
          </div>
        </div>
      )}

      {/* === QUESTION STAGE === */}
      {stage === 'question' && (
        <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
          <div className="bg-gradient-to-b from-amber-50 to-rose-50 rounded-2xl shadow-2xl p-8 sm:p-12 border border-rose-200/50 relative overflow-hidden">
            {/* Decorative corners */}
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-rose-300/60" />
            <Sparkles className="absolute bottom-4 left-4 w-5 h-5 text-rose-300/60" />

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-red-500 mb-6 shadow-lg">
                <Mail className="w-7 h-7 text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rose-900 mb-3 leading-tight">
                Mi amor,
              </h1>
              <p className="text-rose-800/80 text-base sm:text-lg leading-relaxed mb-2 font-serif">
                Estoy loco por verte mami, y enamorado de ti hahaha
              </p>
              <p className="text-rose-800/80 text-base sm:text-lg leading-relaxed mb-6 font-serif">
                ¿Quieres salir conmigo?
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-6 mt-8 relative h-16">
                <button
                  onClick={handleYes}
                  className="px-8 py-3 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-2 z-10"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                  Sí
                </button>

                <button
                  ref={noButtonRef}
                  onMouseEnter={handleNoHover}
                  onTouchStart={handleNoHover}
                  onClick={() => {
                    noButtonClicks.current++;
                    handleNoHover();
                  }}
                  style={noButtonStyle}
                  className="px-8 py-3 bg-gray-200 text-gray-500 rounded-full font-semibold shadow-md transition-all duration-300 flex items-center gap-2 select-none"
                >
                  <X className="w-5 h-5" />
                  No
                </button>
              </div>

              {noButtonClicks.current > 2 && (
                <p className="mt-4 text-rose-400/70 text-xs animate-fade-in">
                  Ese botón no se deja atrapar tan fácil... 💕
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === DATE FORM STAGE === */}
      {stage === 'form' && (
        <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
          <div className="bg-gradient-to-b from-amber-50 to-rose-50 rounded-2xl shadow-2xl p-8 sm:p-12 border border-rose-200/50 relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-rose-300/60" />
            <Sparkles className="absolute bottom-4 left-4 w-5 h-5 text-rose-300/60" />

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-red-500 mb-6 shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rose-900 mb-2 leading-tight">
                ¡Sabía que dirías que sí!
              </h1>
              <p className="text-rose-800/80 text-base sm:text-lg leading-relaxed mb-8 font-serif">
                Una cita para conocernos más, mi amor.
                <br />
                Elige el día y la hora que prefieras.
              </p>

              {/* Form */}
              <div className="space-y-5 text-left">
                {/* Date */}
                <div>
                  <label className="flex items-center gap-2 text-rose-900 font-semibold text-sm mb-2">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    Día de la cita
                  </label>
                  <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-rose-200 bg-white/80 text-rose-900 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="flex items-center gap-2 text-rose-900 font-semibold text-sm mb-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    Hora de la cita
                  </label>
                  <input
                    type="time"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-rose-200 bg-white/80 text-rose-900 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                </div>

                {/* Optional message */}
                <div>
                  <label className="flex items-center gap-2 text-rose-900 font-semibold text-sm mb-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Mensaje (opcional)
                  </label>
                  <textarea
                    value={messageValue}
                    onChange={(e) => setMessageValue(e.target.value)}
                    rows={3}
                    placeholder="Escríbele algo bonito a tu amor..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-rose-200 bg-white/80 text-rose-900 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all resize-none placeholder:text-rose-300"
                  />
                </div>

                {/* Confirm button */}
                <button
                  onClick={handleConfirm}
                  disabled={!dateValue || !timeValue || saving}
                  className="w-full py-3.5 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === CONFIRMED STAGE === */}
      {stage === 'confirmed' && savedDate && (
        <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
          <div className="bg-gradient-to-b from-amber-50 to-rose-50 rounded-2xl shadow-2xl p-8 sm:p-12 border border-rose-200/50 relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-rose-300/60" />
            <Sparkles className="absolute bottom-4 left-4 w-5 h-5 text-rose-300/60" />
            <Sparkles className="absolute top-1/2 left-4 w-4 h-4 text-rose-300/40" />
            <Sparkles className="absolute top-1/3 right-6 w-4 h-4 text-rose-300/40" />

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg animate-bounce-once">
                <Check className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rose-900 mb-4 leading-tight">
                ¡Cita confirmada!
              </h1>

              <p className="text-rose-800/70 text-sm font-serif mb-6">
                Será el mejor día para los dos
              </p>

              {/* Date card */}
              <div className="bg-gradient-to-br from-rose-100 to-amber-50 rounded-xl p-6 border border-rose-200/50 mb-6 space-y-4">
                <div className="flex items-center justify-center gap-3 text-rose-900">
                  <Calendar className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base capitalize">
                    {formatDate(savedDate.date_date)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 text-rose-900">
                  <Clock className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">
                    {formatTime(savedDate.date_time)}
                  </span>
                </div>
                {savedDate.message && (
                  <div className="pt-3 border-t border-rose-200/40">
                    <p className="text-rose-700/80 font-serif italic text-sm sm:text-base leading-relaxed">
                      "{savedDate.message}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-rose-400">
                <Heart className="w-5 h-5 animate-heartbeat" fill="currentColor" />
                <Heart className="w-4 h-4 animate-heartbeat-delay" fill="currentColor" />
                <Heart className="w-5 h-5 animate-heartbeat" fill="currentColor" />
              </div>

              <p className="mt-6 text-rose-800/60 font-serif text-sm">
                Estoy enamorado infinitamente
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');

        .font-serif {
          font-family: 'Cormorant Garamond', serif;
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) scale(1.2) rotate(15deg);
            opacity: 0;
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        @keyframes bounce-once {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .animate-float-up {
          animation: float-up linear forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out forwards;
        }

        .animate-heartbeat {
          animation: heartbeat 1.2s ease-in-out infinite;
        }

        .animate-heartbeat-delay {
          animation: heartbeat 1.2s ease-in-out 0.3s infinite;
        }

        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
