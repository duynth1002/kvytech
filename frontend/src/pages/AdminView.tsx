import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { ShieldCheck, Check, X, AlertTriangle, FileText, Clock } from 'lucide-react';

export default function AdminView() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      const data = await apiFetch('/admin/verifications');
      setVerifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVerifications();
    const interval = setInterval(fetchVerifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleReview = async (id: string, decision: 'MANUAL_APPROVED' | 'MANUAL_REJECTED') => {
    let reason = '';
    if (decision === 'MANUAL_REJECTED') {
      const input = prompt('Please provide a reason for rejection:');
      if (input === null) return; // Cancelled
      reason = input;
    } else {
      const input = prompt('Optional: Provide an approval note or leave blank:');
      if (input !== null) reason = input;
    }

    setIsSubmitting(id);
    try {
      await apiFetch(`/admin/verifications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason }),
      });
      await fetchVerifications();
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setIsSubmitting(null);
    }
  };

  const pendingCount = verifications.filter(v => v.status === 'PENDING').length;
  const inconclusiveCount = verifications.filter(v => v.status === 'INCONCLUSIVE').length;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Workspace</h1>
          <p className="text-slate-600 mt-1">Review inconclusive documents and monitor the queue.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-full">
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">In Automated Queue</p>
            <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Action Required</p>
            <p className="text-3xl font-bold text-slate-900">{inconclusiveCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Needs Manual Review</h2>
        </div>
        
        {inconclusiveCount === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Check className="w-12 h-12 mx-auto text-green-400 mb-3" />
            <p>You're all caught up! No documents need manual review right now.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {verifications.filter(v => v.status === 'INCONCLUSIVE').map(v => (
              <li key={v.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-slate-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900">{v.document.originalName}</h3>
                    <p className="text-sm text-slate-500 mt-1">Uploaded {new Date(v.document.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-amber-700 mt-2 bg-amber-50 p-2 rounded inline-block">
                      <span className="font-medium">System Reason:</span> {v.resultReason}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleReview(v.id, 'MANUAL_APPROVED')}
                    disabled={isSubmitting === v.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleReview(v.id, 'MANUAL_REJECTED')}
                    disabled={isSubmitting === v.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
