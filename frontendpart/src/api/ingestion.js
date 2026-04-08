import { API_BASE_URL, getDefaultHeaders, getFileUploadHeaders } from './config.js';
import { uploadFile } from './upload.js';

export const uploadValidatedStatement = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/ingestion/upload`, {
      method: 'POST',
      headers: {
        ...getFileUploadHeaders(),
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Validated ingestion failed');
    }

    const result = await response.json();

    return {
      success: true,
      fileId: result.uploadId,
      ingestionJobId: result.jobId,
      validationSummary: result.data?.summary || null,
      preview: result.data?.preview || [],
      warnings: result.data?.warnings || [],
      message: result.message || 'Statement ingested successfully'
    };
  } catch (error) {
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
