import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Student', 'Staff', 'Visitor'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.Position || mongoose.model('Position', PositionSchema);