import { API_BASE_URL, getDefaultHeaders, getFileUploadHeaders } from './config.js';
import { uploadFile } from './upload.js';

const mapIngestionResponse = (result) => ({
  success: true,
  fileId: result.uploadId,
  ingestionJobId: result.jobId,
  validationSummary: result.data?.summary || null,
  preview: result.data?.preview || [],
  warnings: result.data?.warnings || [],
  message: result.message || 'Statement ingested successfully'
});

const mapPasswordChallenge = (result) => ({
  success: false,
  requiresPassword: true,
  code: result.code || 'PDF_PASSWORD_REQUIRED',
  message: result.message || 'This PDF is password-protected. Enter the statement password to continue.',
  fileId: result.uploadId,
  ingestionJobId: result.jobId,
  remainingAttempts: result.remainingAttempts,
  validationSummary: result.data?.summary || null,
  preview: result.data?.preview || [],
  warnings: result.data?.warnings || []
});

export const uploadValidatedStatement = async (file, password = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (password) {
    formData.append('password', password);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ingestion/upload`, {
      method: 'POST',
      headers: {
        ...getFileUploadHeaders(),
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        planLimit: true,
        message: errorData.message || 'Upload limit reached',
        currentPlan: errorData.currentPlan,
        upgradeRequired: true
      };
    }

    const result = await response.json().catch(() => ({}));

    if (response.status === 409 && result.requiresPassword) {
      return mapPasswordChallenge(result);
    }

    if (!response.ok) {
      return {
        success: false,
        code: result.code,
        message: result.message || 'Validated ingestion failed'
      };
    }

    return mapIngestionResponse(result);
  } catch {
    const fallback = await uploadFile(file);
    return {
      ...fallback,
      fallbackUsed: true,
      validationSummary: null,
      preview: [],
      warnings: []
    };
  }
};

export const submitStatementPassword = async (jobId, password) => {
  const response = await fetch(`${API_BASE_URL}/ingestion/${jobId}/password`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ password })
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 409 && result.requiresPassword) {
    return mapPasswordChallenge(result);
  }

  if (!response.ok) {
    return {
      success: false,
      code: result.code,
      message: result.message || 'Failed to unlock statement'
    };
  }

  return mapIngestionResponse(result);
};

export const getIngestionStatus = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/ingestion/${jobId}`, {
    method: 'GET',
    headers: getDefaultHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ingestion status');
  }

  return response.json();
};
