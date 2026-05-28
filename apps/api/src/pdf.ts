import PDFDocument from "pdfkit";
import type { QuestionPaper } from "@vedaai/shared";

export function renderPdf(paper: QuestionPaper) {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  doc.font("Helvetica-Bold").fontSize(17).text(paper.schoolName, { align: "center" });
  doc.fontSize(12).text(`Subject: ${paper.subject}`, { align: "center" });
  doc.text(`Class: ${paper.className}`, { align: "center" });
  doc.moveDown();
  doc.font("Helvetica").fontSize(10).text(`Time Allowed: ${paper.timeAllowedMinutes} minutes`);
  doc.text(`Maximum Marks: ${paper.maximumMarks}`, { align: "right" });
  doc.moveDown();
  doc.font("Helvetica-Bold").text("All questions are compulsory unless stated otherwise.");
  doc.moveDown();
  doc.font("Helvetica").text("Name: __________________________");
  doc.text("Roll Number: ____________________");
  doc.text("Section: ________________________");
  doc.moveDown();

  for (const section of paper.sections) {
    doc.font("Helvetica-Bold").fontSize(13).text(section.title, { align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(11).text(section.type);
    doc.font("Helvetica-Oblique").fontSize(10).text(section.instruction);
    doc.moveDown(0.5);
    section.questions.forEach((question, index) => {
      doc.font("Helvetica").fontSize(10).text(`${index + 1}. [${question.difficulty}] ${question.text} [${question.marks} Marks]`, {
        continued: false
      });
      doc.moveDown(0.35);
    });
    doc.moveDown();
  }

  doc.font("Helvetica-Bold").fontSize(11).text("End of Question Paper");
  doc.moveDown();
  doc.text("Answer Key:");
  let number = 1;
  for (const section of paper.sections) {
    for (const question of section.questions) {
      doc.font("Helvetica").fontSize(9).text(`${number++}. ${question.answer}`);
      doc.moveDown(0.25);
    }
  }

  doc.end();
  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
