const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" folder (your frontend)
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  verified: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});


app.post('/api/signup', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newUser = await User.create({ name, email });

    const verifyLink = `http://localhost:${process.env.PORT}/api/verify/${newUser._id}`;
    const message = `Hello ${name},\n\nPlease verify your email by clicking here: ${verifyLink}`;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Verify your email',
      text: message
    });

  res.redirect('https://archanamd12.github.io/VerifyMe/thank.html'); /
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).send('Server error');
  }
});

//  Email verification 
app.get('/api/verify/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { verified: true });
    res.send('✅ Email verified successfully!');
  } catch (err) {
    res.status(400).send(' Verification failed');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
