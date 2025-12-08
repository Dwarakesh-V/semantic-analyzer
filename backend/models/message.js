import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot', 'image'], required: true },
  text: { type: String },
  src: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
