const fs = require('fs');
const mongoose = require('mongoose');
const PDFJS = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');

const PASSWORD_RESPONSES = PDFJS.PasswordResponses || {};

class PdfPasswordRequiredError extends Error {
  constructor(message = 'This PDF is password-protected. Enter the statement password to continue.') {
    super(message);
    this.name = 'PdfPasswordRequiredError';
    this.code = 'PDF_PASSWORD_REQUIRED';
    this.statusCode = 409;
  }
}

class PdfIncorrectPasswordError extends Error {
  constructor(message = 'Incorrect PDF password. Please try again.') {
    super(message);
    this.name = 'PdfIncorrectPasswordError';
    this.code = 'INCORRECT_PDF_PASSWORD';
    this.statusCode = 400;
  }
}

const mapPasswordError = (error) => {
  if (!error || error.name !== 'PasswordException') {
    return null;
  }

  if (error.code === PASSWORD_RESPONSES.NEED_PASSWORD) {
    return new PdfPasswordRequiredError();
  }

  if (error.code === PASSWORD_RESPONSES.INCORRECT_PASSWORD) {
    return new PdfIncorrectPasswordError();
  }

  return null;
};

const renderPage = async (pageData) => {
  const textContent = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false
  });

  let lastY;
  let text = '';

  for (const item of textContent.items) {
    if (lastY === item.transform[5] || !lastY) {
      text += item.str;
    } else {
      text += `\n${item.str}`;
    }
    lastY = item.transform[5];
  }

  return text;
};

const extractTextFromPdf = async (filePath, password) => {
  PDFJS.disableWorker = true;

  const dataBuffer = fs.readFileSync(filePath);
  const loadingTask = PDFJS.getDocument({
    data: new Uint8Array(dataBuffer),
    password: password || undefined
  });

  try {
    const doc = await loadingTask.promise;
    let rawText = '';

    for (let pageIndex = 1; pageIndex <= doc.numPages; pageIndex += 1) {
      const pageData = await doc.getPage(pageIndex);
      const pageText = await renderPage(pageData);
      rawText = `${rawText}\n${pageText}`;
    }

    await doc.destroy();
    return rawText;
  } catch (error) {
    const mappedPasswordError = mapPasswordError(error);
    if (mappedPasswordError) {
      throw mappedPasswordError;
    }
    throw error;
  }
};

const extractTransactionsFromPDF = async (filePath, userId, uploadId, options = {}) => {
  try {
    const rawText = await extractTextFromPdf(filePath, options.password);
    const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const transactions = [];

    let userObjectId = userId;
    if (userId && typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    let headerPassed = false;

    for (const line of lines) {
      if (line.includes('Date') && line.includes('Narration') && line.includes('Balance')) {
        headerPassed = true;
        continue;
      }

      if (!headerPassed) continue;

      const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})/);
      if (!dateMatch) continue;

      const dateStr = dateMatch[1];
      const [day, month, year] = dateStr.split('-');
      const date = new Date(`${year}-${month}-${day}`);

      const lineWithoutDate = line.substring(dateStr.length).trim();
      const descriptionEndIndex = lineWithoutDate.search(/\d+\.\d{2}/);
      if (descriptionEndIndex === -1) continue;

      const description = lineWithoutDate.substring(0, descriptionEndIndex).trim();
      const numbersText = lineWithoutDate.substring(descriptionEndIndex);
      const numbers = numbersText.match(/\d+\.\d{2}/g) || [];

      if (numbers.length < 2) continue;

      let withdrawal = null;
      let deposit = null;
      let balance = null;
      let type = null;

      if (numbers.length === 2) {
        const amount = Number.parseFloat(numbers[0]);
        balance = Number.parseFloat(numbers[1]);

        const lowerDescription = description.toLowerCase();
        const isCredit = lowerDescription.includes('deposit') ||
          lowerDescription.includes('salary') ||
          lowerDescription.includes('transfer from') ||
          lowerDescription.includes('refund') ||
          lowerDescription.includes('credit') ||
          lowerDescription.includes('cheque') ||
          lowerDescription.includes('freelance') ||
          lowerDescription.includes('cash');

        const isDebit = !isCredit && (
          lowerDescription.includes('withdrawal') ||
          lowerDescription.includes('payment') ||
          lowerDescription.includes('purchase') ||
          lowerDescription.includes('atm') ||
          lowerDescription.includes('pos') ||
          lowerDescription.includes('bill') ||
          lowerDescription.includes('recharge') ||
          (lowerDescription.includes('upi') && !lowerDescription.includes('refund'))
        );

        if (isDebit) {
          withdrawal = amount;
          type = 'debit';
        } else if (isCredit) {
          deposit = amount;
          type = 'credit';
        } else {
          withdrawal = amount;
          type = 'debit';
        }
      } else {
        withdrawal = Number.parseFloat(numbers[0]);
        deposit = Number.parseFloat(numbers[1]);
        balance = Number.parseFloat(numbers[2]);

        if (withdrawal > 0) {
          type = 'debit';
        } else if (deposit > 0) {
          type = 'credit';
        }
      }

      if (type === 'debit' && withdrawal > 0) {
        transactions.push({
          user: userObjectId,
          uploadId,
          date,
          description,
          amount: withdrawal,
          type: 'debit',
          balance
        });
      } else if (type === 'credit' && deposit > 0) {
        transactions.push({
          user: userObjectId,
          uploadId,
          date,
          description,
          amount: deposit,
          type: 'credit',
          balance
        });
      }
    }

    return transactions;
  } catch (error) {
    if (error.code === 'PDF_PASSWORD_REQUIRED' || error.code === 'INCORRECT_PDF_PASSWORD') {
      throw error;
    }

    throw new Error('PDF extraction failed. Please check the file and try again.');
  }
};

module.exports = {
  extractTransactionsFromPDF,
  PdfPasswordRequiredError,
  PdfIncorrectPasswordError
};
