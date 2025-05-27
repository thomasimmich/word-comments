import { Handler } from '@netlify/functions';
import { Document, Paragraph, Packer, TextRun } from 'docx';
import fs from 'fs';
import path from 'path';

export const handler: Handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method not allowed. Use GET.' })
            };
        }

        const { sectionId, comment } = event.queryStringParameters || {};
        
        if (!sectionId || !comment) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'sectionId and comment are required' })
            };
        }

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

        // Create a new document with the comment
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Comment: ${comment}` })
                        ]
                    })
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(DOCUMENT_PATH, buffer);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Comment added successfully' })
        };
    } catch (error) {
        console.error('Error adding comment:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to add comment',
                message: 'The serverless function cannot access the local file system. Please use a cloud storage solution.'
            })
        };
    }
}; 