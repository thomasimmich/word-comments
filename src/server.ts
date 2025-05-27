import express, { RequestHandler } from 'express';
import type { Request, Response } from 'express';
import mammoth from 'mammoth';
import { Document, Paragraph, Packer, TextRun } from 'docx';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import TurndownService from 'turndown';

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const DOCUMENT_PATH = path.join(__dirname, '../documents/Interviewleitfaden_Disposition.docx');

// Configure Turndown with basic settings
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
});

// Endpoint to get the Word document as markdown
app.get('/document/markdown', async (req: Request, res: Response) => {
    try {
        const result = await mammoth.convertToHtml({ path: DOCUMENT_PATH });
        
        // Process the HTML to enhance structure
        const processedHtml = result.value
            .replace(/<p style="[^"]*Heading 1[^"]*">(.*?)<\/p>/gi, '<h1>$1</h1>')
            .replace(/<p style="[^"]*Heading 2[^"]*">(.*?)<\/p>/gi, '<h2>$1</h2>')
            .replace(/<p style="[^"]*Heading 3[^"]*">(.*?)<\/p>/gi, '<h3>$1</h3>')
            .replace(/<p style="[^"]*Quote[^"]*">(.*?)<\/p>/gi, '<blockquote>$1</blockquote>')
            .replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>')
            .replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>');
        
        const markdown = turndownService.turndown(processedHtml);
        res.json({ markdown });
    } catch (error) {
        console.error('Error converting document to markdown:', error);
        res.status(500).json({ error: 'Failed to convert document to markdown' });
    }
});

// Endpoint to add a comment to a specific section
app.get('/document/comment', (async (req: Request, res: Response): Promise<void> => {
    try {
        const { sectionId, comment } = req.query;
        
        if (!sectionId || !comment) {
            res.status(400).json({ error: 'sectionId and comment are required' });
            return;
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
        
        // Save the document
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(DOCUMENT_PATH, buffer);

        res.json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
}) as unknown as express.RequestHandler);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
}); 