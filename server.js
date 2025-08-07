const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Contact endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Setup transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your school email
            pass: process.env.EMAIL_PASS  // App password (not your normal email password!)
        }
    });

    // Email to school
    const mailToSchool = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: '📬 New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`, // Fallback for plain-text clients
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Logo -->
                <div style="text-align: center; padding: 20px;">
                    <img src="/images/Logo.jpg" alt="School Logo" style="max-width: 150px; height: auto;" />
                </div>

                <!-- Header -->
                <div style="background-color: #047331; color: white; padding: 16px 24px;">
                    <h2 style="margin: 0; font-size: 20px;">📬 New Contact Form Submission</h2>
                </div>

                <!-- Body -->
                <div style="padding: 24px;">
                    <p><strong>👤 Name:</strong> ${name}</p>
                    <p><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>💬 Message:</strong></p>
                    <div style="background: #f1f1f1; padding: 12px 16px; border-radius: 5px; font-style: italic;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                </div>

                <!-- Footer -->
                <div style="padding: 16px 24px; background-color: #f1f1f1; text-align: center; font-size: 12px; color: #666;">
                    This message was submitted via the website contact form.
                </div>
            </div>
        </div>
    `
    };

    // Auto-reply email to user (with HTML styling)
    const autoReplyToUser = {
        from: `"Thengisangaye Primary School" <${process.env.EMAIL_USER}>`,
        to: email,
        replyTo: process.env.EMAIL_USER,
        subject: 'Thank you for contacting Thengisangaye Primary School',
        text: `Dear ${name},

Thank you for reaching out to Thengisangaye Primary School. We have received your message and will get back to you shortly.

Here is a copy of your message:
"${message}"

Best regards,  
Thengisangaye Primary School`,

        html: `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f2f2f2;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-left: 8px solid #007B5E;
    }

    .header {
      background-color: #007B5E;
      color: #fff;
      padding: 15px;
      border-radius: 8px 8px 0 0;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }

    .content {
      padding: 20px 0;
      color: #333;
    }

    .message-title {
      font-weight: bold;
      font-size: 16px;
      margin-top: 20px;
    }

    .message-box {
      background-color: #fef7e0;
      border: 2px dashed #ffc107;
      padding: 15px;
      font-size: 15px;
      line-height: 1.5;
      margin-top: 10px;
      color: #444;
      white-space: pre-wrap;
    }

    .footer {
      margin-top: 30px;
      font-size: 14px;
      color: #777;
      text-align: center;
    }

    .school {
      font-weight: bold;
      color: #007B5E;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">📬 Message Received</div>

    <div class="content">
      <p>Dear <strong>${name}</strong>,</p>

      <p>Thank you for contacting <span class="school">Thengisangaye Primary School</span>. Your message has been successfully received. One of our team members will get back to you as soon as possible.</p>

      <p class="message-title">Here is a copy of your message:</p>

      <div class="message-box">
        ${message}
      </div>

      <p class="footer">
        Best regards,<br />
        <span class="school">Thengisangaye Primary School</span>
      </p>
    </div>
  </div>
</body>
</html>

        `
    };

    try {
        await transporter.sendMail(mailToSchool);
        await transporter.sendMail(autoReplyToUser);
        res.status(200).json({ message: '✅ Your message was sent, and we replied via email!' });
    } catch (error) {
        console.error('❌ Email sending error:', error);
        res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
});

// Test route
app.get('/', (req, res) => {
    res.send('📬 Contact form backend is running!');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
