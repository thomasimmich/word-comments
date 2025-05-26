import { Handler } from '@netlify/functions';
import mammoth from 'mammoth';
import path from 'path';

export const handler: Handler = async (event, context) => {
    try {
        const DOCUMENT_PATH = path.join(process.cwd(), 'documents/Interviewleitfaden_Disposition.docx');
        const result = await mammoth.convertToHtml({ path: DOCUMENT_PATH });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ markdown: result.value })
        };
    } catch (error) {
        console.error('Error converting document to markdown:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to convert document to markdown' })
        };
    }
}; 