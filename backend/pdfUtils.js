const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Transaction = require('./models/Transaction');
const mongoose = require('mongoose');

// Extract transactions from PDF and save to DB using pdf2json
const extractTransactionsFromPDF = async (filePath, userId, uploadId) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text;
    console.log('Raw PDF text (first 1000 chars):', rawText.substring(0, 1000));
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    console.log('Total lines extracted from PDF:', lines.length);

    let transactions = [];

    // Convert userId to ObjectId if it's a string
    let userObjectId = null;
    if (userId && typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
      console.log('Converted userId to ObjectId:', userObjectId);
    } else {
      console.log('Using userId as is:', userId);
      userObjectId = userId;
    }

    // Skip header lines
    let headerPassed = false;
    let dateIndex = -1;
    let narrationIndex = -1;
    let withdrawalIndex = -1;
    let depositIndex = -1;
    let balanceIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log('Processing line:', line);

      // Check if this is the header line
      if (line.includes('Date') && line.includes('Narration') && line.includes('Balance')) {
        headerPassed = true;
        // Find column indices
        const headers = line.split(/\s+/);
        for (let j = 0; j < headers.length; j++) {
          if (headers[j] === 'Date') dateIndex = j;
          if (headers[j] === 'Narration') narrationIndex = j;
          if (headers[j] === 'Withdrawal') withdrawalIndex = j;
          if (headers[j] === 'Deposit') depositIndex = j;
          if (headers[j] === 'Balance') balanceIndex = j;
        }
        console.log('Found header with indices:', { dateIndex, narrationIndex, withdrawalIndex, depositIndex, balanceIndex });
        continue;
      }

      // Skip lines until we find the header
      if (!headerPassed) continue;

      // Try to parse transaction line
      // Format: DD-MM-YYYY Description Amount Balance
      const datePattern = /^(\d{2}-\d{2}-\d{4})/;
      const dateMatch = line.match(datePattern);

      if (dateMatch) {
        const dateStr = dateMatch[1];
        const [day, month, year] = dateStr.split('-');
        const date = new Date(`${year}-${month}-${day}`);

        // Split the line by spaces, but keep the date as one token
        const lineWithoutDate = line.substring(dateStr.length).trim();
        
        // Extract description - it's everything until we hit a number
        const descriptionEndIndex = lineWithoutDate.search(/\d+\.\d{2}/);
        if (descriptionEndIndex === -1) continue; // Skip if no amount found
        
        const description = lineWithoutDate.substring(0, descriptionEndIndex).trim();
        
        // Extract the remaining numbers
        const numbersText = lineWithoutDate.substring(descriptionEndIndex);
        const numbers = numbersText.match(/\d+\.\d{2}/g) || [];
        
        if (numbers.length < 2) continue; // Need at least amount and balance
        
        let withdrawal = null;
        let deposit = null;
        let balance = null;
        let type = null;
        
        if (numbers.length === 2) {
          // Format: date | description | amount | balance
          const amount = parseFloat(numbers[0]);
          balance = parseFloat(numbers[1]);
          
          // Determine if credit or debit based on description
          // Credit transactions: money coming INTO the account
          const isCredit = description.toLowerCase().includes('deposit') ||
                          description.toLowerCase().includes('salary') ||
                          description.toLowerCase().includes('transfer from') ||
                          description.toLowerCase().includes('refund') ||
                          description.toLowerCase().includes('credit') ||
                          description.toLowerCase().includes('cheque') ||
                          description.toLowerCase().includes('freelance') ||
                          description.toLowerCase().includes('cash');
          
          // Debit transactions: money going OUT of the account
          const isDebit = !isCredit && (
                         description.toLowerCase().includes('withdrawal') || 
                         description.toLowerCase().includes('payment') ||
                         description.toLowerCase().includes('purchase') ||
                         description.toLowerCase().includes('atm') ||
                         description.toLowerCase().includes('pos') ||
                         description.toLowerCase().includes('bill') ||
                         description.toLowerCase().includes('recharge') ||
                         (description.toLowerCase().includes('upi') && 
                          !description.toLowerCase().includes('refund')));
          
          
          if (isDebit) {
            withdrawal = amount;
            type = 'debit';
          } else if (isCredit) {
            deposit = amount;
            type = 'credit';
          } else {
            // If we can't determine, assume it's a debit
            withdrawal = amount;
            type = 'debit';
          }
        } else if (numbers.length >= 3) {
          // Format: date | description | withdrawal | deposit | balance
          withdrawal = parseFloat(numbers[0]);
          deposit = parseFloat(numbers[1]);
          balance = parseFloat(numbers[2]);
          
          // Create separate transactions for withdrawal and deposit if both exist
          if (withdrawal > 0) {
            type = 'debit';
          } else if (deposit > 0) {
            type = 'credit';
          }
        }
        
        // Create transaction object
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
    }

    console.log('Parsed transactions:', transactions);
    console.log('Number of transactions parsed:', transactions.length);

    if (transactions.length === 0) {
      console.warn('No transactions parsed from PDF. Check PDF format and parsing logic.');
    }

    return transactions;

  } catch (err) {
    throw new Error('PDF extraction error: ' + err.message);
  }
};

module.exports = { extractTransactionsFromPDF };
