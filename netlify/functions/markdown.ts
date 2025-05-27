import { Handler } from '@netlify/functions';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs';

export const handler: Handler = async (event, context) => {
    try {
        const DOCUMENT_PATH = path.join(process.cwd(), 'documents/Interviewleitfaden_Disposition.docx');
        
        // Check if file exists
        if (!fs.existsSync(DOCUMENT_PATH)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ 
                    error: 'Document not found',
                    message: 'The Word document is not available in the serverless environment. Please upload the document to a cloud storage service like AWS S3 or Netlify Storage.'
                })
            };
        }

        const result = await mammoth.convertToHtml({ path: DOCUMENT_PATH });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ markdown: result.value })
        };
    } catch (error) {
        console.error('Error converting document to markdown:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to convert document to markdown',
                message: 'The serverless function cannot access the local file system. Please use a cloud storage solution.'
            })
        };
    }
}; 