const nodemailer = require('nodemailer')
const PDFDocument = require('pdfkit')

async function sendPayslipEmail({ to, subject, payslip, employee }) {
  // Generate PDF as Buffer
  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument()
    const buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    doc.fontSize(20).text('Payslip', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Employee Name: ${employee.name}`)
    doc.text(`Employee ID: ${employee.employee_id}`)
    doc.text(`Period: ${payslip.period}`)
    doc.text(`Base Salary: ${payslip.base_salary}`)
    doc.text(`Total Deductions: ${payslip.total_deductions}`)
    doc.text(`Net Salary: ${payslip.net_salary}`)
    doc.end()
  })

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_ENCRYPTION === 'ssl',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject,
    text: `Dear ${employee.name},\n\nAttached is your payslip for period ${payslip.period}.`,
    attachments: [
      {
        filename: `Payslip-${payslip.period}.pdf`,
        content: pdfBuffer,
      },
    ],
  })
}

module.exports = { sendPayslipEmail }