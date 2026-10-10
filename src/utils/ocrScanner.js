import { createWorker } from 'tesseract.js';

/**
 * Optical Character Recognition (OCR) Helper for FridgeWise AI.
 * Extracts raw text from food packaging/receipt labels, extracts dates and possible names,
 * and allows the user to review and confirm all fields.
 * Never invents a date if none is found.
 */

const MONTH_NAMES = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/**
 * Scans an image file using Tesseract OCR and parses recognizable dates and labels.
 * @param {File|Blob|string} imageSource
 * @param {Function} [onProgress]
 * @returns {Promise<{
 *   success: boolean,
 *   rawText: string,
 *   extractedName: string|null,
 *   extractedDate: string|null,
 *   extractedDateType: string,
 *   confidence: number,
 *   notes: string
 * }>}
 */
export async function scanFoodLabel(imageSource, onProgress = null) {
  let worker = null;
  try {
    worker = await createWorker('eng');

    const ret = await worker.recognize(imageSource);
    const text = ret.data.text || '';
    const confidence = ret.data.confidence || 0;

    await worker.terminate();

    // Parse date patterns
    const parsed = extractDateAndDetails(text);

    return {
      success: true,
      rawText: text.trim(),
      extractedName: parsed.name,
      extractedDate: parsed.date,
      extractedDateType: parsed.dateType,
      confidence: Math.round(confidence),
      notes: parsed.notes
    };
  } catch (error) {
    if (worker) {
      try { await worker.terminate(); } catch (_) {}
    }
    console.warn('OCR scanning failed or timed out:', error);
    return {
      success: false,
      rawText: '',
      extractedName: null,
      extractedDate: null,
      extractedDateType: 'best-before',
      confidence: 0,
      notes: 'Could not extract text from this image. Please enter details manually.'
    };
  }
}

/**
 * Parses raw OCR text to find dates and date labels.
 * @param {string} text
 * @returns {{ name: string|null, date: string|null, dateType: string, notes: string }}
 */
export function extractDateAndDetails(text = '') {
  const clean = text.replace(/\r\n/g, '\n');
  const lower = clean.toLowerCase();

  let detectedType = 'best-before';
  if (lower.includes('use by') || lower.includes('use-by')) {
    detectedType = 'use-by';
  } else if (lower.includes('expiry') || lower.includes('exp date') || lower.includes('exp.') || lower.includes('exp:')) {
    detectedType = 'expiry';
  } else if (lower.includes('best before') || lower.includes('bb:')) {
    detectedType = 'best-before';
  }

  // Look for date patterns:
  // 1. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  // 2. YYYY-MM-DD
  // 3. DD MMM YYYY (e.g. 15 Oct 2026)
  let foundDate = null;
  let notes = '';

  // Pattern: YYYY-MM-DD
  const isoMatch = clean.match(/\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    foundDate = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }

  // Pattern: DD/MM/YYYY or DD-MM-YYYY
  if (!foundDate) {
    const dmyMatch = clean.match(/\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2}|\d{2})\b/);
    if (dmyMatch) {
      let year = dmyMatch[3];
      if (year.length === 2) year = `20${year}`;
      const month = dmyMatch[2].padStart(2, '0');
      const day = dmyMatch[1].padStart(2, '0');
      foundDate = `${year}-${month}-${day}`;
    }
  }

  // Pattern: DD MMM YYYY (e.g. 15 Oct 2026)
  if (!foundDate) {
    const wordMonthMatch = clean.match(/\b(0[1-9]|[12]\d|3[01])\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20\d{2})\b/i);
    if (wordMonthMatch) {
      const day = wordMonthMatch[1].padStart(2, '0');
      const monthStr = wordMonthMatch[2].toLowerCase().substring(0, 3);
      const monthNum = String(MONTH_NAMES[monthStr] + 1).padStart(2, '0');
      const year = wordMonthMatch[3];
      foundDate = `${year}-${monthNum}-${day}`;
    }
  }

  // Heuristic for name: pick first non-empty line that isn't purely numbers or date words
  const lines = clean.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && !l.match(/^(use by|best before|mfg|exp|net wt|mrp|pkg|batch)/i));

  let extractedName = null;
  if (lines.length > 0) {
    // Take candidate line
    const candidate = lines[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (candidate.length > 2 && candidate.length < 40) {
      extractedName = candidate;
    }
  }

  if (foundDate) {
    notes = `Detected date: ${foundDate} (${detectedType}). Please verify with your package.`;
  } else {
    notes = 'No clear date stamp recognized. Please select a date manually.';
  }

  return {
    name: extractedName,
    date: foundDate,
    dateType: detectedType,
    notes
  };
}
