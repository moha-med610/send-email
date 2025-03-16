require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT 

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
});

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
})

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

app.post('/api/sendEmail', async (req, res) => {
    try{
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        let mailOptions = {
            from: email,
            to: process.env.EMAIL,
            subject: name,
            text: message
        };

        await transporter.sendMail(mailOptions)

        res.status(200).json({ message: 'Email sent successfully' });

    }catch(error){
        res.status(500).json({ error: 'Failed to send email' });
    }

})
app.listen(port, () => {
    console.log('Server running successfully');
})