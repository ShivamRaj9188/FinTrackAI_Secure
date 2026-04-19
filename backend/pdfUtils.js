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
    disableCombineTextItems: false
  });

  // 1. Sort safely by strict Y-axis top-to-bottom.
  const ySortedItems = textContent.items.slice().sort((a, b) => b.transform[5] - a.transform[5]);

  // 2. Group into clean horizontal rows based on 10-point tolerance (accounts for font baseline shifts).
  const rows = [];
  let currentRow = [];
  let rowAnchorY = null;

  for (const item of ySortedItems) {
    if (!item.str.trim()) continue;
    
    // Y-axis inversion since PDF coordinates start bottom-left
    const currentY = item.transform[5];
    
    if (rowAnchorY === null || Math.abs(rowAnchorY - currentY) < 10) {
      currentRow.push(item);
      if (rowAnchorY === null) rowAnchorY = currentY;
    } else {
      rows.push(currentRow);
      currentRow = [item];
      rowAnchorY = currentY;
    }
  }
  if (currentRow.length) rows.push(currentRow);

  // 3. Sort each row horizontally by strict X-axis, then condense into strings
  let text = '';
  for (const row of rows) {
    row.sort((a, b) => a.transform[4] - b.transform[4]); // Sort strictly left-to-right
    text += row.map((item) => item.str.trim()).join(' ') + '\n';
  }

  return text.replace(/ +/g, ' ').trim();
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
    let previousBalance = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('Date') && (line.includes('Narration') || line.includes('Description') || line.includes('Particulars')) && line.includes('Balance')) {
        headerPassed = true;
        continue;
      }

      // Sometimes Opening Balance appears
      if (line.toLowerCase().includes('opening balance')) {
        const obMatch = line.match(/[\d,]+\.\d{2}/g);
        if (obMatch && obMatch.length > 0) {
          previousBalance = Number.parseFloat(obMatch[obMatch.length - 1].replace(/,/g, ''));
        }
        continue;
      }

      const dateMatch = line.match(/^(?:\d+\.?\s+|-\s+)?(\d{2}[-\s/]*[a-zA-Z]{3}[-\s/]*\d{2,4}|\d{2}[-\s/]*\d{2}[-\s/]*\d{2,4})/);
      
      if (dateMatch && !headerPassed) {
        headerPassed = true;
      }

      if (!headerPassed) continue;
      if (!dateMatch) continue;

      const dateStr = dateMatch[1];
      
      // Inject spaces if missing to ensure JS Date can parse condensed strings natively
      const normalizedDateStr = dateStr.replace(/^(\d{2})[-\s/]*([a-zA-Z]{3})[-\s/]*(\d{2,4})$/i, '$1 $2 $3')
                                       .replace(/^(\d{2})[-\s/]*(\d{2})[-\s/]*(\d{2,4})$/, '$1/$2/$3');

      let date = new Date(normalizedDateStr);
      
      const ddmmyy = normalizedDateStr.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
      if (ddmmyy) {
        let [, day, month, year] = ddmmyy;
        if (year.length === 2) year = `20${year}`;
        date = new Date(`${year}-${month}-${day}`);
      }

      if (Number.isNaN(date.getTime())) continue;

      const lineWithoutDate = line.substring(dateMatch[0].length).trim();
      let descriptionEndIndex = lineWithoutDate.search(/[\d,]+\.\d{2}/);
      
      let description = "";
      let numbersText = "";

      if (descriptionEndIndex !== -1) {
        description = lineWithoutDate.substring(0, descriptionEndIndex).trim();
        numbersText = lineWithoutDate.substring(descriptionEndIndex);
      } else {
        description = lineWithoutDate;
        let lookaheadIndex = i;
        
        while (lookaheadIndex + 1 < lines.length && lookaheadIndex - i < 4) {
          lookaheadIndex++;
          const nextLine = lines[lookaheadIndex];
          
          if (nextLine.match(/^(?:\d+\.?\s+|-\s+)?(\d{2}[-\s/]*[a-zA-Z]{3}[-\s/]*\d{2,4}|\d{2}[-\s/]*\d{2}[-\s/]*\d{2,4})/)) {
            break; // Stop if we hit a new transaction row
          }
          
          const nextDescEndIndex = nextLine.search(/[\d,]+\.\d{2}/);
          if (nextDescEndIndex !== -1) {
            description += " " + nextLine.substring(0, nextDescEndIndex).trim();
            numbersText = nextLine.substring(nextDescEndIndex);
            break;
          } else {
            description += " " + nextLine.trim();
          }
        }
      }

      if (!numbersText) continue;

      const rawNumbers = numbersText.match(/[\d,]+\.\d{2}/g) || [];
      const numbers = rawNumbers.map(n => Number.parseFloat(n.replace(/,/g, '')));

      if (numbers.length < 2) continue;

      let withdrawal = null;
      let deposit = null;
      let balance = null;
      let type = null;

      if (numbers.length === 2) {
        const amount = numbers[0];
        balance = numbers[1];

        // Infer credit/debit from running balance
        if (previousBalance !== null) {
          const diffCredit = (previousBalance + amount).toFixed(2);
          const diffDebit = (previousBalance - amount).toFixed(2);
          
          if (balance.toFixed(2) === diffCredit) {
            type = 'credit';
            deposit = amount;
          } else if (balance.toFixed(2) === diffDebit) {
            type = 'debit';
            withdrawal = amount;
          }
        }

        if (!type) {
          const lowerDescription = description.toLowerCase();
          const isCredit = lowerDescription.includes('deposit') ||
            lowerDescription.includes('salary') ||
            lowerDescription.includes('refund') ||
            lowerDescription.includes('credit');

          const isDebit = !isCredit && (
            lowerDescription.includes('withdrawal') ||
            lowerDescription.includes('payment') ||
            lowerDescription.includes('purchase') ||
            lowerDescription.includes('atm') ||
            lowerDescription.includes('upi') ||
            lowerDescription.includes('bill')
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
        }
      } else {
        withdrawal = numbers[0];
        deposit = numbers[1];
        balance = numbers[numbers.length - 1];

        if (withdrawal > 0) {
          type = 'debit';
        } else if (deposit > 0) {
          type = 'credit';
        }
      }

      previousBalance = balance;

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
