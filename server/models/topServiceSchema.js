import mongoose from 'mongoose';

// Define the TopServices schema
const topServiceSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] // Reference to the Category model
});

// Create a model from the schema
const TopService = mongoose.model('TopService', topServiceSchema);

export default TopService;
