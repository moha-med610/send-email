require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Contact = mongoose.model("Contact", contactSchema);

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

app.post("/api/sendEmail", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await Contact.create({ name, email, message });

    let mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f2f3f5; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 30px;">
        <h2 style="display: flex; align-items: center; font-size: 24px; color: #2c3e50; margin-bottom: 30px;">
          Contact Form Submission
        </h2>

        <table style="width: 100%; font-size: 16px; color: #34495e;">
          <tr>
            <td style="font-weight: 600; padding: 8px 0;">Name</td>
            <td style="padding: 8px 0;">${name}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; padding: 8px 0;">Email</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="font-weight: 600; padding: 12px 0; vertical-align: top;">Message</td>
            <td style="padding: 12px 0; background: #f8f9fa; border-radius: 8px; color: #2d3436;">
              <div style="white-space: pre-line; padding: 10px 15px;">${message}</div>
            </td>
          </tr>
        </table>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">

        <div style="text-align: center; font-size: 13px; color: #888;">
          This message was sent from your website’s contact form.
        </div>
      </div>
    </div>
    `,
    };

    transporter.sendMail(mailOptions).catch(err => console.log("Error sending email:", err));

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(port, () => {
  console.log("Server running successfully");
});
