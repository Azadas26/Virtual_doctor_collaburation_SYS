import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
    Search,
    MapPin,
    Building2,
    Stethoscope,
    Clock,
    Phone,
    ShieldCheck,
    Navigation,
    ArrowRight,
    Filter
} from 'lucide-react';

const HospitalSearchPage = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [district, setDistrict] = useState('');
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('');
    const [userCoords, setUserCoords] = useState(null);
    const navigate = useNavigate();

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            let params = {};
            if (district) params.district = district;
            if (search) params.search = search;
            if (department) params.department = department;

            if (userCoords) {
                params.latitude = userCoords.latitude;
                params.longitude = userCoords.longitude;
                params.maxDistance = 50000; // 50km
            }

            const res = await API.get('/hospitals', { params });
            if (res.data.success) {
                const list = res.data.data || res.data.hospitals || [];
                setHospitals(list);
            }
        } catch (error) {
            console.error('Fetch hospitals error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, [district, department, userCoords]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchHospitals();
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserCoords({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                },
                (err) => {
                    alert('Could not fetch location. Please enable location permissions or select district.');
                }
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Government Hospital Directory & Capacity Finder
                    </h1>
                    <p className="text-slate-600 mt-2 text-sm max-w-3xl">
                        Locate nearby government hospitals, view available clinical departments, and check voluntary doctor requirements.
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 space-y-4">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search hospital name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">All Districts (Kerala)</option>
                                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                <option value="Ernakulam">Ernakulam</option>
                                <option value="Kozhikode">Kozhikode</option>
                                <option value="Kollam">Kollam</option>
                                <option value="Thrissur">Thrissur</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">All Clinical Departments</option>
                                <option value="General Medicine">General Medicine</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="General Surgery">General Surgery</option>
                                <option value="Dermatology">Dermatology</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-teal-600/20 text-sm transition"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
                                title="Use Current Location"
                            >
                                <Navigation className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {userCoords && (
                        <div className="text-xs text-teal-700 font-semibold flex items-center gap-1 bg-teal-50 p-2.5 rounded-xl border border-teal-200">
                            <MapPin className="w-4 h-4" /> Sorting hospitals by nearest geospatial distance to your location.
                        </div>
                    )}
                </div>

                {/* Hospital Cards Grid */}
                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading Government Hospitals...</p>
                    </div>
                ) : hospitals.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Hospitals Found</h3>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your district or department search filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitals.map((hosp) => (
                            <div
                                key={hosp._id}
                                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-teal-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <span className="text-[11px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 border border-teal-500/20 px-3 py-1 rounded-full">
                                            {hosp.hospitalType || 'Government Hospital'}
                                        </span>
                                        {hosp.emergencyAvailability && (
                                            <span className="text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                <Clock className="w-3 h-3 text-red-600 animate-pulse" /> 24x7 Emergency
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-teal-600 transition-colors leading-snug">
                                        {hosp.name}
                                    </h3>

                                    <p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                                        {hosp.address}, {hosp.district}, {hosp.state}
                                    </p>

                                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        {hosp.contactNumber || '0471-2300100'}
                                    </p>

                                    {/* Departments list */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <span className="text-xs font-bold text-slate-700 block mb-2">Available Clinical OPDs:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {hosp.departments && hosp.departments.map((dept, i) => (
                                                <span key={i} className="bg-slate-100/80 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors">
                                                    {dept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => navigate(`/patient/book-appointment?hospitalId=${hosp._id}`)}
                                        className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        <Stethoscope className="w-4 h-4" /> Book OP Ticket
                                    </button>

                                    <button
                                        onClick={() => navigate(`/temp-doctor/hospitals?hospitalId=${hosp._id}`)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-3 rounded-xl text-xs transition"
                                        title="Voluntary Doctor Interest"
                                    >
                                        Temp Doctor Slots
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalSearchPage;
