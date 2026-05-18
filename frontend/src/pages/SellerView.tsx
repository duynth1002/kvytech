import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function SellerView() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const data = await apiFetch('/seller/documents');
      setDocuments(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      await apiFetch('/seller/documents', {
        method: 'POST',
        body: formData,
      });
      
      await fetchDocuments();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'MANUAL_APPROVED':
        return <CheckCircle className="text-green-500 w-6 h-6" />;
      case 'REJECTED':
      case 'MANUAL_REJECTED':
        return <XCircle className="text-red-500 w-6 h-6" />;
      case 'INCONCLUSIVE':
        return <AlertTriangle className="text-amber-500 w-6 h-6" />;
      default:
        return <Clock className="text-blue-500 w-6 h-6 animate-pulse" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'Verified Automatically';
      case 'MANUAL_APPROVED': return 'Approved by Admin';
      case 'REJECTED': return 'Rejected Automatically';
      case 'MANUAL_REJECTED': return 'Rejected by Admin';
      case 'INCONCLUSIVE': return 'Pending Manual Review';
      case 'PENDING': return 'Verifying...';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
          <p className="text-slate-600 mt-2">Upload your business verification documents to get approved.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8 text-center">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden" 
          accept="image/png, image/jpeg, application/pdf"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? <Clock className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
          {isUploading ? 'Uploading...' : 'Upload New Document'}
        </button>
        {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
        <p className="text-slate-500 mt-4 text-sm">Accepts PDF, JPG, PNG (Max 5MB)</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Your Documents</h2>
        {documents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => {
              const attempt = doc.verificationAttempts?.[0];
              const status = attempt?.status || 'PENDING';
              
              return (
                <div key={doc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <FileText className="text-slate-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{doc.originalName}</h3>
                      <p className="text-sm text-slate-500 mt-1">Uploaded {new Date(doc.createdAt).toLocaleString()}</p>
                      {attempt?.resultReason && (
                        <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="font-medium">Reason:</span> {attempt.resultReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    {getStatusIcon(status)}
                    <span className="font-medium text-slate-700 text-sm">{getStatusText(status)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
