import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Header from './Header';
import Footer from '../components/Footer';
import uploadIllustration from '../assets/images/upload-illustration.jpg';
import { uploadFile, generateReport, downloadReport } from '../api';

const Upload = () => {
  const [fileName, setFileName] = useState('Drag and drop or click to upload a file');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [planLimits, setPlanLimits] = useState(null);
  const previewRef = useRef(null);
  const downloadRef = useRef(null);
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = [
    'application/pdf',
    'text/csv',
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = '#3182ce';
      dropZoneRef.current.style.backgroundColor = '#e6f0fb';
    }
  };

  const handleDragLeave = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = '#cbd5e0';
      dropZoneRef.current.style.backgroundColor = '#edf2f7';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = '#cbd5e0';
      dropZoneRef.current.style.backgroundColor = '#edf2f7';
    }
    
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      setFileName(file.name);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file ? file.name : 'Drag and drop or click to upload a file');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (file.size > maxSizeBytes) {
      alert(`File size exceeds ${maxSizeMB}MB. Please choose a smaller file.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileName('Drag and drop or click to upload a file');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF and CSV are allowed.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileName('Drag and drop or click to upload a file');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      // Call real API instead of setTimeout
      const result = await uploadFile(file);
      
      if (result.success) {
        setUploadedFileId(result.fileId);
        setPreviewVisible(true);
        
        // Reset form
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFileName('Drag and drop or click to upload a file');
        
        // Animate preview section
        if (previewRef.current) {
          requestAnimationFrame(() => {
            gsap.fromTo(previewRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
          });
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      // Handle plan limit errors
      if (err.message && err.message.includes('Upload limit reached')) {
        setError(err.message);
        // Reload plan limits to update UI
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.plan === 'Basic') {
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/user/plan-limits`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (response.ok) {
              const data = await response.json();
              setPlanLimits(data.data);
            }
          } catch (limitError) {
            console.error('Failed to reload plan limits:', limitError);
          }
        }
      } else {
        setError(err.message || 'Failed to upload file. Please try again.');
        alert('Upload limit reached. Please upgrade your plan.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!uploadedFileId) {
      alert('No file uploaded to generate report from.');
      return;
    }

    setGenerating(true);
    setError('');
    
    try {
      // Pass uploadedFileId as fileId
      const result = await generateReport(uploadedFileId);
      
      if (result.success) {
        setReportData(result.data);
        setDownloadVisible(true);
        // Redirect to Reports page with report data and fileId in URL
        navigate(`/reports?fileId=${uploadedFileId}`, { 
          state: { 
            reportData: result.data,
            dateRange: result.dateRange
          } 
        });
        // Animate download section
        if (downloadRef.current) {
          requestAnimationFrame(() => {
            gsap.fromTo(downloadRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
          });
        }
      } else {
        throw new Error(result.message || 'Report generation failed');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (format) => {
    if (!reportData) {
      alert('No report data available to download.');
      return;
    }

    try {
      const result = await downloadReport(reportData.id, format);
      
      if (result.success) {
        // Create download link
        const url = window.URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-report.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(result.message || 'Download failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Please try again.');
    }
  };

  // Load plan limits
  useEffect(() => {
    const loadPlanLimits = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userPlan = userInfo.plan || 'Basic';
        
        if (userPlan === 'Basic') {
          // For Basic users, get upload count
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/user/plan-limits`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setPlanLimits(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to load plan limits:', error);
      }
    };
    
    loadPlanLimits();
    
    // Simplified animations
    const timer = setTimeout(() => {
      gsap.from('.hero h2', { y: -30, opacity: 0, duration: 1 });
      gsap.from('.hero p', { y: 30, opacity: 0, duration: 1, delay: 0.3 });
      gsap.from('.upload-illustration', { x: -50, opacity: 0, duration: 1, delay: 0.6 });
      gsap.from('.upload-form-block', { x: 50, opacity: 0, duration: 1, delay: 0.6 });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      
      <section className="hero">
        <h2>Upload Your Financial Documents</h2>
        <p>Drag, drop or select your expense files to begin your smart analysis journey.</p>
      </section>

      <main className="container upload-layout">
        <div className="upload-illustration">
          <img src={uploadIllustration} alt="Upload Illustration" />
        </div>
        <div className="upload-form-block">
          {planLimits && planLimits.currentPlan === 'Basic' && (
            <div className="plan-limits-info bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Basic Plan:</strong> {planLimits.usage.uploadsThisMonth}/5 uploads used this month
                  {planLimits.usage.uploadsRemaining === 0 && (
                    <div className="text-red-600 text-sm mt-1">
                      Upload limit reached. <button onClick={() => navigate('/dashboard?showPricing=true')} className="underline">Upgrade to Pro</button> for unlimited uploads.
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600">
                    {planLimits.usage.uploadsRemaining} remaining
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          <form className="upload-form" onSubmit={handleSubmit}>
            <label 
              htmlFor="fileInput" 
              className="drop-zone" 
              ref={dropZoneRef}
              onDragOver={handleDragOver} 
              onDragLeave={handleDragLeave} 
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="fileInput" 
                name="file"
                ref={fileInputRef}
                accept=".pdf,.csv" 
                required 
                onChange={handleFileChange} 
              />
              <span id="fileName">{fileName}</span>
            </label>
            <button 
              type="submit" 
              id="uploadBtn" 
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          {previewVisible && (
            <div ref={previewRef} id="previewSection" className="preview-section">
              <p className="inline-flex items-center bg-green-100 text-green-700 px-4 py-1 rounded-full font-medium text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                File is ready for processing.
              </p>
              <br />
              <button
                id="generateBtn"
                disabled={generating}
                className="bg-green-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-700 transition duration-300"
                onClick={handleGenerateReport}
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}

          {downloadVisible && (
            <div ref={downloadRef} id="downloadSection" className="download-section">
              <p className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-semibold text-sm">
                🎉 Report generated!
              </p>
              <div className="download-buttons flex flex-wrap justify-center gap-4 mt-4">
                <button 
                  className="download-btn bg-purple-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-purple-700 transition duration-300" 
                  onClick={() => handleDownload('pdf')}
                >
                  Download as PDF
                </button>
                <button 
                  className="download-btn bg-pink-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-pink-700 transition duration-300" 
                  onClick={() => handleDownload('csv')}
                >
                  Download as CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      <style>{`
        /* Upload CSS */
        .hero {
          background: linear-gradient(to right, #ebf8ff, #fefcbf);
          text-align: center;
          padding: 3rem 1rem 2rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .hero h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .hero p {
          font-size: 1.125rem;
          color: #4a5568;
        }

        .container.upload-layout {
          display: flex;
          gap: 3rem;
          padding: 3rem;
          justify-content: center;
          align-items: flex-start;
          flex-wrap: wrap;
          max-width: 1200px;
          margin: auto;
        }

        .upload-illustration {
          flex: 1;
          max-width: 35%;
          min-width: 250px;
          opacity: 1;
        }

        .upload-illustration img {
          max-width: 400px;
          width: 100%;
          height: auto;
        }

        .upload-form-block {
          flex: 2;
          min-width: 320px;
          opacity: 1;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .drop-zone {
          background-color: #edf2f7;
          border: 2px dashed #cbd5e0;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
        }

        .drop-zone:hover {
          background-color: #e2e8f0;
          border-color: #3182ce;
        }

        .drop-zone input[type="file"] {
          display: none;
        }

        .drop-zone span {
          display: block;
          color: #4a5568;
          font-size: 1rem;
          font-weight: 500;
        }

        .upload-form button,
        .preview-section button,
        .download-btn,
        #generateBtn {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          padding: 0.75rem 1.2rem;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          text-transform: capitalize;
        }

        .upload-form button:hover:not(:disabled),
        .preview-section button:hover:not(:disabled),
        .download-btn:hover {
          transform: scale(1.02);
          opacity: 0.95;
        }

        .upload-form button:disabled {
          background-color: #a0aec0 !important;
          cursor: not-allowed;
        }

        .preview-section,
        .download-section {
          background: #ffffff;
          padding: 2rem;
          margin-top: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .preview-section p {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.2px;
          color: #047857;
          background-color: #d1fae5;
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }

        .download-section p {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.2px;
          color: #1e40af;
          background-color: #e0e7ff;
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }

        /* Purple Gradient - PDF */
        .download-btn:nth-child(1) {
          background: linear-gradient(to right, #7e5bef, #5a3cc2);
        }

        .download-btn:nth-child(1):hover {
          background: linear-gradient(to right, #6b46c1, #4c2882);
        }

        /* Pink Gradient - CSV */
        .download-btn:nth-child(2) {
          background: linear-gradient(to right, #ed64a6, #d53f8c);
        }

        .download-btn:nth-child(2):hover {
          background: linear-gradient(to right, #d53f8c, #b83280);
        }

        @media (max-width: 768px) {
          .container.upload-layout {
            flex-direction: column;
            align-items: center;
            padding: 2rem 1rem;
          }

          .upload-illustration,
          .upload-form-block {
            max-width: 100%;
          }

          .upload-illustration img {
            max-width: 280px;
          }

          .download-section button {
            width: 100%;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Upload;
