const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin  = require('../middleware/requireLogin')
const User = require('../models/user');


const BookingSchema = new mongoose.Schema({
    studentName: String,
    rollno:String,
    courtNumber: Number,
    timeSlot: String,
    status: String,
    bookingDate: { type: Date, default: Date.now },
    bookingId:String,
  });
  
  const Booking = mongoose.model('Booking', BookingSchema);
  
  // API Endpoints
  router.get('/bookings',requireLogin, (req, res) => {
    Booking.find()
      .then((bookings) => res.json(bookings))
      .catch((err) => res.status(400).json({ error: err.message }));
  });
  
 
  router.post('/bookings', requireLogin, async (req, res) => {
    const { courtNumber, timeSlot, bookingId } = req.body;
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newBooking = new Booking({
        studentName: user.name,
        rollno: user.rollno,
        courtNumber,
        timeSlot,
        status: 'Pending',
        bookingDate: new Date(),
        bookingId,
        userEmail: user.email // Add the userEmail field to store the email ID
      });
  
      await newBooking.save();
      return res.json(newBooking);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });
  
  
  //get booking by bookingId
  router.get('/bookings/:bookId',requireLogin,async (req, res) => {
  
    console.log(req.params.bookId);
    let obj = await Booking.findOne({bookingId:req.params.bookId});
    console.log("object : "+obj);
  
    return res.send(obj);
  })
  
  
  router.put('/bookings/:id', requireLogin,(req, res) => {
    Booking.findByIdAndUpdate(req.params.id, { status: req.body.status })
      .then(() => res.json({ message: 'Booking updated!' }))
      .catch((err) => res.status(400).json({ error: err.message }));
  });
  
  router.delete('/bookings/:id',requireLogin, (req, res) => {
    Booking.findByIdAndDelete(req.params.id)
      .then(() => res.json({ message: 'Booking deleted!' }))
      .catch((err) => res.status(400).json({ error: err.message }));
  });



module.exports = router