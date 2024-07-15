import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", (errData) => {
    console.error(errData.parserError);
});
pdfParser.on("pdfParser_dataReady", (pdfData) => {
    const output = './parsed-text/Google-parsed-text.txt';
    fs.writeFile(output, pdfParser.getRawTextContent(), () => {
        console.log("Done.");
    });
});
pdfParser.loadPDF("./data/Google.pdf");