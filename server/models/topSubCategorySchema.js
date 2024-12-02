import mongoose from 'mongoose';

// Define the TopServices schema
const topSubCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category.sub_categories' }]
});

// Create a model from the schema
const TopSubCategory = mongoose.model('TopSubCategory', topSubCategorySchema);

export default TopSubCategory;
