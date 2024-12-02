import TopService from '../models/topServiceSchema.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

const createTopService = async (req, res) => {
  const { title } = req.body; // Extract title from the request body

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const newTopService = new TopService({ title }); // Create a new TopService instance
    await newTopService.save(); // Save the instance to the database

    return res.status(201).json(newTopService); // Respond with the created document
  } catch (error) {
    console.error('Error creating TopService:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTopServiceTitle = async (req, res) => {
    const { id } = req.params; // Get the ID from the request parameters
    const { title } = req.body; // Get the new title from the request body
  
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
  
    try {
      const updatedService = await TopService.findByIdAndUpdate(
        id,
        { title },
        { new: true } // Return the updated document
      );
  
      if (!updatedService) {
        return res.status(404).json({ message: 'Top service not found' });
      }
  
      return res.status(200).json(updatedService); // Respond with the updated document
    } catch (error) {
      console.error('Error updating top service:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getAllTopServices = async (req, res) => {
    try {
      // Fetch all top services with only title and _id
      const topServices = await TopService.find({}, 'title _id'); // Select only title and _id
  
      return res.status(200).json(topServices); // Respond with the list of top services
    } catch (error) {
      console.error('Error fetching top services:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Function to get services based on TopService ID
const getServicesByTopServiceId = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    // Fetch the TopService by ID
    const topService = await TopService.findById(id);
    if (!topService) {
      return res.status(404).json({ message: 'Top service not found' });
    }

    // Fetch all services from the Category model and populate their images
    const categories = await Category.find({}).populate({
      path: 'sub_categories.services',
      populate: {
        path: 'image', // Populate the image field in services
        model: 'Image' // Ensure this matches your Image model name
      }
    });

    // Flatten the services from all categories
    const allServices = categories.flatMap(category => 
      category.sub_categories.flatMap(subCategory => subCategory.services)
    );

    // Create a map of all services for quick lookup
    const serviceMap = new Map(allServices.map(service => [service._id.toString(), service]));

    // Prepare the response arrays
    const top_services = [];
    const non_top_services = [];

    // Add top services in the order specified by topService.services
    topService.services.forEach(serviceId => {
      const service = serviceMap.get(serviceId.toString());
      if (service) {
        top_services.push({
          _id: service._id,
          title: service.title,
          image: service.image, // This will now be the populated image object
          alt: service.alt
        });
        serviceMap.delete(serviceId.toString()); // Remove from map to avoid duplication
      }
    });

    // Add remaining services to non_top_services
    serviceMap.forEach(service => {
      non_top_services.push({
        _id: service._id,
        title: service.title,
        image: service.image, // This will now be the populated image object
        alt: service.alt
      });
    });

    // Return the response
    return res.status(200).json({ top_services, non_top_services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addServiceToTopService = async (req, res) => {
  const { id } = req.params; // Get the Top Service ID from the URL parameters
  const { serviceId } = req.body; // Get the service ID from the request body

  if (!serviceId) {
    return res.status(400).json({ message: 'Service ID is required' });
  }

  try {
    // Find the Top Service by ID and push the service ID into the services array
    const updatedTopService = await TopService.findByIdAndUpdate(
      id,
      { $addToSet: { services: serviceId } }, // Use $addToSet to avoid duplicates
      { new: true } // Return the updated document
    );

    if (!updatedTopService) {
      return res.status(404).json({ message: 'Top service not found' });
    }

    return res.status(200).json(updatedTopService); // Respond with the updated document
  } catch (error) {
    console.error('Error adding service to TopService:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeServiceFromTop = async (req, res) => {
  const { id } = req.params; // TopService ID
  const { serviceId } = req.body; // Service ID to remove

  if (!serviceId) {
    return res.status(400).json({ message: 'Service ID is required' });
  }

  try {
    const updatedTopService = await TopService.findByIdAndUpdate(
      id,
      { $pull: { services: serviceId } }, // Remove the serviceId from the services array
      { new: true } // Return the updated document
    );

    if (!updatedTopService) {
      return res.status(404).json({ message: 'Top service not found' });
    }

    return res.status(200).json(updatedTopService);
  } catch (error) {
    console.error('Error removing service from TopService:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const moveServiceInTopService = async (req, res) => {
  const { id } = req.params; // TopService ID
  const { serviceId, direction } = req.body; // Service ID to move and direction ('up' or 'down')

  if (!serviceId || !direction) {
    return res.status(400).json({ message: 'Service ID and direction are required' });
  }

  if (direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ message: 'Direction must be either "up" or "down"' });
  }

  try {
    const topService = await TopService.findById(id);

    if (!topService) {
      return res.status(404).json({ message: 'Top service not found' });
    }

    const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
    const currentIndex = topService.services.findIndex(s => s.equals(serviceObjectId));

    if (currentIndex === -1) {
      return res.status(404).json({ message: 'Service not found in top service' });
    }

    let newIndex;
    if (direction === 'up') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(topService.services.length - 1, currentIndex + 1);
    }

    // Remove the service from its current position and insert it at the new position
    const [removedService] = topService.services.splice(currentIndex, 1);
    topService.services.splice(newIndex, 0, removedService);

    await topService.save();

    return res.status(200).json(topService);
  } catch (error) {
    console.error('Error moving service in TopService:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getTopServices = async (req, res) => {
  try {
    const topServices = await TopService.find().lean();

    const simplifiedTopServices = await Promise.all(topServices.map(async (topService) => {
      const populatedServices = await Category.aggregate([
        { $unwind: '$sub_categories' },
        { $unwind: '$sub_categories.services' },
        { $match: { 'sub_categories.services._id': { $in: topService.services } } },
        {
          $lookup: {
            from: 'images', // Ensure this matches your images collection name
            localField: 'sub_categories.services.image', // Field in services that references the image
            foreignField: '_id', // Field in images collection that matches
            as: 'imageDetails' // Name of the new array field to add
          }
        },
        {
          $unwind: {
            path: '$imageDetails',
            preserveNullAndEmptyArrays: true // Keep services without images
          }
        },
        {
          $project: {
            _id: '$sub_categories.services._id',
            title: '$sub_categories.services.title',
            service_title: '$sub_categories.services.service_title',
            url_params: '$sub_categories.services.url_params',
            image: '$imageDetails', // Send the full image object instead of a URL
            alt: '$sub_categories.services.alt'
          }
        }
      ]);

      return {
        title: topService.title,
        service_title:topService.service_title,
        _id: topService._id,
        services: populatedServices
      };
    }));

    res.json(simplifiedTopServices);
  } catch (error) {
    console.error('Error fetching simplified top services:', error);
    res.status(500).json({ message: 'Error fetching simplified top services', error: error.message });
  }
};



export { createTopService, updateTopServiceTitle, getAllTopServices, getServicesByTopServiceId, addServiceToTopService, removeServiceFromTop, moveServiceInTopService, getTopServices };