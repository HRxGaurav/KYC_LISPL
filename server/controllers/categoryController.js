import Category from '../models/Category.js';


const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, 'name image alt _id')
      .populate('image');

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addCategory = async (req, res) => {
  const { name, image } = req.body;
  try {
    const newCategory = new Category({ name, image, sub_categories: [] });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategoryById = async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;

  try {
    const updateData = { name, image };
   
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } 
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSubCategories = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId)
      .populate('image')
      .populate({
        path: 'sub_categories',
        populate: {
          path: 'image banner_image',
        }
      });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    const subCategories = category.sub_categories.map(subCategory => ({
      ...subCategory.toObject(),
      services: subCategory.services.map(service => ({
        ...service.toObject(),
        image: service.image ? service.image : null,
        video: service.video ? service.video : null,
        video_thumbnail: service.video_thumbnail ? service.video_thumbnail : null,
      }))
    }));

    res.status(200).json({ 
      category_name: category.name, 
      sub_categories: subCategories 
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addSubCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { title, description, image, banner_image, meta_title, meta_description, meta_keywords } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create a new subcategory object
    const newSubCategory = { 
      title, 
      description, 
      services: [] // Initialize services as an empty array
    };

    // Only add image and banner_image if they are not empty strings
    if (image && image !== "") {
      newSubCategory.image = image; // Add image if it's not an empty string
    }
    if (banner_image && banner_image !== "") {
      newSubCategory.banner_image = banner_image; // Add banner_image if it's not an empty string
    }

    // Add optional metadata fields if they are provided
    if (meta_title) newSubCategory.meta_title = meta_title;
    if (meta_description) newSubCategory.meta_description = meta_description;
    if (meta_keywords) newSubCategory.meta_keywords = meta_keywords;

    // Push the new subcategory to the category's sub_categories array
    category.sub_categories.push(newSubCategory);
    await category.save(); // Save the updated category

    res.status(201).json(newSubCategory); // Return the newly created subcategory
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSubCategoryById = async (req, res) => {
  const { subCategoryId } = req.params;
  const { title, description, image, banner_image, meta_title, meta_description, meta_keywords } = req.body;

  try {
    const category = await Category.findOne({ "sub_categories._id": subCategoryId });
    if (!category) return res.status(404).json({ message: 'Subcategory not found' });

    const subCategory = category.sub_categories.id(subCategoryId);
    if (!subCategory) return res.status(404).json({ message: 'Subcategory not found' });

    // Update fields only if they are provided in the request body
    if (title) subCategory.title = title;
    if (description) subCategory.description = description;
    if (meta_title) subCategory.meta_title = meta_title;
    if (meta_description) subCategory.meta_description = meta_description;
    if (meta_keywords) subCategory.meta_keywords = meta_keywords;

    // Only update image and banner_image if they are not empty strings
    if (image && image !== "") {
      subCategory.image = image; // Update image if it's not an empty string
    }
    if (banner_image && banner_image !== "") {
      subCategory.banner_image = banner_image; // Update banner_image if it's not an empty string
    }

    await category.save(); // Save the updated category
    res.status(200).json(subCategory); // Return the updated subcategory
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const addService = async (req, res) => {
  const { subCategoryId } = req.params;
  const newService = req.body;

  try {
    const category = await Category.findOne({ "sub_categories._id": subCategoryId });

    if (!category) return res.status(404).json({ message: 'Subcategory not found' });

    const subCategory = category.sub_categories.id(subCategoryId);
    if (!subCategory) return res.status(404).json({ message: 'Subcategory not found' });

    subCategory.services.push(newService);
    await category.save();

    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateService = async (req, res) => {
  const { serviceId } = req.params;
  const updatedService = req.body;

  try {
    const category = await Category.findOne({ "sub_categories.services._id": serviceId });

    if (!category) return res.status(404).json({ message: 'Service not found' });

    const subCategory = category.sub_categories.find(subCat => 
      subCat.services.id(serviceId)
    );
    if (!subCategory) return res.status(404).json({ message: 'Service not found' });

    const service = subCategory.services.id(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const fieldsToUpdate = [
      'url_params',
      'meta_title',
      'meta_description',
      'meta_keywords',
      'title',
      'service_title',
      'description',
      'image',
      'video_heading',
      'video', 
      'video_thumbnail', 
      'video_description',
      'appointment_link',
      'images', 
      'benefit_heading',
      'benefits', 
      'requirement', 
      'claim', 
      'success_stories', 
      'shorts', 
      'frequently_asked_questions', 
      'how_its_work'
    ];

    const updateFields = (obj, updatedObj) => {
      Object.keys(updatedObj).forEach(key => {
        if (fieldsToUpdate.includes(key)) {
          if (Array.isArray(updatedObj[key])) {
            // Directly replace the existing array with the new one
            obj[key] = updatedObj[key].map(item => {
              if (typeof item === 'object' && item !== null) {
                updateFields(item, item); // Update nested objects
                return item;
              }
              return item; // Return the item as is if it's not an object
            });
          } else if (typeof updatedObj[key] === 'string') {
            // Update other string fields directly without checking for 'uploads/'
            obj[key] = updatedObj[key];
          } else if (typeof updatedObj[key] === 'object' && updatedObj[key] !== null) {
            if (!obj[key]) obj[key] = Array.isArray(updatedObj[key]) ? [] : {};
            updateFields(obj[key], updatedObj[key]); // Recursively update nested objects
          } else {
            // Update the field directly
            obj[key] = updatedObj[key];
          }
        }
      });
    };

    // Update the service fields
    updateFields(service, updatedService);

    // Specifically handle how_its_work updates
    if (updatedService.how_its_work) {
      service.how_its_work.heading = updatedService.how_its_work.heading || service.how_its_work.heading;
      service.how_its_work.description = updatedService.how_its_work.description || service.how_its_work.description;

      if (Array.isArray(updatedService.how_its_work.cards)) {
        // Replace the cards array with the new one
        service.how_its_work.cards = updatedService.how_its_work.cards.map(card => ({
          _id: card._id, // Keep the existing _id
          step_details: card.step_details || [], // Update step_details or keep existing
          image: card.image, // Directly assign without checking for 'uploads/'
          title: card.title || service.how_its_work.cards.find(c => c._id === card._id)?.title,
          alt: card.alt || service.how_its_work.cards.find(c => c._id === card._id)?.alt,
          paragraph: card.paragraph || service.how_its_work.cards.find(c => c._id === card._id)?.paragraph,
        }));
      }
    }

    // Handle updates for shorts, success stories, claims, and benefits
    if (Array.isArray(updatedService.shorts)) {
      service.shorts = updatedService.shorts.map(short => ({
        _id: short._id, // Keep the existing _id
        thumbnail: short.thumbnail, // Directly assign without checking for 'uploads/'
        video: short.video, // Directly assign without checking for 'uploads/'
      }));
    }

    if (Array.isArray(updatedService.success_stories)) {
      service.success_stories = updatedService.success_stories.map(story => ({
        _id: story._id, // Keep the existing _id
        name: story.name || service.success_stories.find(s => s._id === story._id)?.name,
        place: story.place || service.success_stories.find(s => s._id === story._id)?.place,
        images: story.images, // Directly assign without checking for 'uploads/'
        title: story.title || service.success_stories.find(s => s._id === story._id)?.title,
        description: story.description || service.success_stories.find(s => s._id === story._id)?.description, // Add description here
        is_top: story.is_top !== undefined ? story.is_top : service.success_stories.find(s => s._id === story._id)?.is_top,
        rank: story.rank !== undefined ? story.rank : service.success_stories.find(s => s._id === story._id)?.rank,
      }));
    }

    if (Array.isArray(updatedService.claim)) {
      service.claim = updatedService.claim.map(claim => ({
        _id: claim._id, // Keep the existing _id
        images: claim.images, // Directly assign without checking for 'uploads/'
        names: claim.names || service.claim.find(c => c._id === claim._id)?.names,
      }));
    }

    if (Array.isArray(updatedService.benefits)) {
      service.benefits = updatedService.benefits.map(benefit => ({
        _id: benefit._id, // Keep the existing _id
        images: benefit.images, // Directly assign without checking for 'uploads/'
        names: benefit.names || service.benefits.find(b => b._id === benefit._id)?.names,
        paragraph: benefit.paragraph || service.benefits.find(b => b._id === benefit._id)?.paragraph,
      }));
    }

    await category.save();

    // Populate the updated service data
    const populatedService = await Category.findOne({ "sub_categories.services._id": serviceId })
      .populate({
        path: 'sub_categories.services.image', // Populate the image field in services
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.benefits.images', // Populate images in benefits
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.claim.images', // Populate images in claims
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.shorts.thumbnail', // Populate images in Shorts Thumbnail
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.shorts.video', // Populate images in Shorts Video
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.video', // Populate images in Shorts Video
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.success_stories.images', // Populate success story images
        model: 'Image'
      });

    // Extract the specific service from the populated data
    const updatedServiceResponse = populatedService.sub_categories
      .flatMap(subCat => subCat.services)
      .find(s => s._id.toString() === serviceId);

    // Return the simplified updated service
    res.status(200).json(updatedServiceResponse);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const getServicesBySubCategoryId = async (req, res) => {
  const { subCategoryId } = req.params;
  try {
    // Find the category and populate the services with their images and other relevant fields
    const category = await Category.findOne({ 'sub_categories._id': subCategoryId })
      .populate({
        path: 'sub_categories.services.image', // Populate the image field in services
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.video', // Populate the video field in services
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.video_thumbnail', // Populate the video thumbnail field in services
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.benefits.images', // Populate images in benefits
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.claim.images', // Populate images in claims
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.shorts.thumbnail', // Populate thumbnail in shorts
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.shorts.video', // Populate video in shorts
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.success_stories.images', // Populate success story in shorts
        model: 'Image'
      })
      .populate({
        path: 'sub_categories.services.how_its_work.cards.image', // Populate images in how_its_work cards
        model: 'Image'
      });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    const subCategory = category.sub_categories.id(subCategoryId);
    if (!subCategory) return res.status(404).json({ message: 'Subcategory not found' });
    
    const services = subCategory.services.map(service => service.toObject());

    res.status(200).json({
      services,
      category: { id: category._id, name: category.name },
      subCategory: { id: subCategory._id, title: subCategory.title },
    });
  } catch (error) {
    console.error('Error in getServicesBySubCategoryId:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSubCategoriesByTitle = async (req, res) => {
  const { title } = req.params; 
  const formattedTitle = title.split('-').join(' '); 

  try {
    // Find categories with populated subcategories using case-insensitive match
    const categories = await Category.find({
      'sub_categories.title': { $regex: new RegExp(`^${formattedTitle}$`, 'i') } // Case-insensitive match
    }).populate({
      path: 'sub_categories',
      populate: [
        { path: 'services.image' }, // Populate service images
        { path: 'services.video' }, // Populate service videos
        { path: 'services.video_thumbnail' }, // Populate service video thumbnails
        { path: 'services.requirement.images' }, // Populate requirement images
        { path: 'services.benefits.images' }, // Populate benefits images
        { path: 'services.claim.images' }, // Populate claim images
        { path: 'services.success_stories.images' }, // Populate success stories images
        { path: 'services.shorts.thumbnail' }, // Populate shorts thumbnail
        { path: 'services.shorts.video' }, // Populate shorts video
        { path: 'banner_image' }, // Populate banner_image for subcategories
        { path: 'services.how_its_work.cards.image' } // Populate how its work card
      ]
    });

    if (categories.length === 0) {
      return res.status(404).json({ message: 'No subcategories found with the given title' });
    }

    const matchingSubCategories = categories.flatMap(category => {
      const matchingSubCats = category.sub_categories.filter(subCategory =>
        subCategory.title.toLowerCase() === formattedTitle.toLowerCase() // Case-insensitive comparison
      );
      
      return matchingSubCats.map(subCategory => ({
        ...subCategory.toObject(),
        categoryId: category._id,
        categoryName: category.name,
      }));
    });

    // Fetch all categories and populate their images
    const allCategories = await Category.find({})
      .populate('image'); // Populate category images

    const otherCategories = allCategories.filter(category =>
      !categories.some(matchingCategory => matchingCategory._id.equals(category._id))
    ).map(category => ({
      _id: category._id,
      name: category.name,
      image: category.image,
      banner_image: category.banner_image // Include banner image in the response
    }));
   
    res.status(200).json({ matchingSubCategories, otherCategories });
  } catch (error) {
    console.error('Error in getSubCategoriesByTitle:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllSubCategoriesBoth = async (req, res) => {
  try {
    // Find categories and populate the images in sub_categories and services
    const categories = await Category.find({})
      .populate({
        path: 'sub_categories.image', // Populate image field in sub_categories
        model: 'Image' // Ensure this matches your Image model name
      })
      .populate({
        path: 'sub_categories.services.image', // Populate image field in services
        model: 'Image' // Ensure this matches your Image model name
      });

    const concernSubCategories = categories.flatMap(category =>
      category.sub_categories.map(subCategory => ({
        _id: subCategory._id,
        categoryId: category._id,
        categoryType: 'concern',
        title: subCategory.title,
        image: subCategory.image // This will now be the populated image object
      }))
    );

    const solutionSubCategories = categories.flatMap(category =>
      category.sub_categories.flatMap(subCategory =>
        subCategory.services.map(service => ({
          _id: service._id,
          categoryId: category._id,
          categoryType: 'solution',
          title: service.title,
          image: service.image, // This will now be the populated image object
          url_params: service.url_params
        }))
      )
    );

    res.status(200).json({
      concernSubCategories,
      solutionSubCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubcategoriesAndServices = async (req, res) => {
  try {
    // Fetch all categories with necessary fields for sub-categories and services
    const categories = await Category.find({})
      .select('sub_categories.title sub_categories.url_params sub_categories.image sub_categories.alt sub_categories._id sub_categories.services')
      .populate({
        path: 'sub_categories.services',
        select: 'title image alt _id'
      });

    // Arrays to hold sub-categories and services separately
    let subCategoriesArray = [];
    let servicesArray = [];

    // Process the data to separate sub-categories and services, and add the "origin" field
    categories.forEach(category => {
      category.sub_categories.forEach(subCategory => {
        // Add sub-category with origin
        subCategoriesArray.push({
          title: subCategory.title,
          image: subCategory.image,
          alt: subCategory.alt,
          _id: subCategory._id,
          origin: 'subcategory'
        });

        // Add services with origin
        subCategory.services.forEach(service => {
          servicesArray.push({
            title: service.title,
            url_params: service.url_params,
            image: service.image,
            alt: service.alt,
            _id: service._id,
            origin: 'service',
            subCategoryId: subCategory._id // Optionally include the parent subcategory ID for context
          });
        });
      });
    });

    // Return the separate arrays in a JSON response
    return res.status(200).json({
      sub_categories: subCategoriesArray,
      services: servicesArray
    });
  } catch (error) {
    console.error('Error fetching sub-categories and services:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};



const getAllServicesByCategoryId = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id).populate({
      path: 'sub_categories.services',
      populate: {
        path: 'image' // Populate the image field for each service
      }
    });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    const allServices = category.sub_categories.flatMap(subCategory => subCategory.services);

    res.status(200).json(allServices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getServiceByTitle = async (req, res) => {
  const { title } = req.params;
  const formattedTitle = title.split('-').join(' '); 

  try {
    // Find the category and populate the necessary fields
    const category = await Category.findOne({ "sub_categories.services.url_params": { $regex: new RegExp(`^${formattedTitle}$`, 'i') } }) // Case-insensitive match
      .populate({
        path: 'sub_categories.services',
        populate: [
          { path: 'image' }, // Populate image field
          { path: 'video' }, // Populate video field
          { path: 'video_thumbnail' }, // Populate video thumbnail field
          { path: 'requirement.images' }, // Populate requirement images
          { path: 'benefits.images' }, // Populate benefits images
          { path: 'claim.images' }, // Populate claim images
          { path: 'success_stories.images' }, // Populate success stories images
          { path: 'shorts.thumbnail' }, // Populate shorts thumbnail
          { path: 'shorts.video' }, // Populate shorts video
          { path: 'how_its_work.cards.image' } // Populate how its work card
        ]
      });

    if (!category) return res.status(404).json({ message: 'Service not found' });

    const subCategory = category.sub_categories.find(subCat => 
      subCat.services.some(service => service.url_params.toLowerCase() === formattedTitle.toLowerCase()) // Case-insensitive comparison
    );

    if (!subCategory) return res.status(404).json({ message: 'Service not found' });

    const service = subCategory.services.find(service => service.url_params.toLowerCase() === formattedTitle.toLowerCase()); // Case-insensitive comparison

    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Fetch other services in the same subcategory
    const otherServices = subCategory.services.filter(service => service.url_params.toLowerCase() !== formattedTitle.toLowerCase()); // Case-insensitive comparison

    // Populate other services
    const populatedOtherServices = await Promise.all(otherServices.map(async (otherService) => {
      return await Category.findOne({ "sub_categories.services._id": otherService._id })
        .populate({
          path: 'sub_categories.services',
          populate: [
            { path: 'image' },
            { path: 'video' },
            { path: 'video_thumbnail' },
            { path: 'requirement.images' },
            { path: 'benefits.images' },
            { path: 'claim.images' },
            { path: 'success_stories.images' },
            { path: 'shorts.thumbnail' },
            { path: 'shorts.video' }
          ]
        });
    }));

    // Populate the category itself
    const populatedCategory = await Category.findById(category._id)
      .populate('sub_categories.services.image') // Populate images for services in the category
      .populate('sub_categories.services.video') // Populate videos for services in the category
      .populate('sub_categories.services.video_thumbnail') // Populate video thumbnails for services in the category
      .populate('sub_categories.services.requirement.images') // Populate requirement images
      .populate('sub_categories.services.benefits.images') // Populate benefits images
      .populate('sub_categories.services.claim.images') // Populate claim images
      .populate('sub_categories.services.success_stories.images') // Populate success stories images
      .populate('sub_categories.services.shorts.thumbnail') // Populate shorts thumbnail
      .populate('sub_categories.services.shorts.video'); // Populate shorts video

    // Fetch other categories
    const otherCategories = await Category.find({ _id: { $ne: category._id } })
      .populate('image'); // Populate images for other categories

    res.status(200).json({
      service, 
      otherServices: populatedOtherServices, // Include populated other services
      category: populatedCategory, // Return the populated category
      otherCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { addService, updateCategoryById, addSubCategory, getSubCategories, updateSubCategoryById, addCategory, getCategories, getSubCategoriesByTitle, getAllSubCategoriesBoth, getServicesBySubCategoryId, getAllServicesByCategoryId, updateService, getServiceByTitle, getSubcategoriesAndServices }; 

