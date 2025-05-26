import { Handler } from '@netlify/functions';
import { Document, Paragraph, Comment, Packer, TextRun } from 'docx';
import fs from 'fs';
import path from 'path';

export const handler: Handler = async (event, context) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        const { sectionId, comment } = JSON.parse(event.body);
        
        if (!sectionId || !comment) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'sectionId and comment are required' })
            };
        }

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: comment }),
                            new Comment({
                                id: Date.now(),
                                author: 'User',
                                children: [new TextRun({ text: comment }) as any],
                                date: new Date()
                            })
                        ]
                    })
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        const DOCUMENT_PATH = path.join(process.cwd(), 'documents/Interviewleitfaden_Disposition.docx');
        fs.writeFileSync(DOCUMENT_PATH, buffer);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Comment added successfully' })
        };
    } catch (error) {
        console.error('Error adding comment:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to add comment' })
        };
    }
}; 