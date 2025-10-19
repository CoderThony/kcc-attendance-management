import mongoose from 'mongoose';

const CheckInRecordSchema = new mongoose.Schema({
  userIdNumber: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
    enum: ['Student', 'Staff', 'Visitor'],
  },
  fullName: {
    type: String,
    required: false,
  },
  purpose: {
    type: String,
    required: function(this: any) {
      return this.position === 'Student' || this.position === 'Visitor';
    },
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
    required: false,
  },
  location: {
    type: String,
    default: 'Main Entrance',
  },
}, {
  timestamps: true,
});

export default mongoose.models.CheckInRecord || mongoose.model('CheckInRecord', CheckInRecordSchema);