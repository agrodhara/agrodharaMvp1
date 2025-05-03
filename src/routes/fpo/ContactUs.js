const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/support/contact
router.post('/contact',
  
   async (req, res) => {

  try {
    const { name, phone, email, issueType, description } = req.body;

    if (!name || !phone || !email || !issueType || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'agrodhara1@gmail.com',
        pass: 'uzbv kdnj ywuh udfz'
      }
    });

    // HTML template for admin notification
    const adminHtmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Support Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background-color: #2e7d32; padding: 25px; text-align: center; color: white; }
        .content { padding: 25px; }
        .details { margin: 20px 0; border-left: 4px solid #4caf50; padding-left: 15px; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: bold; color: #2e7d32; }
        .footer { text-align: center; padding: 15px; background-color: #f1f8e9; color: #666; font-size: 12px; }
        @media only screen and (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content { padding: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>New Support Request</h2>
          <p>${issueType}</p>
        </div>
        <div class="content">
          <div class="details">
            <div class="detail-item"><span class="detail-label">Name:</span> ${name}</div>
            <div class="detail-item"><span class="detail-label">Phone:</span> ${phone}</div>
            <div class="detail-item"><span class="detail-label">Email:</span> ${email}</div>
            <div class="detail-item"><span class="detail-label">Issue Type:</span> ${issueType}</div>
          </div>
          <h3>Description:</h3>
          <p>${description.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="footer">
          <p>Please respond to this request within 24 hours.</p>
          <p>&copy; ${new Date().getFullYear()} Agrodhara Support Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // HTML template for user acknowledgment
    const userHtmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting Us</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background-color: #2e7d32; padding: 25px; text-align: center; color: white; }
        .content { padding: 25px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .details { margin: 20px 0; border-left: 4px solid #4caf50; padding-left: 15px; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: bold; color: #2e7d32; }
        .footer { text-align: center; padding: 15px; background-color: #f1f8e9; color: #666; font-size: 12px; }
        .action-btn { display: inline-block; background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
        @media only screen and (max-width: 600px) {
          .email-container { margin: 10px; }
          .header, .content { padding: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>Thank You for Contacting Us</h2>
          <p>We've received your request</p>
        </div>
        <div class="content">
          <div class="greeting">Hi ${name},</div>
          <p>Thank you for reaching out to Agrodhara Support. We've received your request and our team will get back to you shortly.</p>
          
          <div class="details">
            <h3>Your Request Details:</h3>
            <div class="detail-item"><span class="detail-label">Issue Type:</span> ${issueType}</div>
            <div class="detail-item"><span class="detail-label">Description:</span> ${description}</div>
          </div>
          
          <p>Your reference number for this request is: <strong>#${Math.floor(100000 + Math.random() * 900000)}</strong></p>
          <p>If you need immediate assistance, please call our support line at +91-XXXXXXXXXX.</p>
          
          <center>
            <a href="https://agrodhara.com/support" class="action-btn">Visit Support Center</a>
          </center>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Agrodhara. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Mail to Admin
    const adminMailOptions = {
      from: 'Agrodhara Support <agrodhara1@gmail.com>',
      to: 'agrodhara1@gmail.com',
      subject: `New Support Request: ${issueType}`,
      html: adminHtmlTemplate,
      text: `
        Name: ${name}
        Phone: ${phone}
        Email: ${email}
        Issue Type: ${issueType}
        Description: ${description}
      `
    };

    // Mail to User
    const userMailOptions = {
      from: 'Agrodhara Support <agrodhara1@gmail.com>',
      to: email,
      subject: 'Thank you for contacting Agrodhara Support',
      html: userHtmlTemplate,
      text: `Hi ${name},\n\nThanks for reaching out. We have received your request and will get back to you shortly.\n\nIssue Type: ${issueType}\nDescription: ${description}\n\nBest,\nAgrodhara Support Team`
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return res.json({ message: 'Support request sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;