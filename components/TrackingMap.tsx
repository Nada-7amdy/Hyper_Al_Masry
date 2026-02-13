import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, CheckCircle, Clock } from 'lucide-react';
import { OrderStatus } from '../types';

export const TrackingMap: React.FC = () => {
  const [status, setStatus] = useState<OrderStatus>({
    step: 1,
    label: "Processing Order",
    timestamp: "Now",
    driverLocation: { lat: 30.0444, lng: 31.2357 } // Cairo Coordinates
  });

  // Simulated WebSocket Connection
  useEffect(() => {
    const steps: Partial<OrderStatus>[] = [
      { step: 2, label: "Quality Check Passed", timestamp: "2 mins ago" },
      { step: 3, label: "Driver Assigned: Mohamed Ali", timestamp: "5 mins ago" },
      { step: 4, label: "Arriving in 10 minutes", timestamp: "Live" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(prev => ({ ...prev, ...steps[currentStep] }));
        currentStep++;
      }
    }, 3000); // Fast forward simulation

    return () => clearInterval(interval);
  }, []);

  const goldText = "text-transparent bg-clip-text bg-gradient-to-b from-[#BF953F] via-[#FCF6BA] to-[#AA771C]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 h-full min-h-[600px]">
        {/* Status Panel */}
        <div className="lg:col-span-1 bg-[#0d0d0d] rounded-[2rem] border border-white/10 p-8 flex flex-col h-full">
            <h2 className="text-3xl font-serif mb-2">Order #8821</h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">Concierge Delivery</p>

            <div className="space-y-8 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-white/5"></div>
                
                {[1, 2, 3, 4].map((s) => {
                    const isActive = status.step >= s;
                    const isCurrent = status.step === s;
                    
                    return (
                        <div key={s} className={`relative flex gap-4 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                            <div className={`w-10 h-10 rounded-full border flex-shrink-0 flex items-center justify-center z-10 bg-[#0d0d0d] transition-all duration-500 ${
                                isActive ? 'border-[#BF953F] text-[#BF953F]' : 'border-white/10 text-gray-500'
                            }`}>
                                {s === 4 ? <Navigation size={18} /> : <CheckCircle size={18} />}
                            </div>
                            <div className="pt-2">
                                <h4 className={`font-bold text-sm ${isCurrent ? goldText : 'text-gray-300'}`}>
                                    {s === 1 ? 'Order Confirmed' : s === 2 ? 'Quality Check' : s === 3 ? 'Out for Delivery' : 'Arriving Soon'}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isCurrent ? status.label : 'Completed'}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-auto pt-8 border-t border-white/10">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gray-800 bg-[url('https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100')] bg-cover"></div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Your Concierge</p>
                        <p className="font-bold">Mohamed Ali</p>
                    </div>
                    <button className="ml-auto w-10 h-10 rounded-full bg-[#BF953F] text-black flex items-center justify-center hover:scale-110 transition-transform">
                        <Phone size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Map Simulation */}
        <div className="lg:col-span-2 bg-[#111] rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-40 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/12/2412/1654.png')] bg-cover grayscale hover:grayscale-0 transition-all duration-1000"></div>
            
            {/* Radar Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#BF953F]/20 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#BF953F]/10 rounded-full flex items-center justify-center">
                 <div className="w-4 h-4 bg-[#BF953F] rounded-full shadow-[0_0_20px_#BF953F]"></div>
            </div>

            {/* Simulated Live Route */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 200 500 Q 400 300 600 250" stroke="#BF953F" strokeWidth="2" fill="none" strokeDasharray="10 5" className="animate-[dash_20s_linear_infinite]" />
            </svg>

            <div className="absolute top-8 right-8 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                    <Clock size={16} className="text-[#BF953F]" />
                    <span className="font-mono text-sm">ETA: 08:22 PM</span>
                </div>
            </div>
        </div>
    </div>
  );
};