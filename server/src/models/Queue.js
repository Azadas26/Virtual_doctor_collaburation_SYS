const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    currentAppointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    },
    waitingList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }],
    completedList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }],
    totalCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Queue', queueSchema);
