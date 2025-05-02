import pdfParse from 'pdf-parse';
import { Buffer } from 'buffer';

/**
 * Extracts text from a PDF file
 * @param pdfFile - The PDF file to extract text from
 * @returns Promise that resolves with the extracted text
 * @throws Error if text extraction fails
 */
export async function extractTextFromPdf(pdfFile: File): Promise<string> {
  try {
    // Read the file as array buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Convert array buffer to Buffer which pdfParse expects
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse the PDF and extract text
    const pdf = await pdfParse(buffer);
    
    return pdf.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}