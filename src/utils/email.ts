import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'mohammedrafique23@gmail.com',
    pass: "cvmsmkfwiofrezxz",
  },
});

export const sendResetPasswordEmail = (email, resetUrl) => {
  const message = {
    from: 'mohammedrafique23@gmail.com',
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
