import fs from 'fs/promises';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser(this, 1);

// expect the pdf from database

const filePath = "./data/adidas.pdf";

console.log(filePath)

pdfParser.on("pdfParser_dataError", errData => {
  console.error(errData);
  process.exit(1);
});

pdfParser.on("pdfParser_dataReady", (pdfData) => {
  const fileName = filePath.split('/').pop().replace('.pdf', '');
  const text = pdfParser.getRawTextContent();
  fs.writeFile(`./parsed-text/${fileName}-parsed-text.txt`, text).then(() => {console.log("Done.")})
})

// can we get matadata too?

pdfParser.loadPDF(filePath);