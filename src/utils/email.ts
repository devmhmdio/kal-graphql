import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.RESET_FROM_EMAIL,
    pass: process.env.RESET_FROM_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});

export const sendResetPasswordEmail = (email, resetUrl) => {
  const message = {
    // from: 'mohammedrafique23@gmail.com',
    from: 'support@traifecta.com',
    to: email,
    subject: "Reset Password",
    html: `
      <p>To reset your password, click the following link:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
