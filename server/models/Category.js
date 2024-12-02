import mongoose from 'mongoose';
import Image from './imageSchema.js';

const serviceSchema = new mongoose.Schema({
  url_params: String,
  meta_title: String,
  meta_description: String,
  meta_keywords: String,
  title: String,
  service_title:String,
  description: String,
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
  video_heading: String,
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
  video_description: String,
  video_thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
  appointment_link: String,
  requirement: [{
    images: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
    alt: String,
    names: String
  }],
  benefit_heading: String,
  benefits: [{
    images: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
    alt: String,
    names: String,
    paragraph: String
  }],
  how_its_work: {
    heading: String,
    description: String,
    cards: [{
      image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
      alt: String,
      title: String,
      paragraph: String,
      step_details: [{
        title: String,
        paragraph: String
      }]
    }]
  },
  claim: [{
    images: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
    alt: String,
    names: String
  }],
  success_stories: [{
    name: String,
    place: String,
    images: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
    alt: String,
    title: String,
    description: String,
    is_top: { type: Boolean, default: false },
    rank: { type: Number, default: 0 }
  }],
  frequently_asked_questions: [{ question: String, answer: String }],
  shorts: [{
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
    alt: String,
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
  }]
});

const subCategorySchema = new mongoose.Schema({
  meta_title: String,
  meta_description: String,
  meta_keywords: String,
  title: String,
  description: String,
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
  banner_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
  services: [serviceSchema]
});

const categorySchema = new mongoose.Schema({
  name: String,
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, 
  alt: String,
  sub_categories: [subCategorySchema]
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
