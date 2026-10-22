import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HeartPulse,
    ShieldCheck,
    Building2,
    Stethoscope,
    Users,
    Search,
    ArrowRight,
    CheckCircle2,
    Clock,
    Sparkles,
    Activity,
    Layers,
    CalendarCheck,
    Zap,
    TrendingDown,
    FileCheck2,
    Hospital,
    UserCheck,
    ChevronRight,
    Award
} from 'lucide-react';
import Medical3DCanvas from '../components/Medical3DCanvas';

const LandingPage = () => {
    const hospitalStats = [
        {
            name: 'Govt Medical College, Trivandrum',
            dept: 'General Medicine & Cardiology',
            queue: 48,
            capacity: '92%',
            tempDocs: 3,
            status: 'Voluntary Reinforcement Active',
            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        {
            name: 'General Hospital, Junction',
            dept: 'Pediatrics & Orthopedics',
            queue: 26,
            capacity: '65%',
            tempDocs: 2,
            status: 'Optimal OP Flow',
            badgeBg: 'bg-teal-50 text-teal-700 border-teal-200'
        },
        {
            name: 'Women & Children Hospital, Thycaud',
            dept: 'Obstetrics & Gynecology',
            queue: 34,
            capacity: '80%',
            tempDocs: 2,
            status: 'Voluntary Reinforcement Active',
            badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200'
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500 selection:text-white">
            {/* Top Sub-Announcement Ribbon */}
            <div className="bg-gradient-to-r from-teal-50 via-white to-cyan-50 border-b border-teal-100/80 px-4 py-2.5 text-center text-xs text-teal-900 font-medium">
                <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <strong className="font-bold text-teal-950">Next-Gen Government Healthcare Infrastructure:</strong>
                    <span>Real-Time Voluntary Doctor Capacity Exchange Platform</span>
                </span>
            </div>

            {/* Hero Section — 70% Clean White Medical Aesthetic with 3D Core */}
            <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 via-white to-slate-50/60 pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70">
                {/* Subtle Ambient Radial Light */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    {/* Left Hero Column */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-sm">
                            <Sparkles className="w-4 h-4 text-teal-600 animate-spin-slow" />
                            <span>Capacity Sharing for Government Apex Hospitals</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                            Solving Hospital Lines With{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600">
                                Voluntary Doctor
                            </span>{' '}
                            Networks.
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                            Converting OPD tokens into online queues reduces physical waiting rooms, but <strong className="text-teal-700 font-semibold">does not cure doctor shortages</strong>. e-Health Bridge connects government hospitals with verified retired, freelance, and leave-period physicians during peak rush hours.
                        </p>

                        {/* Interactive CTAs */}
                        <div className="pt-2 flex flex-wrap items-center gap-4">
                            <Link
                                to="/hospitals"
                                className="group px-7 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xl shadow-teal-600/25 transition-all duration-200 flex items-center gap-2.5 hover:scale-[1.02] active:scale-95"
                            >
                                <Search className="w-4 h-4 text-white" />
                                <span>Find Hospitals & Live Queues</span>
                                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/login"
                                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300/80 hover:border-teal-400 shadow-sm transition-all flex items-center gap-2"
                            >
                                <span>Access Portals</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                                    5 Roles
                                </span>
                            </Link>
                        </div>

                        {/* Metrics Cards */}
                        <div className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-200/80">
                            <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/70 shadow-sm">
                                <div className="text-2xl sm:text-3xl font-black text-teal-700 font-mono">
                                    3 Hubs
                                </div>
                                <div className="text-xs font-semibold text-slate-500 mt-0.5">Apex Govt Centers</div>
                            </div>

                            <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/70 shadow-sm">
                                <div className="text-2xl sm:text-3xl font-black text-cyan-700 font-mono">
                                    -42%
                                </div>
                                <div className="text-xs font-semibold text-slate-500 mt-0.5">Peak Wait Times</div>
                            </div>

                            <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/70 shadow-sm">
                                <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                                    100%
                                </div>
                                <div className="text-xs font-semibold text-slate-500 mt-0.5">Voluntary Dignity</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Column: 3D Canvas in Luminous Pearl Card */}
                    <div className="lg:col-span-5 relative flex items-center justify-center">
                        <div className="relative w-full aspect-square max-w-[500px] rounded-3xl overflow-hidden bg-gradient-to-b from-white via-teal-50/30 to-white p-2 shadow-2xl shadow-teal-900/10 border border-teal-200/80">
                            {/* Interactive 3D Medical Core */}
                            <Medical3DCanvas />
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Hospital Telemetry — Clean White Surface */}
            <section className="py-16 bg-slate-50/70 border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                        <div>
                            <span className="text-teal-700 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-teal-600" /> Live Health Network Telemetry
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                                Real-Time Government Hospital Load
                            </h2>
                        </div>
                        <Link
                            to="/hospitals"
                            className="text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-3 md:mt-0"
                        >
                            View All Hospital Facilities <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {hospitalStats.map((hosp, idx) => (
                            <div
                                key={idx}
                                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                                            <Hospital className="w-5 h-5" />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${hosp.badgeBg}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            {hosp.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mt-4 group-hover:text-teal-700 transition-colors">
                                        {hosp.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">{hosp.dept}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="text-slate-400 block font-medium">OP Queue</span>
                                        <span className="font-mono text-base font-extrabold text-slate-900">{hosp.queue} Waiting</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Voluntary Aid</span>
                                        <span className="font-mono text-base font-extrabold text-teal-600">+{hosp.tempDocs} Doctors</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block font-medium">Capacity</span>
                                        <span className="font-mono text-base font-extrabold text-amber-600">{hosp.capacity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Innovation Concept — Clean White Architecture */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-teal-700 font-bold uppercase text-xs tracking-widest">
                        System Architecture
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                        How Voluntary Capacity Sharing Works
                    </h2>
                    <p className="text-slate-600 mt-4 text-sm sm:text-base">
                        Bridging high-demand peak hours with underutilized medical expertise across the public health network.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black text-lg mb-6">
                            01
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hospital Dynamic Demands</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Superintendents monitor live department queues and publish temporary OP requirement slots specifying timing, patient limits, and token ranges.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black text-lg mb-6">
                            02
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Voluntary Self-Scheduling</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Verified retired specialists, freelance doctors, and off-duty physicians accept voluntary shifts. The system strictly respects voluntary terms.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-black text-lg mb-6">
                            03
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Digital Contracts & Live Queue</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Legally compliant temporary service contracts are automatically minted. Patients see exact wait times and choose dedicated or reinforced doctors.
                        </p>
                    </div>
                </div>
            </section>

            {/* 5-Role Dedicated Portals — Clean White Cards */}
            <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <h2 className="text-3xl font-black text-slate-900">5 Specialized Collaboration Portals</h2>
                        <p className="text-slate-600 mt-2 text-sm">
                            Tailored operational interfaces designed specifically for administrators, hospital managers, clinicians, and citizens.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        <Link
                            to="/login"
                            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group shadow-sm"
                        >
                            <div className="w-12 h-12 bg-purple-50 border border-purple-200 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">Main Admin</h4>
                            <p className="text-slate-500 text-xs mt-1">Platform governance, audit logs & hospital verification</p>
                        </Link>

                        <Link
                            to="/login"
                            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group shadow-sm"
                        >
                            <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">Hospital Admin</h4>
                            <p className="text-slate-500 text-xs mt-1">OP slot manager, requirement contracts & doctor roster</p>
                        </Link>

                        <Link
                            to="/login"
                            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group shadow-sm"
                        >
                            <div className="w-12 h-12 bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">Fixed Doctor</h4>
                            <p className="text-slate-500 text-xs mt-1">Permanent hospital OPD consultation and triage queue</p>
                        </Link>

                        <Link
                            to="/login"
                            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group shadow-sm"
                        >
                            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">Temp Doctor</h4>
                            <p className="text-slate-500 text-xs mt-1">Voluntary registration, contracts & shift calendar</p>
                        </Link>

                        <Link
                            to="/login"
                            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group shadow-sm"
                        >
                            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">Patient</h4>
                            <p className="text-slate-500 text-xs mt-1">Triage appointment, live countdown & consultation history</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white text-slate-500 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 text-xs">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                            <HeartPulse className="w-4 h-4 animate-pulse" />
                        </div>
                        <span>e-Health Bridge System</span>
                    </div>

                    <div className="flex items-center gap-6 text-slate-600 font-medium">
                        <Link to="/hospitals" className="hover:text-teal-600 transition">Hospitals</Link>
                        <Link to="/login" className="hover:text-teal-600 transition">Portals</Link>
                        <Link to="/register" className="hover:text-teal-600 transition">Register</Link>
                    </div>

                    <p className="text-slate-400">
                        © 2026 Virtual Doctor Collaboration System. Government Hospital Capacity Optimization.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
