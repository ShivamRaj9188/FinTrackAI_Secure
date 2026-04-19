import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadValidatedStatement, generateReport } from '../api';
import { getPlanLimits } from '../api/payment';
import PaymentModal from '../components/PaymentModal';

const Upload = () => {
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fileId, setFileId] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationSummary, setValidationSummary] = useState(null);
  const [validationPreview, setValidationPreview] = useState([]);
  const [ingestionWarnings, setIngestionWarnings] = useState([]);
  const [legacyFallbackUsed, setLegacyFallbackUsed] = useState(false);

  // Plan limits state
  const [planLimits, setPlanLimits] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch plan limits on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const result = await getPlanLimits();
        if (result.success) {
          const { limits, usage, currentPlan } = result.data;
          setPlanLimits({ limits, usage, currentPlan });
          const maxUploads = limits.maxUploadsPerMonth;
          if (maxUploads !== -1 && usage.uploadsThisMonth >= maxUploads) {
            setLimitReached(true);
          }
        }
      } catch {
        // Non-critical — don't block upload UI
      }
    };
    fetchLimits();
  }, [fileId]); // Re-fetch after each successful upload

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setError('');
    const validTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];
    const maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|csv)$/i)) {
      setError('Only PDF and CSV files are supported');
      return;
    }
    if (file.size > maxSize) {
      setError('File size must be under 5MB');
      return;
    }
    setFileName(file.name);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      fileInputRef.current.files = dt.files;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);
    setValidationSummary(null);
    setValidationPreview([]);
    setIngestionWarnings([]);
    setLegacyFallbackUsed(false);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 300);

    try {
      const result = await uploadValidatedStatement(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setFileId(result.fileId);
        setValidationSummary(result.validationSummary);
        setValidationPreview(result.preview || []);
        setIngestionWarnings(result.warnings || []);
        setLegacyFallbackUsed(Boolean(result.fallbackUsed));
      } else if (result.planLimit) {
        // Backend returned 403 plan limit
        setLimitReached(true);
        setError('');
        setUploadProgress(0);
      } else {
        setError(result.message || 'Upload failed');
        setUploadProgress(0);
      }
    } catch {
      clearInterval(progressInterval);
      setError('Failed to upload. Check your connection.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!fileId) return;
    setGenerating(true);
    try {
      const result = await generateReport(fileId);
      if (result.success) navigate(`/reports?fileId=${fileId}`);
    } catch {
      setError('Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const currentPlan = planLimits?.currentPlan || 'Basic';
  const uploadsUsed = planLimits?.usage?.uploadsThisMonth ?? 0;
  const uploadsMax = planLimits?.limits?.maxUploadsPerMonth ?? 5;
  const isUnlimited = uploadsMax === -1;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* PaymentModal */}
      {showPaymentModal && (
        <PaymentModal
          plan="Pro"
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            setLimitReached(false);
            setUpgradeSuccess('🎉 Upgraded to Pro! You now have unlimited uploads.');
            setTimeout(() => setUpgradeSuccess(''), 6000);
            // Refresh limits
            setPlanLimits(null);
          }}
        />
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Statement Upload</h1>
        <p className="text-sm text-[#555] mt-1">Upload your bank CSV or PDF for AI-powered analysis</p>
      </div>

      {/* Upgrade success */}
      {upgradeSuccess && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl animate-fade-in">
          <i className="fas fa-check-circle text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">{upgradeSuccess}</span>
        </div>
      )}

      {/* Plan usage bar */}
      {planLimits && (
        <div className="cashmate-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="fas fa-cloud-arrow-up text-[var(--accent-primary)] text-xs" />
              <span className="text-xs font-bold text-[#666] uppercase tracking-wider">Upload Usage — {currentPlan} Plan</span>
            </div>
            {!isUnlimited && (
              <span className={`text-xs font-bold ${limitReached ? 'text-red-400' : 'text-[#666]'}`}>
                {uploadsUsed} / {uploadsMax} used
              </span>
            )}
            {isUnlimited && (
              <span className="text-xs font-bold text-emerald-400">Unlimited ✓</span>
            )}
          </div>
          {!isUnlimited && (
            <>
              <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    limitReached
                      ? 'bg-red-500'
                      : uploadsUsed / uploadsMax >= 0.8
                        ? 'bg-yellow-400'
                        : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]'
                  }`}
                  style={{ width: `${Math.min(100, (uploadsUsed / uploadsMax) * 100)}%` }}
                />
              </div>
              {uploadsUsed / uploadsMax >= 0.8 && !limitReached && (
                <p className="text-[10px] text-yellow-400 mt-2 font-medium">
                  ⚠ Almost at your limit — {uploadsMax - uploadsUsed} upload{uploadsMax - uploadsUsed !== 1 ? 's' : ''} remaining this month
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── LIMIT REACHED BANNER ── */}
      {limitReached && (
        <div className="cashmate-card border border-red-500/20 bg-red-500/5 p-6 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-ban text-red-400 text-2xl" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Monthly Upload Limit Reached</h3>
          <p className="text-sm text-[#666] mb-6 max-w-sm mx-auto">
            Your <span className="text-white font-semibold">Basic plan</span> allows {uploadsMax} uploads per month.
            Upgrade to <span className="gradient-text font-bold">Pro</span> for unlimited uploads, advanced AI insights, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary px-8 py-3 rounded-2xl text-sm"
            >
              <i className="fas fa-arrow-up text-xs mr-2" />
              UPGRADE TO PRO — ₹149/mo
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#666] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:text-white transition-all"
            >
              View All Plans
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone — hidden when limit reached */}
      {!limitReached && (
        <div
          className={`cashmate-card p-10 text-center border-dashed border-2 transition-all duration-300 cursor-pointer ${
            dragActive
              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
              : fileId
                ? 'border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/5'
                : 'border-white/[0.08] hover:border-white/[0.15]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !fileId && fileInputRef.current?.click()}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all ${
            fileId
              ? 'bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]'
              : dragActive
                ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] scale-110'
                : 'bg-white/[0.04] text-[#555]'
          }`}>
            <i className={`fas ${fileId ? 'fa-check-circle' : 'fa-cloud-arrow-up'} text-2xl`} />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.csv"
          />

          {fileId ? (
            <div className="animate-fade-in">
              <p className="text-base font-bold text-[var(--accent-secondary)] mb-1">Upload Successful!</p>
              <p className="text-sm text-[#555] mb-6">{fileName}</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                disabled={generating}
                className="btn-accent px-8 py-3 rounded-2xl text-sm disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-spinner fa-spin text-xs" />ANALYZING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-wand-magic-sparkles text-xs" />GENERATE AI REPORT
                  </span>
                )}
              </button>
            </div>
          ) : (
            <>
              <p className="text-base font-semibold text-white mb-1">
                {fileName || (dragActive ? 'Drop your file here' : 'Drop your statement or click to browse')}
              </p>
              <p className="text-[11px] text-[#444] font-medium tracking-wide">PDF, CSV — MAX 5MB</p>

              {uploading && (
                <div className="mt-6 max-w-xs mx-auto">
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#555] mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}

              {!uploading && fileName && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpload(e); }}
                  className="btn-primary mt-6 px-8 py-3 rounded-2xl text-sm"
                >
                  UPLOAD NOW
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-fade-in">
          <i className="fas fa-exclamation-circle text-red-400 text-sm" />
          <span className="text-red-400 text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Validation Summary */}
      {validationSummary && (
        <div className="cashmate-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Validation Summary</h3>
              <p className="text-[11px] text-[#555] mt-1">Structured parsing completed before storage</p>
            </div>
            {legacyFallbackUsed && <span className="badge badge-neutral">Legacy fallback used</span>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Rows',     value: validationSummary.totalRows   || 0 },
              { label: 'Valid',    value: validationSummary.validRows    || 0 },
              { label: 'Warnings', value: validationSummary.warningRows  || 0 },
              { label: 'Stored',   value: validationSummary.insertedRows || 0 },
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.02] rounded-xl p-4">
                <p className="text-[10px] text-[#555] uppercase tracking-wider font-bold mb-1">{item.label}</p>
                <p className="text-lg font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          {validationPreview.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] text-[#555] uppercase tracking-wider font-bold mb-3">Preview</p>
              <div className="space-y-2">
                {validationPreview.map((item, index) => (
                  <div key={`${item.description}-${index}`} className="flex items-center justify-between gap-3 bg-white/[0.02] rounded-xl px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-semibold truncate">{item.description}</p>
                      <p className="text-[10px] text-[#555]">{item.category || 'Uncategorized'} • {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`text-sm font-bold whitespace-nowrap ${item.type === 'credit' ? 'text-[var(--accent-secondary)]' : 'text-white'}`}>
                      {item.type === 'credit' ? '+' : '-'}₹{Number(item.amount || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ingestionWarnings.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] text-yellow-400 uppercase tracking-wider font-bold mb-2">Warnings</p>
              <ul className="space-y-1 text-[12px] text-[#888]">
                {ingestionWarnings.slice(0, 4).map((warning, index) => (
                  <li key={`${warning}-${index}`}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: 'fa-lock',              title: 'Encrypted',  desc: 'Bank-grade security' },
          { icon: 'fa-bolt',              title: 'Instant',    desc: 'Process in seconds'  },
          { icon: 'fa-wand-magic-sparkles', title: 'AI-Powered', desc: 'Deep analysis'       },
        ].map((item) => (
          <div key={item.title} className="text-center p-4 bg-white/[0.02] rounded-xl">
            <i className={`fas ${item.icon} text-[var(--accent-primary)] text-sm mb-2 block`} />
            <h4 className="text-[11px] font-bold text-white tracking-wider mb-0.5">{item.title}</h4>
            <p className="text-[10px] text-[#444]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upload;
