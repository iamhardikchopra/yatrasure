/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  ArrowUpDown, 
  MapPin, 
  Train, 
  Ticket, 
  Star, 
  Car, 
  Bike, 
  Clock, 
  Coins, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Navigation, 
  Zap, 
  Check, 
  CheckCircle, 
  TrendingUp, 
  User, 
  Map, 
  Layers, 
  MessageSquare, 
  Phone, 
  Bell, 
  Sparkles,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { JOURNEY_OPTIONS, TIMELINE_STEPS, HEATMAP_POINTS } from './data';
import { JourneyOption, TimelineStep, StationHeatmapPoint } from './types';

export default function App() {
  // Screens state management
  const [activeScreen, setActiveScreen] = useState<
    'home' | 'rider-journey' | 'rider-options' | 'rider-confirmed' | 'driver-alert' | 'driver-heatmap'
  >('home');
  const [history, setHistory] = useState<string[]>(['home']);

  // Rider inputs
  const [source, setSource] = useState('IIM Mumbai, Powai');
  const [destination, setDestination] = useState('Rameshwaram Cafe, Churchgate, Mumbai');
  const [selectedOption, setSelectedOption] = useState<JourneyOption>(JOURNEY_OPTIONS[5]); // Default to Hero (Bike+Metro)
  const [isComparing, setIsComparing] = useState(false);

  // Driver States
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [earningsToday, setEarningsToday] = useState(1240);
  const [hoveredStation, setHoveredStation] = useState<string | null>('churchgate');
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [driverSimState, setDriverSimState] = useState<'idle' | 'heading' | 'arrived' | 'completed'>('idle');
  const [driverProgress, setDriverProgress] = useState(0); // For progress slider in navigation simulation
  const [driverRideAccepted, setDriverRideAccepted] = useState(false);

  // Rider journey simulation
  const [currentTimeline, setCurrentTimeline] = useState<TimelineStep[]>(TIMELINE_STEPS);
  const [riderSimPlaying, setRiderSimPlaying] = useState(false);
  const [riderSimCompleted, setRiderSimCompleted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Auto-run simulation step timers if rider clicked start simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (riderSimPlaying) {
      interval = setInterval(() => {
        setCurrentTimeline(prev => {
          const next = [...prev];
          const activeIndex = next.findIndex(step => step.active);
          if (activeIndex !== -1) {
            next[activeIndex].completed = true;
            next[activeIndex].active = false;
            if (activeIndex + 1 < next.length) {
              next[activeIndex + 1].active = true;
              showToast(`Leg ${activeIndex + 1} completed! Proceeding to metro leg...`);
            } else {
              setRiderSimPlaying(false);
              setRiderSimCompleted(true);
              showToast("🎉 You've arrived at Rameshwaram Cafe! Total time: 28 mins.");
            }
          } else {
            // Nothing active, make first active
            next[0].active = true;
          }
          return next;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [riderSimPlaying]);

  // Driver navigation animation
  useEffect(() => {
    let animFrame: any;
    if (navigationStarted && driverProgress < 100) {
      const step = () => {
        setDriverProgress(prev => {
          if (prev >= 100) {
            setDriverSimState('arrived');
            setEarningsToday(cur => cur + 150);
            showToast("📍 Arrived! Riden Swetha boarded. Earned ₹150 + ₹30 on completion!");
            cancelAnimationFrame(animFrame);
            return 100;
          }
          return prev + 1; // progress incrementally
        });
        animFrame = requestAnimationFrame(step);
      };
      animFrame = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [navigationStarted, driverProgress]);

  // Toast notification helper
  const showToast = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Back-button navigation helper
  const navigateTo = (screen: typeof activeScreen) => {
    setHistory(prev => [...prev, screen]);
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current
      const prevScreen = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setActiveScreen(prevScreen as any);
    } else {
      setActiveScreen('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    showToast("📍 Route swapped!");
  };

  const startRiderSimulation = () => {
    // Reset timeline
    setCurrentTimeline(TIMELINE_STEPS.map((step, idx) => ({
      ...step,
      completed: false,
      active: idx === 0
    })));
    setRiderSimPlaying(true);
    setRiderSimCompleted(false);
    showToast("⚡ Autonomous multi-modal simulation started! Keep watching.");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-mint-green selection:text-navy-dark text-slate-800 bg-[#F0F9FB]">
      
      {/* Toast Notification */}
      {notification && (
        <div id="global-toast" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce bg-navy-dark text-white border border-mint-green px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
          <Sparkles className="text-mint-green min-w-[20px] animate-spin" size={20} />
          <p className="text-sm font-semibold tracking-wide">{notification}</p>
        </div>
      )}

      {/* Primary viewport body */}
      <main className="flex-grow w-full">
        
        {/* ======================================= */}
        {/* SCREEN 1: HOME PANEL                    */}
        {/* ======================================= */}
        <div 
          id="screen-home" 
          className={`screen w-full min-h-screen bg-navy-dark text-white flex flex-col justify-between transition-all duration-300 ${
            activeScreen === 'home' ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        >
          {/* Top Bar */}
          <header className="px-6 py-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/5 bg-navy-dark/95 backdrop-blur-sm sticky top-0 z-10 w-full">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-mint-green to-teal-brand p-2 rounded-lg">
                <Compass className="text-navy-dark animate-spin-slow animate-dot-pulse" size={24} />
              </div>
              <span className="text-2xl font-extrabold tracking-wider text-white">Yatra<span className="text-mint-green">Sure</span></span>
            </div>
            <div className="flex items-center gap-2 border border-teal-brand/30 bg-teal-brand/10 rounded-full px-4 py-1">
              <span className="w-2 h-2 bg-mint-green rounded-full animate-ping"></span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#02C39A]">India's Predictive Mobility Platform</span>
            </div>
          </header>

          {/* Hero Content */}
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
            {/* Tagline text left side */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="flex flex-col text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                <span className="text-white drop-shadow-md">One Booking.</span>
                <span className="text-mint-green bg-gradient-to-r from-mint-green to-teal-brand bg-clip-text text-transparent">Complete Journey.</span>
                <span className="text-white drop-shadow-md">Guaranteed.</span>
              </div>
              <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Pre-booked first mile. Metro leg secured. Pre-booked last mile waiting. Zero cancellation risk. <span className="text-mint-green font-medium">India's first auto-synchronized smart multi-modal planner.</span>
              </p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-navy bg-slate-600 flex items-center justify-center font-mono text-[10px] text-white">MUM</div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary-navy bg-slate-700 flex items-center justify-center font-mono text-[10px] text-white">BLR</div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary-navy bg-slate-800 flex items-center justify-center font-mono text-[10px] text-white">DEL</div>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Currently active across major transit grids
                </div>
              </div>
            </div>

            {/* Visual cards right side */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              
              {/* RIDER COLUMN CARD */}
              <div 
                id="cta-rider-card"
                className="group bg-white rounded-3xl border-2 border-teal-brand/30 p-8 shadow-2xl hover:border-mint-green transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between min-h-[360px]"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#E6F9F5] flex items-center justify-center mb-6 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-teal-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-navy-dark leading-tight">I am a Rider</h3>
                  <p className="text-slate-500 font-normal text-sm mt-2 leading-relaxed">
                    Plan my entire journey door-to-door with guaranteed multi-leg timing.
                  </p>
                </div>
                <button 
                  id="btn-start-rider"
                  onClick={() => navigateTo('rider-journey')}
                  className="mt-8 bg-teal-brand text-white hover:bg-navy-dark py-4 px-6 rounded-xl font-bold transition-all duration-150 inline-flex items-center justify-center gap-2 group-hover:gap-4 shadow-lg active:scale-95 cursor-pointer"
                >
                  Start Journey <span className="text-mint-green text-lg">→</span>
                </button>
              </div>

              {/* DRIVER COLUMN CARD */}
              <div 
                id="cta-driver-card"
                className="group bg-white rounded-3xl border-2 border-teal-brand/30 p-8 shadow-2xl hover:border-[#F59E0B] transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between min-h-[360px]"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#FFFBF0] flex items-center justify-center mb-6 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-[#F59E0B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="8" />
                      <circle cx="11.5" cy="11.5" r="1.5" strokeWidth="3" />
                      <line x1="12" y1="2" x2="12" y2="22" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-navy-dark leading-tight">I am a Driver</h3>
                  <p className="text-slate-500 font-normal text-sm mt-2 leading-relaxed">
                    See high-demand alerts from metro arrivals. Secure back-to-back pre-committed fares.
                  </p>
                </div>
                <button 
                  id="btn-start-driver"
                  onClick={() => navigateTo('driver-alert')}
                  className="mt-8 bg-[#F59E0B] text-navy-dark hover:bg-navy-dark hover:text-white py-4 px-6 rounded-xl font-bold transition-all duration-150 inline-flex items-center justify-center gap-2 group-hover:gap-4 shadow-lg active:scale-95 cursor-pointer"
                >
                  View Dashboard <span className="text-teal-brand text-lg">→</span>
                </button>
              </div>

            </div>
          </div>

          {/* Home Footer Banner */}
          <footer className="w-full text-center py-6 border-t border-white/5 bg-navy-dark text-slate-400 text-xs tracking-wider">
            Currently serving Mumbai · Delhi · Bengaluru · 7 lakh+ drivers on network
          </footer>
        </div>


        {/* ======================================= */}
        {/* SCREEN 2: RIDER - PLAN JOURNEY VIEW      */}
        {/* ======================================= */}
        <div 
          id="screen-rider-journey" 
          className={`screen w-full min-h-screen bg-[#F0F9FB] pb-12 transition-all duration-300 ${
            activeScreen === 'rider-journey' ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        >
          {/* Navigation Bar */}
          <nav className="bg-navy-dark px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
            <button 
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 text-white font-semibold cursor-pointer hover:text-mint-green"
            >
              <Compass className="text-mint-green" size={20} />
              <span className="text-xl font-extrabold tracking-wider">Yatra<span className="text-mint-green">Sure</span></span>
            </button>
            <button 
              onClick={goBack}
              className="text-[#028090] border border-[#028090]/50 hover:bg-[#028090]/10 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95"
            >
              ← Back
            </button>
          </nav>

          {/* Form Content */}
          <div className="max-w-xl mx-auto px-6 pt-8">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-navy-dark leading-tight">Plan Your Journey</h1>
              <p className="text-slate-500 text-sm mt-1">We'll secure, auto-book, and match every leg of your journey automatically.</p>
            </div>

            {/* Input Card Container */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 relative group">
              
              {/* FROM Leg */}
              <div className="flex items-start gap-4 pb-5 relative">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#E6F9V5] border-2 border-mint-green flex items-center justify-center z-10">
                    <span className="h-2 w-2 rounded-full bg-mint-green animate-dot-pulse"></span>
                  </div>
                  {/* Vertical connecting line */}
                  <div className="w-0.5 h-16 bg-gradient-to-b from-mint-green to-teal-brand mt-1"></div>
                </div>
                <div className="flex-grow">
                  <span className="text-[11px] font-black tracking-widest text-teal-brand uppercase block mb-1">FROM</span>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={source} 
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full text-navy-dark font-medium text-base bg-slate-50/80 hover:bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-brand"
                    />
                    <span className="absolute right-3 top-3 text-[10px] text-teal-brand font-bold bg-[#E6F9F5] px-2 py-1 rounded-md">● Your Location</span>
                  </div>
                </div>
              </div>

              {/* Swap Button Absolute Divider */}
              <div className="absolute left-9 top-1/2 -translate-y-1/2 z-20">
                <button 
                  onClick={handleSwap}
                  className="w-10 h-10 rounded-full bg-white border-2 border-teal-brand shadow-md hover:bg-teal-brand hover:text-white text-teal-brand flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer"
                  title="Swap destination and origin"
                >
                  <ArrowUpDown size={18} />
                </button>
              </div>

              {/* TO Leg */}
              <div className="flex items-start gap-4 pt-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#FFF0EE] border-2 border-error-red flex items-center justify-center z-10">
                    <MapPin className="text-error-red" size={12} />
                  </div>
                </div>
                <div className="flex-grow">
                  <span className="text-[11px] font-black tracking-widest text-teal-brand uppercase block mb-1">TO</span>
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-navy-dark font-medium text-base bg-slate-50/80 hover:bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-brand"
                  />
                </div>
              </div>

            </div>

            {/* Feature pill badges */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              <div className="bg-[#E6F6F8] p-3 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
                <span className="text-base block mb-1">🎟</span>
                <span className="text-[10px] font-bold text-teal-brand tracking-tight max-w-[100px] leading-tight block mx-auto">
                  Metro ticket auto-booked
                </span>
              </div>
              <div className="bg-[#E6F6F8] p-3 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
                <span className="text-base block mb-1">🔒</span>
                <span className="text-[10px] font-bold text-teal-brand tracking-tight max-w-[100px] leading-tight block mx-auto">
                  Ride pre-committed
                </span>
              </div>
              <div className="bg-[#E6F6F8] p-3 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
                <span className="text-base block mb-1">⚡</span>
                <span className="text-[10px] font-bold text-teal-brand tracking-tight max-w-[100px] leading-tight block mx-auto">
                  Best price guaranteed
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button 
                id="btn-find-journey"
                onClick={() => {
                  setIsComparing(true);
                  setTimeout(() => {
                    setIsComparing(false);
                    navigateTo('rider-options');
                  }, 1200);
                }}
                disabled={isComparing}
                className="w-full bg-teal-brand hover:bg-navy-dark text-white font-extrabold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-3"
              >
                {isComparing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Securing connections...
                  </>
                ) : (
                  <>
                    Find Best Journey <ArrowRight size={20} />
                  </>
                )}
              </button>
              <div className="text-center">
                <span className="text-xs text-slate-500 font-semibold tracking-wide">
                  Comparing 6 route options including direct cabs & metro combinations...
                </span>
              </div>
            </div>

            {/* Informational Widget Accordion */}
            <div className="mt-8 bg-white rounded-xl border border-teal-brand/10 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-mint-green p-1 bg-navy-dark rounded-lg">
                  <Info size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-navy-dark">What is a Pre-Committed Ride?</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    YatraSure matches feeder trips (bicycles/autos/cabs) using predictive passenger queues. Drivers pre-commit to pick you up at fixed transit nodes. Our protocol issues digital tokens that ensure zero driver-initiated cancellations.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* ======================================= */}
        {/* SCREEN 3: RIDER - JOURNEY OPTIONS       */}
        {/* ======================================= */}
        <div 
          id="screen-rider-options" 
          className={`screen w-full min-h-screen bg-[#F0F9FB] pb-12 transition-all duration-300 ${
            activeScreen === 'rider-options' ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        >
          {/* Header navigation */}
          <nav className="bg-navy-dark px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md text-white">
            <button 
              onClick={goBack}
              className="text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            >
              ← Back
            </button>
            <span className="text-base font-bold tracking-tight">Choose Your Journey</span>
            <div className="w-10"></div> {/* spacer */}
          </nav>

          {/* Quick origin-destination indicator */}
          <div className="bg-[#E2F5F8] border-b border-teal-brand/10 py-3.5 px-6 text-center shadow-sm">
            <p className="text-navy-dark text-sm font-bold truncate max-w-lg mx-auto flex items-center justify-center gap-2">
              <MapPin size={14} className="text-teal-brand" />
              {source} <ArrowRight size={14} className="text-slate-400" /> {destination}
            </p>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              Sunday, 15 June 2026 · 6 optimized options found
            </p>
          </div>

          <div className="max-w-2xl mx-auto px-6 pt-6">

            {/* Category: Direct Options */}
            <div className="mb-4">
              <span className="text-[12px] font-extrabold tracking-widest text-[#028090] uppercase block mb-3">
                DIRECT OPTIONS (SINGLE MODE)
              </span>
              
              <div className="flex flex-col gap-3">
                
                {/* 1. Direct Cab */}
                <div 
                  onClick={() => {
                    const opt = JOURNEY_OPTIONS.find(o => o.id === 'direct-cab') || JOURNEY_OPTIONS[0];
                    setSelectedOption(opt);
                    navigateTo('rider-confirmed');
                  }}
                  className="bg-white border-2 border-red-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98 flex justify-between items-center bg-gradient-to-r hover:from-white hover:to-red-50/20"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl bg-red-50 p-2.5 rounded-xl block">🚕</span>
                    <div>
                      <h4 className="text-base font-bold text-navy-dark">Direct Cab</h4>
                      <p className="text-xs text-slate-400 font-medium">Door to door, no transfers</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 line-through">₹510</span>
                      <span className="text-xl font-extrabold text-navy-dark">₹919</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">52 mins</span>
                  </div>
                </div>

                {/* 2. Direct Auto */}
                <div 
                  onClick={() => {
                    const opt = JOURNEY_OPTIONS.find(o => o.id === 'direct-auto') || JOURNEY_OPTIONS[1];
                    setSelectedOption(opt);
                    navigateTo('rider-confirmed');
                  }}
                  className="bg-white border hover:border-amber-400/80 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl bg-amber-50 p-2.5 rounded-xl block">🛺</span>
                    <div>
                      <h4 className="text-base font-bold text-navy-dark">Direct Auto</h4>
                      <p className="text-xs text-slate-400 font-medium">Door to door, no transfers</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xl font-extrabold text-navy-dark">₹556</span>
                    <span className="text-xs text-slate-500 font-medium">48 mins</span>
                  </div>
                </div>

                {/* 3. Direct Bike */}
                <div 
                  onClick={() => {
                    const opt = JOURNEY_OPTIONS.find(o => o.id === 'direct-bike') || JOURNEY_OPTIONS[2];
                    setSelectedOption(opt);
                    navigateTo('rider-confirmed');
                  }}
                  className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl bg-slate-50 p-2.5 rounded-xl block">🏍</span>
                    <div>
                      <h4 className="text-base font-bold text-navy-dark">Direct Bike (Solo)</h4>
                      <p className="text-xs text-slate-400 font-medium">Door to door, high speed lane</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xl font-extrabold text-navy-dark">₹398</span>
                    <span className="text-xs text-slate-500 font-medium">44 mins</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Category: Smart Multi-Modal Options (Pre-committed) */}
            <div className="mt-8 mb-4">
              <div className="flex flex-col mb-4">
                <span className="text-[12px] font-extrabold tracking-widest text-teal-brand uppercase">
                  SMART MULTI-MODAL OPTIONS
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  🛡️ Leg sync guaranteed. Automated ticketing. First & last-mile rides locks in.
                </span>
              </div>

              <div className="flex flex-col gap-4">
                
                {/* 4. Cab + Metro */}
                <div 
                  onClick={() => {
                    const opt = JOURNEY_OPTIONS.find(o => o.id === 'cab-metro') || JOURNEY_OPTIONS[3];
                    setSelectedOption(opt);
                    navigateTo('rider-confirmed');
                  }}
                  className="bg-white border border-teal-brand/10 hover:border-teal-brand/60 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2 bg-slate-50 p-2.5 rounded-xl">
                        <span className="text-2xl">🚕</span>
                        <span className="text-2xl">🚇</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-navy-dark">Cab + Metro Combination</h4>
                        <p className="text-xs text-[#028090] font-semibold">₹200 cab · ₹70 metro · ₹180 cab</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-xl font-extrabold text-navy-dark">₹450</span>
                      <span className="text-xs text-slate-500 font-medium">38 mins</span>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <span className="bg-[#E6F6F8] text-teal-brand text-[10px] font-extrabold px-3 py-1 rounded-lg">
                      🛡️ Save ₹469 vs direct cab · No wait at Metro exit
                    </span>
                  </div>
                </div>

                {/* 5. Auto + Metro */}
                <div 
                  onClick={() => {
                    const opt = JOURNEY_OPTIONS.find(o => o.id === 'auto-metro') || JOURNEY_OPTIONS[4];
                    setSelectedOption(opt);
                    navigateTo('rider-confirmed');
                  }}
                  className="bg-white border border-teal-brand/10 hover:border-teal-brand/60 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2 bg-slate-50 p-2.5 rounded-xl">
                        <span className="text-2xl">🛺</span>
                        <span className="text-2xl">🚇</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-navy-dark">Auto + Metro Combination</h4>
                        <p className="text-xs text-[#028090] font-semibold">₹80 auto · ₹70 metro · ₹70 auto</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-xl font-extrabold text-navy-dark">₹220</span>
                      <span className="text-xs text-slate-500 font-medium">32 mins</span>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <span className="bg-[#E6F6F8] text-[#028090] text-[10px] font-extrabold px-3 py-1 rounded-lg">
                      🛡️ Save ₹336 vs direct cab · Zero emission priority lane
                    </span>
                  </div>
                </div>

                {/* 6. Bike + Metro (HERO RECOMENDED CARD) */}
                <div 
                  id="card-hero"
                  onClick={() => {
                    const opt = JOURNEY_OPTIONS.find(o => o.id === 'bike-metro') || JOURNEY_OPTIONS[5];
                    setSelectedOption(opt);
                    navigateTo('rider-confirmed');
                  }}
                  className="bg-[#F0FFF9] border-2 border-mint-green rounded-3xl p-6 shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] flex flex-col gap-4 animate-pulse-teal"
                >
                  {/* Subtle glossy overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-mint-green/5 to-white/0 pointer-events-none"></div>

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3 bg-white p-3 rounded-2xl shadow-inner border border-mint-green/10">
                        <span className="text-3xl">🚲</span>
                        <span className="text-3xl">🚇</span>
                      </div>
                      <div>
                        <h4 className="text-lg md:text-xl font-extrabold text-navy-dark leading-tight">Bike + Metro Combined</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">₹50 bike · ₹70 metro · ₹30 bike</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-slate-400 font-medium">Only</span>
                        <span className="text-3xl font-black text-[#02C39A]">₹150</span>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-full border border-mint-green/20">
                        28 mins mins
                      </span>
                    </div>
                  </div>

                  {/* Highlight pill text badges */}
                  <div className="flex flex-col sm:flex-row gap-2 relative z-10 pt-2 border-t border-mint-green/10">
                    <span className="bg-mint-green text-navy-dark text-[10px] font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                      <Award size={12} className="text-navy-dark" />
                      ⭐ Recommended — Fastest & Cheapest
                    </span>
                    <span className="bg-navy-dark text-white text-[10px] font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                      <Zap size={10} className="text-mint-green" />
                      Both legs pre-booked. Driver waiting at metro exit.
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>


        {/* ======================================= */}
        {/* SCREEN 4: RIDER - BOOKING CONFIRMED      */}
        {/* ======================================= */}
        <div 
          id="screen-rider-confirmed" 
          className={`screen w-full min-h-screen bg-[#F0F9FB] pb-12 transition-all duration-300 ${
            activeScreen === 'rider-confirmed' ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        >
          {/* Top celebratory gradient zone */}
          <div className="bg-gradient-to-b from-[#02C39A] to-[#028090] text-white px-6 py-12 text-center rounded-b-[40px] shadow-lg relative overflow-hidden">
            {/* Ambient decorative grid */}
            <div className="absolute inset-0 bg-white/5 bg-grid-pattern pointer-events-none"></div>

            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/40 shadow-inner animate-bounce">
                <Check className="text-white" size={44} strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Journey Confirmed!</h1>
                <p className="text-[#E6FDF8] text-base font-semibold mt-1">
                  {selectedOption.title} · ₹{selectedOption.price} · {selectedOption.time} mins
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-xl mx-auto px-6 mt-8">
            
            {/* Simulated Live Journey Banner Controller */}
            <div className="bg-white rounded-2xl border border-mint-green/20 p-5 shadow-lg mb-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy-dark flex items-center gap-1.5">
                    <Sparkles className="text-[#02C39A] animate-spin" size={16} />
                    Active Journey Simulator
                  </h4>
                  <p className="text-xs text-slate-500">Fast-forward the multi-modal legs to simulate arrival</p>
                </div>
                {!riderSimPlaying && !riderSimCompleted && (
                  <button 
                    onClick={startRiderSimulation}
                    className="bg-[#02C39A] hover:bg-[#028090] text-navy-dark font-bold text-xs px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Start Ride ▶
                  </button>
                )}
                {riderSimPlaying && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-error-red rounded-full animate-ping"></span>
                    <span className="text-xs font-bold text-error-red uppercase tracking-wider">Simulating...</span>
                  </div>
                )}
                {riderSimCompleted && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Arrived 🎉
                  </span>
                )}
              </div>
              
              {/* Reset simulation indicator */}
              {riderSimCompleted && (
                <button 
                  onClick={() => {
                    setRiderSimCompleted(false);
                    setCurrentTimeline(TIMELINE_STEPS);
                  }}
                  className="text-xs font-bold text-teal-brand hover:underline self-start text-left"
                >
                  ↺ Reset tracking timeline
                </button>
              )}
            </div>

            {/* Vertical timeline card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 flex flex-col gap-6 relative">
              <h2 className="text-lg font-bold text-navy-dark border-b border-slate-100 pb-3">Route Itinerary Details</h2>
              
              <div className="flex flex-col gap-8 relative">
                {/* Connecting dotted guide-line */}
                <div className="absolute left-[15px] top-[14px] bottom-[14px] w-0.5 border-l-2 border-dotted border-teal-brand/30 z-0"></div>

                {/* Timeline rendering */}
                {currentTimeline.map((step, index) => {
                  const isCurrent = step.active && riderSimPlaying;
                  const isCompleted = step.completed || riderSimCompleted;
                  return (
                    <div key={step.id} className={`flex items-start gap-4 relative z-10 transition-all duration-300 ${
                      isCurrent ? 'scale-[1.02]' : 'opacity-85'
                    }`}>
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-[#02C39A] flex items-center justify-center border border-[#02C39A] text-white font-extrabold text-sm shadow-md animate-pulse">
                            ✓
                          </div>
                        ) : step.active ? (
                          <div className="w-8 h-8 rounded-full bg-navy-dark flex items-center justify-center border-2 border-[#02C39A] text-[#02C39A] text-sm animate-pulse-teal shadow-md">
                            ●
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-bold">
                            {step.id}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-wrap justify-between items-center gap-1">
                          <h4 className={`text-sm md:text-base font-bold ${isCompleted ? 'text-slate-400 line-through' : 'text-navy-dark'}`}>
                            {step.title}
                          </h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            isCompleted 
                              ? 'bg-slate-100 text-slate-400' 
                              : step.active 
                                ? 'bg-[#FFF0E6] text-[#F59E0B] animate-pulse' 
                                : 'bg-[#E6F6F8] text-teal-brand'
                          }`}>
                            {isCompleted ? 'Leg Completed' : step.statusText}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Safety/Cancellations Trust Banner */}
            <div className="bg-navy-dark rounded-xl p-5 mt-6 border border-white/5 shadow-md flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <h4 className="text-sm font-bold text-white">YatraSure Commit Protocol Active</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Both matching drivers are legally bound on blockchain/deposit tokens. Driver-initiated cancellation will automatically penalty-pay you ₹100. Rest easy. Zero uncertainty.
                </p>
              </div>
            </div>

            {/* Standard clickable controls */}
            <div className="mt-8 flex flex-col gap-4">
              <button 
                onClick={() => {
                  showToast("🛠️ Live telemetry is streaming in the background! Simulated steps is recommended above.");
                  setFeedbackMsg("Live telemetry linked. Mock GPS updates synced.");
                }}
                className="w-full bg-teal-brand hover:bg-[#028090] text-white font-extrabold text-base py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Track Live Journey
              </button>

              {feedbackMsg && (
                <div className="text-center">
                  <span className="text-xs text-[#028090] font-black uppercase tracking-wider animate-pulse">
                    🟢 Tracking active: {feedbackMsg}
                  </span>
                </div>
              )}

              <button 
                onClick={() => navigateTo('home')}
                className="text-xs text-center font-bold text-[#028090] hover:underline transition-all mt-2 block"
              >
                ← Plan another journey
              </button>
            </div>

          </div>
        </div>


        {/* ======================================= */}
        {/* SCREEN 5: DRIVER - PREDICTIVE ALERT      */}
        {/* ======================================= */}
        <div 
          id="screen-driver-alert" 
          className={`screen w-full min-h-screen bg-navy-dark text-white pb-12 transition-all duration-300 ${
            activeScreen === 'driver-alert' ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        >
          {/* Driver sticky navbar */}
          <nav className="bg-navy-dark border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wide text-white">Yatra<span className="text-[#F59E0B]">Sure</span> Driver</span>
              <span className="bg-[#E6F9F5] text-navy-dark text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                Mumbai Zone
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">Today:</span>
              <span className="text-[#02C39A] text-base font-extrabold">₹{earningsToday}</span>
            </div>
          </nav>

          {/* Page title and active radar */}
          <div className="max-w-xl mx-auto px-6 mt-6">
            <div className="flex items-center justify-between mb-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div>
                <h1 className="text-xl font-bold">Driver Dashboard</h1>
                <p className="text-xs text-slate-400">Radar active checking local train grids...</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#02C39A] rounded-full animate-pulse-red"></span>
                <span className="text-xs font-bold text-[#02C39A] uppercase tracking-wider">Active</span>
              </div>
            </div>

            {/* PREDICTIVE ALERT HERO CARD */}
            <div 
              id="alert-card animate-pulse-gold-outer"
              className="bg-[#0A2540] rounded-3xl p-6 border-2 border-[#F59E0B] shadow-2xl animate-pulse-gold relative overflow-hidden"
            >
              {/* Highlight background radial */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#F59E0B]/5 rounded-bl-[100px] pointer-events-none"></div>

              {/* Alert Header Row */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="flex items-center gap-2 font-black text-xs text-[#F59E0B] tracking-widest uppercase">
                  <Zap size={16} className="text-[#F59E0B]" />
                  PREDICTIVE DEMAND ALERT
                </span>
                <span className="bg-red-600 text-white font-extrabold text-[9px] py-0.5 px-2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  LIVE
                </span>
              </div>

              {/* Countdown information */}
              <div className="py-4 flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold uppercase">Real-Time Sync</span>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg md:text-xl font-extrabold text-[#F59E0B]">
                    Train arrives in: 6 minutes
                  </h3>
                  <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-300 font-mono">
                    Alert Time: 3:13 PM
                  </span>
                </div>
              </div>

              {/* Detailed metrics box */}
              <div className="bg-navy-dark/70 rounded-2xl border border-white/5 p-4 flex flex-col gap-3.5 my-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <p className="text-sm font-semibold">
                    <span className="text-slate-400">Node:</span> Churchgate Metro Station (Western Line)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">PASSENGERS</span>
                    <span className="text-base font-extrabold text-white flex items-center gap-1">
                      👥 ~32 exiting
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">PRE-COMMITTED FARES</span>
                    <span className="text-base font-extrabold text-[#02C39A] flex items-center gap-1">
                      🎟 8 awaiting
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">MEDIAN FARE</span>
                    <span className="text-base font-extrabold text-[#F59E0B] flex items-center gap-1">
                      ₹110 / ride
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">RAIL STATUS</span>
                    <span className="text-base font-extrabold text-white">
                      🚇 On schedule 3:26 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Projection Card Block */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-2 mt-4">
                <span className="text-xs text-slate-400 font-semibold block">Projected earnings if you position now:</span>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="text-3xl font-black text-[#02C39A]">₹880</span>
                    <span className="text-xs text-slate-300 ml-1.5 font-medium">in next 45 mins</span>
                  </div>
                  <span className="text-xs text-slate-400 italic">vs ₹340 average period baseline</span>
                </div>
                <div className="text-xs font-bold text-[#F59E0B] flex items-center gap-1 rounded bg-[#F59E0B]/10 p-2 border border-[#F59E0B]/20 w-fit mt-1">
                  💡 That's 2.6x your normal hourly earnings!
                </div>
              </div>

            </div>



            {/* Choice buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={() => navigateTo('driver-heatmap')}
                className="w-full bg-teal-brand hover:bg-[#028090] text-navy-dark bg-mint-green font-extrabold text-base py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-center cursor-pointer"
              >
                Accept & Position at Churchgate →
              </button>
              
              <button 
                onClick={() => {
                  showToast("⏭️ Scanning other metro arrival stations across Mumbai transit zone...");
                  // Swap demand parameters
                  setCurrentAlertIndex((currentAlertIndex + 1) % 3);
                }}
                className="w-full bg-navy-dark border border-white/20 hover:bg-white/5 text-white font-bold text-sm py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Skip / Search other station hubs
              </button>
            </div>

            <button 
              onClick={() => navigateTo('home')}
              className="text-xs text-center font-bold text-slate-400 hover:text-white transition-all mt-6 block mx-auto underline"
            >
              ← Return to Main Portal
            </button>

          </div>
        </div>


        {/* ======================================= */}
        {/* SCREEN 6: DRIVER - DEMAND HEATMAP       */}
        {/* ======================================= */}
        <div 
          id="screen-driver-heatmap" 
          className={`screen w-full min-h-screen bg-[#F0F9FB] pb-12 transition-all duration-300 ${
            activeScreen === 'driver-heatmap' ? 'block opacity-100' : 'hidden opacity-0'
          }`}
        >
          {/* Heatmap Navbar */}
          <nav className="bg-navy-dark text-white px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
            <button 
              onClick={goBack}
              className="text-white hover:text-[#02C39A] font-semibold text-sm cursor-pointer"
            >
              ← Back
            </button>
            <span className="text-sm md:text-base font-bold">Live Demand Map — Mumbai Transit</span>
            <div className="flex items-center gap-1.5 bg-[#02C39A]/10 border border-[#02C39A]/40 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-mint-green rounded-full animate-ping"></span>
              <span className="text-[10px] text-[#02C39A] uppercase tracking-wider font-extrabold">GPS ACTIVE</span>
            </div>
          </nav>

          {/* Master split dashboard layout */}
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT LEG: Simulated Map UI (65% width) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-navy-dark flex items-center gap-2">
                    <Map size={18} className="text-teal-brand" />
                    Heat Gradient Radar Map
                  </h2>
                  <p className="text-xs text-slate-500">Gold indicates extreme incoming metro commuter demand</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold bg-white p-2 rounded-lg border border-slate-200">
                  <span className="inline-block w-4 h-4 rounded-full bg-[#F59E0B] opacity-80"></span>
                  <span>Grid Jam</span>
                  <span className="inline-block w-4 h-4 rounded-full bg-teal-brand opacity-80"></span>
                  <span>Optimal Flow</span>
                </div>
              </div>

              {/* Dark simulated map canvas area */}
              <div className="w-full h-[320px] md:h-[480px] bg-[#1E293B] rounded-3xl border-3 border-navy-dark relative overflow-hidden shadow-xl">
                
                {/* SVG background gridlines roads to look extremely authentic */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                  <defs>
                    <pattern id="mapPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  {/* Subtle water coastline outline */}
                  <rect width="100%" height="100%" fill="url(#mapPattern)" />
                  <path d="M 120,400 Q 180,260 230,180 T 380,80" fill="none" stroke="white" strokeWidth="3" />
                  <path d="M 0,220 L 600,320" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                  {/* Highway line */}
                  <path d="M 50,0 Q 250,200 480,480" fill="none" stroke="#F59E0B" strokeWidth="4" />
                </svg>

                {/* Legend Water labels */}
                <div className="absolute right-6 top-6 text-[10px] text-white/20 font-black tracking-widest uppercase pointer-events-none font-mono">
                  Arabian Sea Coast
                </div>
                <div className="absolute left-6 bottom-6 text-[10px] text-[#02C39A]/20 font-black tracking-widest uppercase pointer-events-none font-mono">
                  YatraSure Mumbai Grid v4.1
                </div>

                {/* Heat points mapped coordinates dynamically */}
                {HEATMAP_POINTS.map((pt) => {
                  const isHovered = hoveredStation === pt.id;
                  const isGold = pt.color === 'gold';
                  return (
                    <div 
                      key={pt.id}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer z-10"
                      onClick={() => {
                        setHoveredStation(pt.id);
                        showToast(`Point selected: ${pt.name}. Estimating passenger exits.`);
                      }}
                    >
                      {/* Pulse circle animation */}
                      <div 
                        style={{ width: `${pt.size}px`, height: `${pt.size}px` }}
                        className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                          isGold 
                            ? 'bg-[#F59E0B]/20 border-2 border-[#F59E0B] animate-map-pulse' 
                            : 'bg-[#028090]/15 border border-teal-brand/40 hover:bg-teal-brand/35'
                        } ${isHovered ? 'ring-2 ring-white scale-110' : ''}`}
                      >
                        {/* Smaller core indicator */}
                        <div className={`w-3.5 h-3.5 rounded-full ${
                          isGold ? 'bg-[#F59E0B] animate-ping' : 'bg-teal-brand'
                        }`}></div>
                      </div>

                      {/* Tooltip text bubble label */}
                      <div className="bg-navy-dark text-white border border-white/10 p-2 rounded-xl text-left shadow-lg absolute top-[103%] left-1/2 -translate-x-1/2 min-w-[124px] pointer-events-none z-20">
                        <span className="text-[10px] font-bold block leading-tight truncate">{pt.name}</span>
                        <span className={`text-[9px] font-extrabold ${isGold ? 'text-[#F59E0B]' : 'text-mint-green'}`}>
                          👥 {pt.passengers} pax · {pt.time}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* DRIVER CURRENT POSITION VEHICLE AVATAR */}
                <div 
                  id="driver-map-car"
                  style={{ 
                    left: `${28 - (indexToValueRatio(driverProgress, 0, 16))}%`, // animated transition along map path to Churchgate
                    top: `${68 + (indexToValueRatio(driverProgress, 0, 5))}%` 
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 bg-white text-navy-dark border-2 border-[#F59E0B] p-2 rounded-full shadow-2xl z-20 flex flex-col items-center gap-1 transition-all"
                >
                  <div className="bg-[#FFFBF0] rounded p-1">
                    <Car size={16} className="text-[#F59E0B] animate-bounce" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-navy-dark tracking-wide block px-1 leading-none">
                    YOU
                  </span>
                </div>

                {/* Path navigation dashed line towards destination node */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Dashed vector from YOU to Churchgate (at 28%, 78%) */}
                  <line 
                    x1="12%" 
                    y1="73%" 
                    x2="28%" 
                    y2="78%" 
                    stroke="#02C39A" 
                    strokeWidth="3" 
                    strokeDasharray="6,4" 
                    className="animate-pulse"
                  />
                </svg>

              </div>
            </div>

            {/* RIGHT LEG: Panel instructions (35% width) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Box 1: Your Matched Pre-committed Ride */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl">
                <span className="text-[10px] font-black tracking-widest text-[#028090] uppercase block mb-3">
                  CURRENTLY MATCHED CUSTOMER
                </span>
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-navy-dark border border-slate-200">
                      SR
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-navy-dark leading-tight">Swetha R.</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        ⭐ 4.9 (312 trips) · Verified Rider
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-rose-500">₹150</span>
                </div>

                <div className="py-4 flex flex-col gap-2 border-b border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <span className="text-slate-400 mt-0.5">●</span>
                    <p className="text-xs text-slate-500 font-medium">
                      <strong className="text-navy-dark">PICKUP:</strong> Churchgate Metro — Exit Gate 1 (waiting at transit arrival)
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-error-red mt-0.5">■</span>
                    <p className="text-xs text-slate-500 font-medium">
                      <strong className="text-navy-dark">DROP:</strong> Rameshwaram Cafe, Churchgate
                    </p>
                  </div>
                </div>

                {/* Interactive Ride Acceptance Section */}
                {!driverRideAccepted ? (
                  <div className="my-4 p-3 bg-teal-brand/5 border border-teal-brand/10 rounded-xl">
                    <p className="text-[11px] text-slate-500 font-semibold mb-2">
                      New matching incoming. Lock ride to prevent redistribution.
                    </p>
                    <button
                      id="btn-accept-ride"
                      onClick={() => {
                        setDriverRideAccepted(true);
                        showToast("✅ Connected match! Head out and position at Gate 1.");
                      }}
                      className="w-full bg-[#02C39A] hover:bg-teal-brand text-navy-dark hover:text-white font-black text-xs py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <CheckCircle size={14} />
                      Accept Swetha's Ride
                    </button>
                  </div>
                ) : (
                  <div className="my-4">
                    <div className="bg-[#E6F9F5] border border-mint-green/30 text-[#028090] font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Check size={14} strokeWidth={3} className="text-[#028090] bg-[#02C39A]/20 p-0.5 rounded-full" />
                        Ride Accepted & Locked
                      </span>
                      <span className="text-[9px] font-black tracking-widest text-[#028090] bg-white border border-mint-green/20 px-2 py-0.5 rounded">
                        SECURED
                      </span>
                    </div>
                  </div>
                )}

                {/* Leg security badge commitment */}
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-teal-brand">
                  <CheckCircle size={16} className="text-[#02C39A]" />
                  <span>Fare Pre-committed · No traveler cancellation</span>
                </div>
              </div>

              {/* Box 2: Continuous Demand Chain forecasting */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl">
                <span className="text-[10px] font-black tracking-widest text-[#028090] uppercase block mb-3">
                  CONTINUOUS REVENUE CHAIN FORWARD
                </span>
                
                <div className="flex flex-col gap-3">
                  
                  {/* Next Step Chain 1 */}
                  <div className="bg-slate-50 hover:bg-[#E6F6F8] rounded-xl p-3 border border-slate-100 transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-navy-dark">📍 Step 2: Nariman Point</h4>
                      <p className="text-[10px] text-slate-400 font-medium my-0.5">Commuters arriving at 3:34 PM</p>
                      <span className="text-[10px] text-teal-brand bg-teal-brand/10 px-2 py-0.5 font-bold rounded">
                        18 passengers · ~₹130/fare
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>

                  {/* Next Step Chain 2 */}
                  <div className="bg-slate-50 hover:bg-[#E6F6F8] rounded-xl p-3 border border-slate-100 transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-navy-dark">📍 Step 3: CST Station</h4>
                      <p className="text-[10px] text-slate-400 font-medium my-0.5">Commuters arriving at 3:52 PM</p>
                      <span className="text-[10px] text-teal-brand bg-teal-brand/10 px-2 py-0.5 font-bold rounded">
                        24 passengers · ~₹95/fare
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>

                </div>
              </div>

              {/* Box 3: Total Earnings Metrics */}
              <div className="bg-navy-dark text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <span className="text-[10px] font-black tracking-widest text-[#02C39A] uppercase block mb-4">
                  REVENUE STATEMENT SUMMARY
                </span>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Current matched trip fare:</span>
                    <span className="font-bold">₹150</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-300 pb-2 border-b border-white/10">
                    <span>Projected next 2 hours sequence:</span>
                    <span className="font-extrabold text-[#F59E0B]">₹890</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold">Total earnings today:</span>
                    <span className="text-2xl font-black text-mint-green">₹{earningsToday}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {driverRideAccepted ? (
                  <button 
                    onClick={() => {
                      setNavigationStarted(true);
                      setDriverSimState('heading');
                      setDriverProgress(0); // restart progress mapping
                      showToast("🚀 Simulated ride navigation started! Map car will move toward Churchgate.");
                    }}
                    disabled={navigationStarted && driverProgress < 100}
                    className="w-full bg-teal-brand hover:bg-[#028090] text-white font-extrabold text-base py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-center cursor-pointer animate-pulse-teal"
                  >
                    {navigationStarted && driverProgress < 100 ? (
                      <span>Navigating to Gate 1 ({(driverProgress).toFixed(0)}%)...</span>
                    ) : driverSimState === 'arrived' ? (
                      <span>Ride Completed! Secured ₹150</span>
                    ) : (
                      <span>Start Navigation to Churchgate →</span>
                    )}
                  </button>
                ) : (
                  <div className="bg-amber-50 border border-dashed border-amber-300 p-4 rounded-xl text-center">
                    <p className="text-xs text-amber-700 font-bold mb-1 flex items-center justify-center gap-1.5">
                      🔒 Navigation Locked
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Please accept Swetha's ride request in the matched customer card above to enable navigation guidance.
                    </p>
                  </div>
                )}
                {driverSimState === 'arrived' && (
                  <button 
                    onClick={() => {
                      setNavigationStarted(false);
                      setDriverSimState('idle');
                      setDriverProgress(0);
                      setDriverRideAccepted(false); // Reset acceptance state on reset
                    }}
                    className="text-xs text-center font-bold text-[#028090] hover:underline"
                  >
                    ↺ Simulate another pickup matching
                  </button>
                )}
                <span className="text-[10px] text-center text-slate-500 font-semibold tracking-wide mt-1 block">
                  Commuter Swetha R. is notified you are active and positioning on Western Gate
                </span>
              </div>

            </div>

          </div>
        </div>

      </main>

      {/* Global Bottom Universal Footer Branding */}
      {activeScreen !== 'home' && (
        <span className="text-[11px] text-center text-navy-dark tracking-widest font-normal uppercase py-6 border-t border-slate-200 mt-12 bg-white/40 block">
          YatraSure · OneJourney Hackathon 2026 · Track 1: Smart Multi-Modal Journey Planner
        </span>
      )}

    </div>
  );
}

// Small helper mapping progression
function indexToValueRatio(prog: number, startVal: number, range: number): number {
  return startVal + (prog / 100) * range;
}
