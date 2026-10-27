import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Award, AlertTriangle, Lock } from 'lucide-react';

const TempDoctorProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verification document state
    const [documentType, setDocumentType] = useState('MCI Certificate');
    const [documentNumber, setDocumentNumber] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/temporary-doctors/profile');
            if (res.data.success) {
                setProfile(res.data.profile);
            }
        } catch (error) {
            console.error('Fetch temp doctor profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('documentType', documentType);
            formData.append('documentNumber', documentNumber);
            if (selectedFile) {
                formData.append('document', selectedFile);
            }

            const res = await API.post('/temporary-doctors/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                alert('Verification document uploaded! Hospital superintendents can inspect during credential verification. All portal features are now unlocked.');
                setDocumentNumber('');
                setSelectedFile(null);
                // reset file input
                const fileInput = document.getElementById('doc-file-input');
                if (fileInput) fileInput.value = '';
                fetchProfile();
                // Force reload the page to update sidebar lock state
                window.location.reload();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error uploading document.');
        } finally {
            setUploading(false);
        }
    };

    const hasDocs = profile?.verificationDocuments && profile.verificationDocuments.length > 0;

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        <Award className="w-3.5 h-3.5" /> Voluntary Doctor Credential File
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Medical Qualifications &amp; Credential Verification
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Maintain your professional profile, medical registration details, and uploaded certificates for government hospital superintendents.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading credentials profile...</p>
                    </div>
                ) : (
                    <>
                        {/* Onboarding Banner: shown when NO documents uploaded yet */}
                        {!hasDocs && (
                            <div className="mb-6 flex items-start gap-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-3xl p-5 shadow-sm">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-extrabold text-red-800 text-base">⚠ Action Required: Upload Credentials to Unlock Portal</h3>
                                        <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">STEP 1</span>
                                    </div>
                                    <p className="text-sm text-red-700 leading-relaxed">
                                        You must upload at least one verification document (MCI Certificate, Degree Certificate, or Government ID) before accessing other features — browsing hospital requirements, viewing contracts, and checking your schedule are <strong>locked until this step is complete</strong>.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5 text-red-500" />
                                        <span className="text-xs font-bold text-red-600">Upload your certificate below to unlock all portal features ↓</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success banner: docs uploaded but not yet verified */}
                        {hasDocs && profile?.verificationStatus !== 'VERIFIED' && (
                            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <p className="text-sm text-emerald-800 font-semibold">
                                    Documents uploaded! All portal features are now unlocked. Awaiting hospital superintendent verification.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left 2 Cols: Profile Info & Status */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-slate-900">{profile?.doctorName || 'Dr. Voluntary Doctor'}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{profile?.medicalQualification} • Specialization: {profile?.specialization}</p>
                                        </div>
                                        {profile?.verificationStatus === 'VERIFIED' ? (
                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" /> Credentials Verified
                                            </span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" /> Pending Hospital Verification
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                            <span className="font-bold text-slate-500 block mb-1">Medical Registration Number</span>
                                            <p className="font-mono font-bold text-slate-900 text-sm">{profile?.registrationNumber}</p>
                                            <span className="text-slate-400">Authority: {profile?.registrationAuthority || 'Medical Council of India / State Council'}</span>
                                        </div>

                                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                            <span className="font-bold text-slate-500 block mb-1">Doctor Type &amp; Experience</span>
                                            <p className="font-bold text-slate-900 text-sm">{profile?.doctorCategory || 'RETIRED / FREELANCE'}</p>
                                            <span className="text-slate-500">{profile?.yearsOfExperience} Years Clinical Practice</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Uploaded Verification Documents List */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-teal-600" /> Uploaded Qualification &amp; MCI Certificates
                                    </h3>

                                    {profile?.verificationDocuments && profile.verificationDocuments.length > 0 ? (
                                        <div className="space-y-3">
                                            {profile.verificationDocuments.map((doc, idx) => {
                                                const isPdf = doc.fileUrl?.toLowerCase().endsWith('.pdf');
                                                return (
                                                    <div key={idx} className="p-4 bg-slate-50 hover:bg-slate-100/80 transition rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {isPdf ? 'PDF' : 'IMG'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">{doc.documentType}</p>
                                                                <p className="text-slate-500 font-mono text-[11px]">
                                                                    {doc.documentNumber ? `Doc #: ${doc.documentNumber}` : 'Document Attached'}
                                                                    {doc.uploadedAt && ` • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={doc.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> View Certificate
                                                            </a>
                                                            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                                Attached
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
                                            No qualification certificates attached yet. Upload below.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Col: Upload Document Form */}
                            <div className={`bg-white p-6 rounded-3xl border shadow-sm h-fit space-y-4 ${!hasDocs ? 'border-red-300 ring-2 ring-red-200 shadow-red-100/50' : 'border-slate-200'}`}>
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-amber-600" /> Attach Verification Certificate
                                    {!hasDocs && <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full ml-auto">REQUIRED</span>}
                                </h3>

                                <form onSubmit={handleDocumentUpload} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Document Type
                                        </label>
                                        <select
                                            value={documentType}
                                            onChange={(e) => setDocumentType(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        >
                                            <option value="MCI Certificate">Medical Council Registration Certificate</option>
                                            <option value="Degree Certificate">MBBS / MD Degree Certificate</option>
                                            <option value="Identity Proof">Government ID (Aadhaar/PAN)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Document / Registration Number
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={documentNumber}
                                            onChange={(e) => setDocumentNumber(e.target.value)}
                                            placeholder="MCI-KL-12345"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Upload Certificate File
                                        </label>
                                        <label
                                            htmlFor="doc-file-input"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-teal-50 hover:border-teal-400 transition"
                                        >
                                            {selectedFile ? (
                                                <div className="text-center px-2">
                                                    <p className="text-xs font-bold text-teal-700 truncate max-w-[160px]">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                                                    <p className="text-[10px] text-slate-500">Click to choose PDF / Image</p>
                                                </div>
                                            )}
                                        </label>
                                        <input
                                            id="doc-file-input"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="hidden"
                                            onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition ${!hasDocs
                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                                        }`}
                                    >
                                        {uploading ? 'Uploading Certificate...' : !hasDocs ? '🔓 Upload to Unlock Portal' : 'Upload Verification Certificate'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default TempDoctorProfilePage;
