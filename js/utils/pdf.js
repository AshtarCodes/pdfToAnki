const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { checkExists } = require("./fs-helpers.js");

async function splitPDF(filePath, outputDir) {
  try {
    // Read the PDF file
    const existingPdfBytes = await fsPromises.readFile(filePath);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the total number of pages
    const totalPages = pdfDoc.getPageCount();
    console.log(`Splitting PDF with ${totalPages} pages...`);
    const documents = [];
    // Split the PDF into individual pages
    for (let i = 0; i < totalPages; i++) {
      // Create a new PDF document for the current page
      const singlePagePdf = await PDFDocument.create();
      const [page] = await singlePagePdf.copyPages(pdfDoc, [i]);
      singlePagePdf.addPage(page);

      // Serialize the single-page PDF to bytes
      const pdfBytes = await singlePagePdf.save();

      const pageNum = i + 1;
      // Save the page to a file
      const subDirName = path.basename(filePath, ".pdf");
      const outputDirName = path.join(outputDir, subDirName);
      const outputFilePath = path.join(outputDirName, `page-${pageNum}.pdf`);

      if (!(await checkExists(outputDirName))) {
        await fsPromises.mkdir(outputDirName, { recursive: true });
      }

      //   fs.writeFile(outputFilePath, pdfBytes);
      fsPromises.writeFile(outputFilePath, pdfBytes).catch(console.error);

      console.log(`Saved: ${outputFilePath}`);

      const doc = {
        pdf: pdfBytes,
        pageNumber: pageNum,
        originalName: `${subDirName}`,
        pagePath: outputFilePath,
      };
      documents.push(doc);
    }

    console.log("PDF splitting complete.");
    return documents;
  } catch (error) {
    console.error("Error splitting PDF:", error);
  }
}

// Example usage
// const inputPdf = path.resolve("sandbox/input/gi-liver-pancreas.pdf");

// const inputPdf = path.resolve(
//   "sandbox/output/diabetes-critical-care/page-1.pdf"
// );

// const outputDir = path.resolve("sandbox/output"); // Replace with your desired output directory

// const docs = splitPDF(inputPdf, outputDir);

module.exports = {
  splitPDF,
};
