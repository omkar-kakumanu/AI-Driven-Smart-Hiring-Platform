import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as Data URL'));
    reader.readAsDataURL(file);
  });
};

export const extractDocumentText = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      const pageTextBlocks: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        let lastY: number | null = null;
        const pageLines: string[] = [];
        let currentLine = '';

        for (const rawItem of content.items) {
          const item = rawItem as any;
          if (!item || typeof item.str !== 'string') continue;
          const textStr = item.str;
          const y = item.transform ? Math.round(item.transform[5]) : null;

          if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = textStr;
          } else {
            currentLine += (currentLine && !currentLine.endsWith(' ') && !textStr.startsWith(' ') ? ' ' : '') + textStr;
          }

          if (y !== null) lastY = y;

          if (item.hasEOL) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = '';
            lastY = null;
          }
        }

        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }

        pageTextBlocks.push(pageLines.join('\n'));
      }

      const combined = pageTextBlocks.join('\n');
      if (combined.trim().length > 20) {
        return combined;
      }
    } catch (err) {
      console.warn('PDF text extraction error:', err);
    }
  }

  if (ext === 'docx' || ext === 'doc') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const rawText = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      
      const paragraphMatches = rawText.match(/<w:p[^>]*>.*?<\/w:p>/gi);
      if (paragraphMatches && paragraphMatches.length > 0) {
        const lines = paragraphMatches.map(p => {
          const textMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
          if (!textMatches) return '';
          return textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
        }).filter(l => l.trim().length > 0);

        if (lines.length > 0) {
          return lines.join('\n');
        }
      }

      const matches = rawText.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
      if (matches && matches.length > 0) {
        return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
      }
    } catch (e) {
      console.warn('DOCX extraction fallback', e);
    }
  }

  try {
    return await file.text();
  } catch {
    return '';
  }
};
