import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, X, Clock } from 'lucide-react';

// Types
type TimerPreset = {
  id: string;
  label: string;
  seconds: number;
};

const PRESETS: TimerPreset[] = [
  { id: '1', label: '1 Menit', seconds: 60 },
  { id: '2', label: '2 Jam', seconds: 7200 },
  { id: '3', label: '3 Jam', seconds: 10800 },
  { id: '4', label: '4 Jam', seconds: 14400 },
  { id: '5', label: '5 Jam', seconds: 18000 },
  { id: '6', label: '6 Jam', seconds: 21600 },
  { id: '7', label: '7 Jam', seconds: 25200 },
  { id: '8', label: '8 Jam', seconds: 28800 },
  { id: '9', label: '9 Jam', seconds: 32400 },
  { id: 'loss', label: 'Loss Doll', seconds: 43200 },
];

export default function App() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUltraSmall, setIsUltraSmall] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    let holdInterval: NodeJS.Timeout;
    if (isHolding) {
      const startTime = Date.now();
      holdInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / 5000) * 100, 100);
        setHoldProgress(progress);
        
        if (progress >= 100) {
          setIsHolding(false);
          setHoldProgress(0);
          handleResetAttempt();
        }
      }, 50);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(holdInterval);
  }, [isHolding]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && timeLeft !== null) { // Only left click and when session is active
      setIsHolding(true);
    }
  };

  const handleMouseUp = () => {
    setIsHolding(false);
  };

  const handleResetAttempt = () => {
    setShowPasswordPrompt(true);
    setPasswordInput('');
    setPasswordError(false);
  };

  const verifyPassword = () => {
    if (passwordInput === 'Admin999') {
      resetTimer();
      setShowPasswordPrompt(false);
    } else {
      setPasswordError(true);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = (preset: TimerPreset) => {
    setSelectedPreset(preset);
    setTimeLeft(preset.seconds);
    setIsActive(true);
    setIsMinimized(true);
  };

  const resetTimer = () => {
    setTimeLeft(null);
    setIsActive(false);
    setSelectedPreset(null);
    setIsMinimized(false);
    setIsUltraSmall(false);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? '0' + v : v))
      .join(':');
  };

  const isWarningTime = timeLeft !== null && timeLeft <= 60 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-brand-bg font-sans overflow-hidden">
      {/* Password Prompt Overlay (Global) */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-brand-dark p-8 rounded-[32px] border-2 border-white/20 shadow-2xl w-full max-w-sm"
            >
              <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-center">Akses Admin Diperlukan</h3>
              <div className="flex flex-col gap-4">
                <input 
                  type="password"
                  placeholder="Masukkan Kata Sandi"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                  className={`w-full bg-[#1A1D23] border-2 ${passwordError ? 'border-red-500' : 'border-brand-border'} p-4 rounded-xl text-white text-center font-bold tracking-widest focus:outline-none focus:border-brand-accent transition-colors`}
                  autoFocus
                />
                {passwordError && (
                  <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">Kata Sandi Salah - Akses Ditolak</span>
                )}
                <button
                  onClick={verifyPassword}
                  className="bg-brand-accent hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all"
                >
                  Konfirmasi
                </button>
                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  className="text-[#8E9299] hover:text-white text-xs font-bold uppercase tracking-widest"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layar Sesi Selesai (Full Screen Overlay) */}
      <AnimatePresence>
        {isTimeUp && !showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-red-600/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center p-8 md:p-12 w-full max-w-md"
            >
              <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4 glow-text">
                SESI BERAKHIR
              </h2>
              <p className="text-lg md:text-2xl font-bold text-white/80 uppercase tracking-[0.4em] mb-12">
                Silahkan Hubungi Admin
              </p>
              <button
                onClick={handleResetAttempt}
                className="bg-white text-red-600 px-12 py-4 rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-gray-100 transition-all shadow-2xl active:scale-95"
              >
                KEMBALI KE MENU
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Popup Timer */}
      <AnimatePresence>
        {timeLeft !== null && isMinimized && !isTimeUp && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isUltraSmall ? '120px' : '256px',
            }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="fixed bottom-8 right-8 z-50 bg-brand-panel border-2 border-brand-accent rounded-2xl shadow-2xl p-3 flex flex-col gap-2 overflow-hidden transition-all duration-300 cursor-pointer select-none"
          >
            <div className="flex justify-between items-center px-1">
              {!isUltraSmall && (
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">Pantauan Langsung</span>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUltraSmall(!isUltraSmall);
                  }}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {isUltraSmall ? <Play size={14} className="rotate-90" /> : <Clock size={14} />}
                </button>
              </div>
            </div>
            
            <div className={`font-mono font-bold text-center leading-none ${isUltraSmall ? 'text-xl py-1' : 'text-3xl'} ${isWarningTime ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {isUltraSmall ? formatTime(timeLeft).substring(0, 5) : formatTime(timeLeft)}
            </div>

            {!isUltraSmall && (
              <>
                {isWarningTime && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg py-1 px-2 text-center">
                    <span className="text-[10px] font-black text-red-500 animate-bounce block uppercase tracking-widest">WAKTU HABIS</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Overlay (Full Screen Flash) */}
      <AnimatePresence>
        {isWarningTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 z-0 bg-red-600 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#1E232B_0%,_#0A0C10_100%)] opacity-80" />
      
      {/* Main Glass Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isMinimized ? 0 : 1, scale: isMinimized ? 0.9 : 1 }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative z-10 w-full max-w-5xl h-auto md:h-[650px] bg-brand-dark rounded-[40px] border-2 border-brand-border flex flex-col md:flex-row shadow-2xl overflow-hidden ${isMinimized ? 'pointer-events-none' : 'cursor-pointer select-none'}`}
      >
        {/* Left Section: Active Timer & Branding */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-border">
          <div>
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isWarningTime ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]' : 'bg-brand-accent shadow-[0_0_8px_#22C55E]'} animate-pulse`} />
                <div className="flex flex-col">
                  <span className="text-[#8E9299] text-[10px] font-bold tracking-[0.2em] uppercase leading-tight">
                    Sistem Hachiko v1.5 • {isActive ? 'Berjalan' : 'Jeda'}
                  </span>
                  <span className="text-brand-accent/50 text-[8px] font-bold tracking-[0.3em] uppercase mt-0.5">
                    Ary Computer
                  </span>
                </div>
              </div>
              {timeLeft !== null && !isMinimized && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                  className="bg-[#1A1D23] border border-brand-border p-2 rounded-xl text-gray-500 hover:text-white transition-colors"
                >
                  <Clock size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-col mb-12">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150&h=150" 
                  alt="Hachiko Logo" 
                  className="w-16 h-16 object-cover rounded-2xl border-2 border-brand-border"
                />
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-white uppercase leading-none mb-1">
                    HACHIKO
                  </h1>
                  <p className="text-xs font-bold text-blue-400 tracking-widest uppercase">
                    Entertainment Center
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {timeLeft !== null ? (
                  <motion.div
                    key="active-timer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col"
                  >
                    {isWarningTime && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-600 self-start px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 animate-bounce"
                      >
                        WAKTU HABIS (Warning)
                      </motion.div>
                    )}
                    <div className={`flex items-end gap-2 glow-text transition-colors duration-500 ${isWarningTime ? 'text-red-500' : 'text-white'}`}>
                      <span className="text-[100px] md:text-[140px] leading-none font-bold font-mono tracking-tighter">
                        {formatTime(timeLeft).split(':')[0]}
                      </span>
                      <span className="text-3xl font-bold font-mono mb-4 text-[#8E9299]">j</span>
                      <span className="text-[100px] md:text-[140px] leading-none font-bold font-mono tracking-tighter ml-4">
                        {formatTime(timeLeft).split(':')[1]}
                      </span>
                      <span className="text-3xl font-bold font-mono mb-4 text-[#8E9299]">m</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12"
                  >
                    <p className="text-4xl md:text-5xl font-mono text-brand-border font-bold tracking-tighter">
                      PILIH<br />SESI
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {timeLeft !== null ? (
              <div className="w-full h-20 border-2 border-dashed border-brand-border rounded-2xl flex flex-col items-center justify-center gap-2 opacity-40">
                <span className="text-[10px] text-brand-border uppercase font-black tracking-widest text-center">
                  Sesi Berjalan
                </span>
              </div>
            ) : (
              <div className="w-full h-20 border-2 border-dashed border-brand-border rounded-2xl flex items-center justify-center">
                <span className="text-[10px] text-brand-border uppercase font-black tracking-widest">
                  Menunggu Input
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Preset Grid */}
        <div className="w-full md:w-1/2 bg-brand-panel p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
          <div>
            <h3 className="text-[#8E9299] text-[10px] font-bold tracking-widest uppercase mb-8 flex items-center gap-2">
              <Clock size={12} className="text-blue-400" />
              Preset Manual
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-12">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => startTimer(preset)}
                  className={`
                    group relative py-4 px-6 rounded-xl flex justify-between items-center transition-all duration-300
                    ${selectedPreset?.id === preset.id 
                      ? 'bg-brand-accent/10 border-brand-accent text-white border-2' 
                      : 'bg-[#1A1D23] border border-brand-border hover:border-[#363C47] text-[#8E9299] hover:text-white'}
                  `}
                >
                  <span className="font-bold text-sm tracking-tight">{preset.label}</span>
                  <span className={`font-bold font-mono text-xs ${selectedPreset?.id === preset.id ? 'text-brand-accent' : 'text-[#4B515D]'}`}>
                    {Math.floor(preset.seconds / 60)}:00
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-brand-border">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#4B515D] uppercase font-bold tracking-[0.2em] mb-1">Mode Sesi</span>
                <span className="text-xs text-white font-medium">Standar</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#4B515D] uppercase font-bold tracking-[0.2em] mb-1">Reset Otomatis</span>
                <span className="text-xs text-white font-medium">Nonaktif</span>
              </div>
            </div>
            
            <button className="w-10 h-10 rounded-full bg-[#1A1D23] flex items-center justify-center text-[#8E9299] text-xs font-bold border border-brand-border hover:border-white transition-colors">
              ?
            </button>
          </div>
        </div>
      </motion.div>

      {/* Decorative UI elements */}
      <div className="absolute top-8 left-8 text-[10px] text-white/20 font-mono tracking-widest uppercase rotate-90 origin-left hidden lg:block">
        Hachiko_Network_OS
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] text-white/20 font-mono tracking-widest uppercase hidden lg:block">
        Security_Protocol_Active
      </div>
    </div>
  );
}
