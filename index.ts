import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import type { Config } from './types';

const config: Config = {
  startId: 1,
  endId: 1000,
  prefix: 'Bookie-MU25-',
  padLength: 6,
  qrSize: 56.7, // 2cm
  columns: 8,
  rows: 10,
  margin: 20,
  textMargin: 3,
  fontSize: 6,
  outputFile: 'qr-codes.pdf',
  showGridLines: true,
  gridLineWidth: 0.5,
  gridLineColor: '#cccccc'
};

const generateQRCodePDF = async (): Promise<void> => {
  const doc = new PDFDocument({
    autoFirstPage: true,
    margin: config.margin
  });

  doc.pipe(fs.createWriteStream(config.outputFile));

  const pageWidth: number = doc.page.width - (config.margin * 2);
  const pageHeight: number = doc.page.height - (config.margin * 2);

  const colWidth: number = pageWidth / config.columns;
  const rowHeight: number = pageHeight / config.rows;

  const adjustedQrSize: number = Math.min(colWidth * 0.9, rowHeight * 0.8);

  let currentId: number = config.startId;
  let pageCount: number = 1;

  while (currentId <= config.endId) {
    const codesPerPage: number = config.columns * config.rows;
    const codesOnThisPage: number = Math.min(codesPerPage, config.endId - currentId + 1);

    console.log(`Generating page ${pageCount} with ${codesOnThisPage} QR codes...`);

    if (config.showGridLines) {
      doc.strokeColor(config.gridLineColor)
        .lineWidth(config.gridLineWidth);

      for (let i: number = 0; i <= config.columns; i++) {
        const xPos: number = config.margin + (i * colWidth);
        doc.moveTo(xPos, config.margin)
          .lineTo(xPos, config.margin + (config.rows * rowHeight))
          .dash(3, { space: 2 })
          .stroke();
      }

      for (let i: number = 0; i <= config.rows; i++) {
        const yPos: number = config.margin + (i * rowHeight);
        doc.moveTo(config.margin, yPos)
          .lineTo(config.margin + (config.columns * colWidth), yPos)
          .dash(3, { space: 2 })
          .stroke();
      }

      doc.undash();
    }

    for (let i: number = 0; i < codesOnThisPage; i++) {
      const rowIndex: number = Math.floor(i / config.columns);
      const colIndex: number = i % config.columns;

      const cellX: number = config.margin + (colIndex * colWidth);
      const cellY: number = config.margin + (rowIndex * rowHeight);

      const idString: string = String(currentId).padStart(config.padLength, '0');
      const fullId: string = `${config.prefix}${idString}`;

      try {
        const qrDataURL: string = await QRCode.toDataURL(fullId, {
          width: adjustedQrSize,
          margin: 1
        });

        const qrX: number = cellX + (colWidth - adjustedQrSize) / 2;
        const qrY: number = cellY + (rowHeight - adjustedQrSize - config.fontSize - config.textMargin) / 2;

        doc.image(qrDataURL, qrX, qrY, { width: adjustedQrSize });

        doc.font('Helvetica');
        doc.fontSize(config.fontSize);
        const textWidth: number = doc.widthOfString(fullId);
        const textX: number = cellX + (colWidth - textWidth) / 2;
        const textY: number = qrY + adjustedQrSize + config.textMargin;

        doc.text(fullId, textX, textY, {
          width: textWidth,
          align: 'center'
        });
      } catch (error) {
        console.error(`Error generating QR code for ${fullId}:`, error);
      }

      currentId++;
    }

    if (currentId <= config.endId) {
      doc.addPage();
      pageCount++;
    }
  }

  doc.end();
  console.log(`PDF generated successfully: ${config.outputFile}`);
};

generateQRCodePDF().catch((err: Error) => {
  console.error('Error generating PDF:', err);
});