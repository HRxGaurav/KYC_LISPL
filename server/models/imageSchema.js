import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  image: { type: String, required: true },
  alt: { type: String }
});

export default mongoose.model('Image', imageSchema);