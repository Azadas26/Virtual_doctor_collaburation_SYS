import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import {
    UserCheck,
    ShieldCheck,
    FileCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    ExternalLink,
    FileText,
    Download,
    X,
    Award,
    Star,
    Calendar,
    Check,
    FileBadge
} from 'lucide-react';

const HospitalRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Document Viewer Modal State
    const [viewerModal, setViewerModal] = useState({
        isOpen: false,
        doctorName: '',
        tempProfileId: null,
        documents: [],
        activeIndex: 0
    });

    // Verification Dialog Modal State
    const [verifyModal, setVerifyModal] = useState({
        isOpen: false,
        profileId: null,
        doctorName: '',
        registrationNumber: '',
        specialization: '',
        qualification: '',
        status: 'VERIFIED',
        notes: '',
        submitting: false
    });

    // Contract Issuance Modal State
    const [selectedReq, setSelectedReq] = useState(null);
    const [showContractModal, setShowContractModal] = useState(false);
    const [noticePeriod, setNoticePeriod] = useState('24 Hours');
    const [consultationResponsibilities, setConsultationResponsibilities] = useState('Provide outpatient clinical consultation during assigned shift hours');
    const [submittingContract, setSubmittingContract] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await API.get('/hospital-admin/requests');
            if (res.data.success) {
                setRequests(res.data.requests);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Open Evidence Viewer Modal
    const handleOpenViewer = (doctorName, tempProfileId, documents, initialIndex = 0) => {
        if (!documents || documents.length === 0) {
            alert('No verification documents uploaded by this doctor yet.');
            return;
        }
        setViewerModal({
            isOpen: true,
            doctorName,
            tempProfileId,
            documents,
            activeIndex: initialIndex
        });
    };

    const handleCloseViewer = () => {
        setViewerModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Open Verification Modal
    const handleOpenVerifyModal = (profile) => {
        if (!profile) return;
        setVerifyModal({
            isOpen: true,
            profileId: profile._id,
            doctorName: profile.doctorName,
            registrationNumber: profile.registrationNumber || 'N/A',
            specialization: profile.specialization || 'General',
            qualification: profile.medicalQualification || 'MBBS',
            status: profile.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'VERIFIED',
            notes: profile.verificationNotes || 'MCI Medical Registration and credentials verified against official records by Superintendent.',
            submitting: false
        });
    };

    const handleCloseVerifyModal = () => {
        setVerifyModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
    };

    // Submit Verification
    const handleSubmitVerification = async (e) => {
        e.preventDefault();
        setVerifyModal((prev) => ({ ...prev, submitting: true }));

        try {
            const res = await API.put(`/hospital-admin/verify-doctor/${verifyModal.profileId}`, {
                status: verifyModal.status,
                notes: verifyModal.notes
            });

            if (res.data.success) {
                alert(`Doctor verification status updated to '${verifyModal.status}'!`);
                handleCloseVerifyModal();
                // Also close viewer if open
                if (viewerModal.isOpen) {
                    handleCloseViewer();
                }
                fetchRequests();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating verification status.');
        } finally {
            setVerifyModal((prev) => ({ ...prev, submitting: false }));
        }
    };

    // Issue Contract Submit
    const handleIssueContractSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReq) return;
        setSubmittingContract(true);
        try {
            const res = await API.post(`/contracts/issue/${selectedReq._id}`, {
                noticePeriod,
                consultationResponsibilities
            });
            if (res.data.success) {
                alert('Service Contract generated and issued to doctor successfully!');
                setShowContractModal(false);
                setSelectedReq(null);
                fetchRequests();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error issuing contract.');
        } finally {
            setSubmittingContract(false);
        }
    };

    const activeDoc = viewerModal.documents[viewerModal.activeIndex] || null;
    const isPdfDoc = activeDoc?.fileUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Medical Credentials & Evidence Inspection
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Voluntary Doctor Applications & Verifications
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Review interest requests submitted by voluntary temporary doctors, inspect uploaded MCI certificates and evidence PDFs, verify credentials, and issue legally binding service contracts.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm">Loading applications and verification files...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto shadow-sm">
                        <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Applications Pending</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Temporary doctor applications will appear here when doctors express interest in your hospital requirements.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {requests.map((reqItem) => {
                            const profile = reqItem.tempProfileId;
                            const docs = profile?.verificationDocuments || [];
                            const isVerified = profile?.verificationStatus === 'VERIFIED';
                            const isUnderReview = profile?.verificationStatus === 'UNDER_REVIEW';
                            const isRejected = profile?.verificationStatus === 'REJECTED';

                            return (
                                <div
                                    key={reqItem._id}
                                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-6 md:p-8 space-y-6"
                                >
                                    {/* Top Bar: Doctor Identity & Status */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-extrabold text-slate-900">
                                                    {profile?.doctorName || 'Dr. Applicant'}
                                                </h2>
                                                {profile?.currentProfessionalStatus && (
                                                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                                        {profile.currentProfessionalStatus}
                                                    </span>
                                                )}
                                                {profile?.reliabilityRating && (
                                                    <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                        {profile.reliabilityRating.toFixed(1)} Rating
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span><strong className="text-slate-700">Specialization:</strong> {profile?.specialization || reqItem.specialization}</span>
                                                <span>•</span>
                                                <span><strong className="text-slate-700">Qualification:</strong> {profile?.medicalQualification || 'MBBS'}</span>
                                                <span>•</span>
                                                <span><strong className="text-slate-700">Experience:</strong> {profile?.yearsOfExperience || 0} Years</span>
                                                {profile?.contactNumber && (
                                                    <>
                                                        <span>•</span>
                                                        <span><strong className="text-slate-700">Contact:</strong> {profile.contactNumber}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="shrink-0">
                                            {isVerified ? (
                                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> MCI Credentials Verified
                                                </span>
                                            ) : isUnderReview ? (
                                                <span className="bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                                    <Clock className="w-4 h-4 text-sky-600" /> Under Superintendent Review
                                                </span>
                                            ) : isRejected ? (
                                                <span className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                                    <AlertCircle className="w-4 h-4 text-rose-600" /> Credentials Rejected
                                                </span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                                    <AlertCircle className="w-4 h-4 text-amber-600" /> Verification Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle Section: Registration, Schedule & Message */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                                            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                                                Medical Registration
                                            </span>
                                            <p className="font-mono font-bold text-slate-900 text-sm">
                                                {profile?.registrationNumber || 'Not Provided'}
                                            </p>
                                            <p className="text-slate-500 text-[11px]">
                                                Authority: {profile?.registrationAuthority || 'Medical Council of India'}
                                            </p>
                                            {profile?.previousHospital && (
                                                <p className="text-slate-500 text-[11px] truncate">
                                                    Prev: {profile.previousHospital}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                                            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                                                Requested Availability
                                            </span>
                                            <p className="font-bold text-slate-900">
                                                {reqItem.availableDays?.join(', ') || 'Flexible Days'}
                                            </p>
                                            <p className="text-slate-600 font-mono text-[11px]">
                                                {reqItem.availableStartTime} - {reqItem.availableEndTime}
                                            </p>
                                            <p className="text-slate-500 text-[11px]">
                                                Capacity: ~{reqItem.consultationCapacity || 25} Patients / Shift
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 md:col-span-2 lg:col-span-1">
                                            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                                                Doctor Voluntary Statement
                                            </span>
                                            <p className="text-slate-700 italic line-clamp-3 text-[11px]">
                                                "{reqItem.message || 'Ready to volunteer clinical consultation for this department.'}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Verification Evidence & Uploaded Files Section */}
                                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 md:p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                <FileBadge className="w-4 h-4 text-teal-600" />
                                                Uploaded Verification Evidence & Credentials ({docs.length})
                                            </h3>
                                            {docs.length > 0 && (
                                                <span className="text-[11px] text-teal-700 font-semibold">
                                                    Click to inspect original evidence
                                                </span>
                                            )}
                                        </div>

                                        {docs.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {docs.map((doc, idx) => {
                                                    const isPdf = doc.fileUrl?.toLowerCase().endsWith('.pdf');
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-teal-400 hover:shadow-sm transition"
                                                        >
                                                            <div className="flex items-start gap-2.5 mb-3">
                                                                <div
                                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                                                                        isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                                                    }`}
                                                                >
                                                                    {isPdf ? 'PDF' : 'IMG'}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-slate-900 text-xs truncate">
                                                                        {doc.documentType || 'Verification File'}
                                                                    </p>
                                                                    <p className="text-slate-500 font-mono text-[10px] truncate">
                                                                        {doc.documentNumber ? `Doc #: ${doc.documentNumber}` : 'Document Attached'}
                                                                    </p>
                                                                    {doc.uploadedAt && (
                                                                        <p className="text-slate-400 text-[10px]">
                                                                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Action buttons on card */}
                                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenViewer(profile?.doctorName, profile?._id, docs, idx)}
                                                                    className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-1.5 px-2.5 rounded-lg text-xs flex items-center justify-center gap-1 transition"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" /> View Evidence
                                                                </button>
                                                                <a
                                                                    href={doc.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title="Open in new window"
                                                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                <span>No verification evidence documents uploaded by doctor yet. You may request documents before issuing a contract.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Superintendent Verification Review Audit Trail (if reviewed) */}
                                    {profile?.verificationNotes && (
                                        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-emerald-950">
                                                    Superintendent Verification Record:
                                                </p>
                                                <p className="text-emerald-800 mt-0.5">
                                                    "{profile.verificationNotes}"
                                                </p>
                                                {profile.verifiedAt && (
                                                    <p className="text-emerald-700/80 text-[10px] mt-1 font-mono">
                                                        Recorded on: {new Date(profile.verifiedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons Footer */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenVerifyModal(profile)}
                                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm shadow-amber-600/20"
                                            >
                                                <ShieldCheck className="w-4 h-4" />
                                                {isVerified ? 'Edit Verification Notes' : 'Verify Doctor & Documents'}
                                            </button>

                                            {docs.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenViewer(profile?.doctorName, profile?._id, docs, 0)}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                                                >
                                                    <Eye className="w-4 h-4" /> Inspect Documents ({docs.length})
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {reqItem.status === 'PENDING' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedReq(reqItem);
                                                        setShowContractModal(true);
                                                    }}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-teal-600/20"
                                                >
                                                    <FileCheck className="w-4 h-4" /> Issue Service Contract
                                                </button>
                                            )}

                                            {reqItem.status === 'CONTRACT_SENT' && (
                                                <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" /> Contract Issued (Awaiting Doctor Acceptance)
                                                </span>
                                            )}

                                            {reqItem.status === 'CONTRACT_ACCEPTED' && (
                                                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Contract Accepted & Doctor Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 1. Evidence Document Viewer Modal */}
                {viewerModal.isOpen && activeDoc && (
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50">
                        <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-extrabold text-slate-900 text-lg">
                                            {activeDoc.documentType || 'Verification Evidence'}
                                        </h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                            isPdfDoc ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {isPdfDoc ? 'PDF DOCUMENT' : 'IMAGE EVIDENCE'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Doctor: <strong className="text-slate-800">{viewerModal.doctorName}</strong>
                                        {activeDoc.documentNumber && ` • Reg/Doc #: ${activeDoc.documentNumber}`}
                                        {activeDoc.uploadedAt && ` • Uploaded: ${new Date(activeDoc.uploadedAt).toLocaleDateString()}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={activeDoc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Full Screen
                                    </a>
                                    <a
                                        href={activeDoc.fileUrl}
                                        download
                                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Download
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleCloseViewer}
                                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Multi-document Tabs (if more than 1 document) */}
                            {viewerModal.documents.length > 1 && (
                                <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
                                    <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider">
                                        Evidence Files:
                                    </span>
                                    {viewerModal.documents.map((doc, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setViewerModal((prev) => ({ ...prev, activeIndex: idx }))}
                                            className={`text-xs font-bold px-3 py-1 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                                                viewerModal.activeIndex === idx
                                                    ? 'bg-teal-600 text-white shadow-sm'
                                                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                                            }`}
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            {doc.documentType} ({doc.fileUrl?.toLowerCase().endsWith('.pdf') ? 'PDF' : 'IMG'})
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Modal Viewer Content */}
                            <div className="flex-1 bg-slate-200/50 p-4 overflow-auto flex items-center justify-center">
                                {isPdfDoc ? (
                                    <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <iframe
                                            src={`${activeDoc.fileUrl}#toolbar=1&navpanes=0`}
                                            title={activeDoc.documentType || 'Doctor Evidence PDF'}
                                            className="w-full flex-1 border-0"
                                        />
                                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                                            <span>Displaying official PDF certificate document.</span>
                                            <a
                                                href={activeDoc.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Open in dedicated window
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-h-full max-w-full flex items-center justify-center p-2 bg-white rounded-2xl shadow-sm border border-slate-200">
                                        <img
                                            src={activeDoc.fileUrl}
                                            alt={activeDoc.documentType || 'Uploaded Credential Evidence'}
                                            className="max-h-[70vh] max-w-full object-contain rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    Document {viewerModal.activeIndex + 1} of {viewerModal.documents.length}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const req = requests.find((r) => r.tempProfileId?._id === viewerModal.tempProfileId);
                                            if (req && req.tempProfileId) {
                                                handleOpenVerifyModal(req.tempProfileId);
                                            }
                                        }}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Open Verification Checklist
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseViewer}
                                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                                    >
                                        Close Viewer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Superintendent Verification Dialog Modal */}
                {verifyModal.isOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Superintendent Credential Checklist
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        Verify Doctor Credentials
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseVerifyModal}
                                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                                <p><strong className="text-slate-700">Doctor Name:</strong> {verifyModal.doctorName}</p>
                                <p><strong className="text-slate-700">MCI Registration Number:</strong> <span className="font-mono font-bold text-slate-900">{verifyModal.registrationNumber}</span></p>
                                <p><strong className="text-slate-700">Qualification & Specialization:</strong> {verifyModal.qualification} ({verifyModal.specialization})</p>
                            </div>

                            <form onSubmit={handleSubmitVerification} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Verification Decision
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                        <label className={`p-3 rounded-xl border cursor-pointer font-bold flex flex-col items-center justify-center text-center gap-1 transition ${
                                            verifyModal.status === 'VERIFIED'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="verifyStatus"
                                                value="VERIFIED"
                                                checked={verifyModal.status === 'VERIFIED'}
                                                onChange={(e) => setVerifyModal((prev) => ({ ...prev, status: e.target.value }))}
                                                className="hidden"
                                            />
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span>VERIFIED</span>
                                            <span className="text-[10px] font-normal text-emerald-700">Approve Credentials</span>
                                        </label>

                                        <label className={`p-3 rounded-xl border cursor-pointer font-bold flex flex-col items-center justify-center text-center gap-1 transition ${
                                            verifyModal.status === 'UNDER_REVIEW'
                                                ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-sm'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="verifyStatus"
                                                value="UNDER_REVIEW"
                                                checked={verifyModal.status === 'UNDER_REVIEW'}
                                                onChange={(e) => setVerifyModal((prev) => ({ ...prev, status: e.target.value }))}
                                                className="hidden"
                                            />
                                            <Clock className="w-4 h-4 text-sky-600" />
                                            <span>UNDER REVIEW</span>
                                            <span className="text-[10px] font-normal text-sky-700">Clarification Needed</span>
                                        </label>

                                        <label className={`p-3 rounded-xl border cursor-pointer font-bold flex flex-col items-center justify-center text-center gap-1 transition ${
                                            verifyModal.status === 'REJECTED'
                                                ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="verifyStatus"
                                                value="REJECTED"
                                                checked={verifyModal.status === 'REJECTED'}
                                                onChange={(e) => setVerifyModal((prev) => ({ ...prev, status: e.target.value }))}
                                                className="hidden"
                                            />
                                            <AlertCircle className="w-4 h-4 text-rose-600" />
                                            <span>REJECTED</span>
                                            <span className="text-[10px] font-normal text-rose-700">Invalid Documents</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Superintendent Verification Notes / Remarks
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={verifyModal.notes}
                                        onChange={(e) => setVerifyModal((prev) => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Enter verification notes (e.g. MCI registration verified on NMC registry...)"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        These notes will be logged in the permanent audit ledger and shown on the verified profile.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleCloseVerifyModal}
                                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={verifyModal.submitting}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" />
                                        {verifyModal.submitting ? 'Saving Verification...' : 'Confirm Verification'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. Issue Service Contract Modal */}
                {showContractModal && selectedReq && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <h3 className="text-xl font-bold text-slate-900">
                                Issue Service Contract
                            </h3>
                            <p className="text-slate-600 text-xs">
                                Issuing voluntary service contract to <strong className="text-slate-900">{selectedReq.tempProfileId?.doctorName}</strong> for {selectedReq.specialization}.
                            </p>

                            <form onSubmit={handleIssueContractSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Notice Period for Drop-out / Cancellation
                                    </label>
                                    <select
                                        value={noticePeriod}
                                        onChange={(e) => setNoticePeriod(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="24 Hours">24 Hours Notice</option>
                                        <option value="48 Hours">48 Hours Notice</option>
                                        <option value="7 Days">7 Days Notice</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Consultation Responsibilities
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={consultationResponsibilities}
                                        onChange={(e) => setConsultationResponsibilities(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowContractModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingContract}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20 transition"
                                    >
                                        {submittingContract ? 'Issuing Contract...' : 'Issue & Send Contract'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HospitalRequestsPage;
