const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a reusable transporter using default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email', // Add real credentials in .env
        pass: process.env.SMTP_PASS || 'pass123'
    }
});

// Generic send email function
const sendEmail = async ({ to, subject, html, attachments }) => {
    try {
        const info = await transporter.sendMail({
            from: `"CampusEventHub" <${process.env.SMTP_USER || 'noreply@campuseventhub.com'}>`,
            to,
            subject,
            html,
            attachments
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
             console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};

const sendTicketEmail = async (userEmail, userName, eventTitle, ticketId, qrCodeDataUrl, icsAttachment = null) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <div style="background-color: #4f46e5; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
                <h2>Your Ticket for ${eventTitle}</h2>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
                <p style="font-size: 16px; color: #374151;">Thank you for registering! Here is your digital ticket. Please present the QR code below at the event entrance.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <img src="${qrCodeDataUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 4px solid #f3f4f6; border-radius: 8px; padding: 10px; background: white;" />
                    <p style="font-family: monospace; font-size: 18px; font-weight: bold; margin-top: 10px; color: #111827;">TICKET ID: ${ticketId}</p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 20px;">
                    Having trouble viewing this? You can always access your ticket in the CampusEventHub app.
                </p>
            </div>
        </div>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Your Ticket: ${eventTitle}`,
        html,
        attachments: icsAttachment ? [
            {
                filename: 'event.ics',
                content: icsAttachment,
                contentType: 'text/calendar'
            }
        ] : []
    });
};

const sendBroadcastEmail = async (userEmail, eventTitle, message) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <div style="border-left: 4px solid #4f46e5; padding-left: 20px;">
                <h3 style="color: #4f46e5; margin-bottom: 5px;">Announcement: ${eventTitle}</h3>
                <p style="font-size: 16px; color: #374151; line-height: 1.5;">${message}</p>
            </div>
        </div>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Update: ${eventTitle}`,
        html
    });
};

const sendReminderEmail = async (userEmail, userName, event) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h2>Event Reminder: ${event.title}</h2>
            <p>Hi ${userName},</p>
            <p>This is a quick reminder that <strong>${event.title}</strong> is happening tomorrow!</p>
            <ul>
                <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${event.time}</li>
                <li><strong>Venue:</strong> ${event.venue}</li>
            </ul>
            <p>Don't forget to have your QR ticket ready for check-in.</p>
        </div>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Reminder: ${event.title} is tomorrow!`,
        html
    });
};

module.exports = {
    sendEmail,
    sendTicketEmail,
    sendBroadcastEmail,
    sendReminderEmail
};
