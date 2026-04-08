import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadValidatedStatement, generateReport } from '../api';

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
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setError('');
    const validTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];
    const maxSize = 5 * 1024 * 1024; // 5MB

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
      // Set the file input value
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

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev >= 90 ? 90 : prev + 10);
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
      } else {
        setError(result.message || 'Upload failed');
        setUploadProgress(0);
      }
    } catch (err) {
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
      if (result.success) {
        navigate(`/reports?fileId=${fileId}`);
      }
    } catch (err) {
      setError('Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Statement Upload</h1>
        <p className="text-sm text-[#555] mt-1">Upload your bank CSV or PDF for AI-powered analysis</p>
      </div>

      {/* Upload Zone */}
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
          <i className={`fas ${fileId ? 'fa-check-circle' : 'fa-cloud-arrow-up'} text-2xl`}></i>
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
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  ANALYZING...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <i className="fas fa-wand-magic-sparkles text-xs"></i>
                  GENERATE AI REPORT
                </span>
              )}
            </button>
          </div>
        ) : (
          <>
            <p className="text-base font-semibold text-white mb-1">
              {fileName || (dragActive ? 'Drop your file here' : 'Drop your statement or click to browse')}
            </p>
            <p className="text-[11px] text-[#444] font-medium tracking-wide">
              PDF, CSV — MAX 5MB
            </p>

            {/* Progress Bar */}
            {uploading && (
              <div className="mt-6 max-w-xs mx-auto">
                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-fade-in">
          <i className="fas fa-exclamation-circle text-red-400 text-sm"></i>
          <span className="text-red-400 text-sm font-medium">{error}</span>
        </div>
      )}

      {validationSummary && (
        <div className="cashmate-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Validation Summary</h3>
              <p className="text-[11px] text-[#555] mt-1">Structured parsing completed before storage</p>
            </div>
            {legacyFallbackUsed && (
              <span className="badge badge-neutral">Legacy fallback used</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Rows', value: validationSummary.totalRows || 0 },
              { label: 'Valid', value: validationSummary.validRows || 0 },
              { label: 'Warnings', value: validationSummary.warningRows || 0 },
              { label: 'Stored', value: validationSummary.insertedRows || 0 },
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
                      <p className="text-[10px] text-[#555]">
                        {item.category || 'Uncategorized'} • {new Date(item.date).toLocaleDateString()}
                      </p>
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

      {/* Features */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: 'fa-lock', title: 'Encrypted', desc: 'Bank-grade security' },
          { icon: 'fa-bolt', title: 'Instant', desc: 'Process in seconds' },
          { icon: 'fa-wand-magic-sparkles', title: 'AI-Powered', desc: 'Deep analysis' },
        ].map(item => (
          <div key={item.title} className="text-center p-4 bg-white/[0.02] rounded-xl">
            <i className={`fas ${item.icon} text-[var(--accent-primary)] text-sm mb-2 block`}></i>
            <h4 className="text-[11px] font-bold text-white tracking-wider mb-0.5">{item.title}</h4>
            <p className="text-[10px] text-[#444]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upload;
