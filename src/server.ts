import express, { RequestHandler } from 'express';
import type { Request, Response } from 'express';
import mammoth from 'mammoth';
import { Document, Paragraph, Comment, Packer, TextRun } from 'docx';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

const DOCUMENT_PATH = path.join(__dirname, '../documents/Interviewleitfaden_Disposition.docx');

// Endpoint to get the Word document as markdown
app.get('/document/markdown', async (req: Request, res: Response) => {
    try {
        const result = await mammoth.convertToHtml({ path: DOCUMENT_PATH });
        res.json({ markdown: result.value });
    } catch (error) {
        console.error('Error converting document to markdown:', error);
        res.status(500).json({ error: 'Failed to convert document to markdown' });
    }
});

// Endpoint to add a comment to a specific section
app.post('/document/comment', (async (req: Request, res: Response): Promise<void> => {
    try {
        const { sectionId, comment } = req.body;
        
        if (!sectionId || !comment) {
            res.status(400).json({ error: 'sectionId and comment are required' });
            return;
        }

        // Read the existing document
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
        
        // Save the modified document
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(DOCUMENT_PATH, buffer);

        res.json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
}) as unknown as express.RequestHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 