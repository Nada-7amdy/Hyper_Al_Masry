import React from 'react';
import { TrendingUp, Users, Package, AlertCircle, DollarSign } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    // Simulated Chart Bars
    const salesData = [40, 65, 34, 89, 56, 92, 77];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <h2 className="text-3xl font-serif">Management Suite</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Daily Revenue", val: "EGP 145,000", icon: <DollarSign />, trend: "+12%" },
                    { label: "Active Orders", val: "24", icon: <TrendingUp />, trend: "+4" },
                    { label: "Total Customers", val: "8,922", icon: <Users />, trend: "+120" },
                    { label: "Low Stock Items", val: "3", icon: <AlertCircle />, trend: "Urgent", alert: true }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0d0d0d] border border-white/10 p-6 rounded-2xl hover:border-[#BF953F]/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.alert ? 'bg-red-500/10 text-red-500' : 'bg-[#BF953F]/10 text-[#BF953F]'}`}>
                                {React.cloneElement(stat.icon as React.ReactElement<{ size: number }>, { size: 20 })}
                            </div>
                            <span className={`text-xs font-bold py-1 px-2 rounded-full ${stat.alert ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stat.val}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Simulation */}
                <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-6">Revenue Analytics</h3>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {salesData.map((h, i) => (
                            <div key={i} className="w-full bg-white/5 rounded-t-lg relative group overflow-hidden">
                                <div 
                                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#BF953F] to-[#FCF6BA] opacity-80 group-hover:opacity-100 transition-all duration-500"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono">
                        <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1 bg-[#0d0d0d] border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-6">Live Operations</h3>
                    <div className="space-y-6">
                        {[
                            { msg: "New order #9921 from Zamalek", time: "2m ago" },
                            { msg: "Wagyu A5 Stock Alert (Low)", time: "15m ago", alert: true },
                            { msg: "Driver Mohamed completed delivery", time: "42m ago" },
                            { msg: "New User Registration", time: "1h ago" }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className={`w-2 h-2 rounded-full ${item.alert ? 'bg-red-500 animate-pulse' : 'bg-[#BF953F]'}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-300">{item.msg}</p>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};