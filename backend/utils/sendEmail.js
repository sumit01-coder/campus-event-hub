const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Determine the service. Assuming Gmail for .ac.in
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'amitpatel00784@gmail.com',
            pass: 'aeoehgyujzajwdtx' 
        }
    });

    const mailOptions = {
        from: 'CampusEventHub <amitpatel00784@gmail.com>',
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
