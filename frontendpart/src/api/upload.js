import { API_BASE_URL, API_ENDPOINTS, getFileUploadHeaders, getDefaultHeaders } from './config.js';

// Upload file to backend
export const uploadFile = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', file.type);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_FILE}`, {
      method: 'POST',
      headers: {
        ...getFileUploadHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      fileId: result.uploadId || result.fileId,
      message: result.message || 'File uploaded successfully'
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to upload file'
    };
  }
};

// Process uploaded file for analysis
export const processFile = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROCESS_FILE}`, {
      method: 'POST',
      headers: {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Processing failed');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      processingId: result.processingId,
      message: result.message || 'File processing started'
    };
  } catch (error) {
    console.error('Processing error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to process file'
    };
  }
};

// Get upload/processing status
export const getUploadStatus = async (fileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_UPLOAD_STATUS}/${fileId}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get status');
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      status: result.status, // 'uploading', 'processing', 'completed', 'failed'
      progress: result.progress || 0,
      message: result.message
    };
  } catch (error) {
    console.error('Status check error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to check status'
    };
  }
};

// Generate financial report
export const generateReport = async (fileId, reportType = 'comprehensive') => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERATE_REPORT}`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ 
        fileId, // use fileId as expected by backend
        reportType,
        includeCharts: true,
        includeRecommendations: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Report generation failed');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.report, // use result.report as the report data
      reportId: result.reportId,
      downloadUrls: result.downloadUrls,
      message: result.message || 'Report generated successfully'
    };
  } catch (error) {
    console.error('Report generation error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate report'
    };
  }
};

// Download report
export const downloadReport = async (reportId, format = 'pdf') => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_REPORT}/${reportId}/${format}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Download failed');
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial_report_${reportId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Report downloaded successfully'
    };
  } catch (error) {
    console.error('Download error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to download report'
    };
  }
};

// Get user's reports list
export const getReportsList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_REPORTS}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reports');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.reports,
      total: result.total,
      message: 'Reports fetched successfully'
    };
  } catch (error) {
    console.error('Reports fetch error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch reports'
    };
  }
};

// Validate file before upload
export const validateFile = (file, maxSizeMB = 5) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only PDF, DOC, DOCX, CSV, XLS, and XLSX are allowed' };
  }

  return { valid: true };
};
