import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Image from '../models/imageSchema.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    let fileName = file.originalname;
    let filePath = path.join('uploads', fileName); // Remove trailing slash from 'uploads/'
    let count = 1;

    while (fs.existsSync(filePath)) {
      const ext = path.extname(fileName);
      const name = path.basename(fileName, ext);
      const currentCount = name.match(/\((\d+)\)$/) ? parseInt(name.match(/\((\d+)\)$/)[1]) : 0;
      fileName = `${name.replace(/\(\d+\)$/, '')}(${currentCount + 1})${ext}`;
      filePath = path.join('uploads', fileName); // Remove trailing slash from 'uploads/'
    }

    cb(null, fileName);
  }
});

const upload = multer({ storage });

const uploadFile = (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: 'File upload failed', error: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { filename, originalname: originalName, size, mimetype } = req.file;
    const filePath = `uploads/${filename}`; // Construct the file path

    // Save the image path to the database as a new document
    try {
      const newImage = new Image({
        image: filename, 
        alt: originalName.split('.')[0].split(/[_-]/).join(' ')
      });
      await newImage.save(); // Save the new image document

      // Include the _id in the response
      res.status(200).json({
        message: 'File uploaded successfully',
        file: {
          _id: newImage._id, // Send the new image's _id
          filename,
          originalName,
          size,
          mimetype,
          path: filePath,
          uploadDate: new Date()
        }
      });
    } catch (dbError) {
      return res.status(500).json({ message: 'Error saving image path to database', error: dbError.message });
    }
  });
};

const getRecentUploads = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20; // Number of items per page
    const page = parseInt(req.params.page) || 1; // Current page

    try {
        // Fetch images from the database, sorted by creation date (most recent first)
        const images = await Image.find()
            .sort({ _id: -1 }) // Sort by _id to get the most recent first
            .skip((page - 1) * limit) // Skip the previous pages
            .limit(limit); // Limit the number of results

        // Get the total count of images for pagination
        const totalFiles = await Image.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalFiles / limit);

        // Prepare the response
        res.status(200).json({
            message: 'Recent uploads retrieved successfully',
            files: images.map(img => ({
                id: img._id, // Include the ID
                image: img.image,
                alt: img.alt
            })),
            currentPage: page,
            totalPages: totalPages,
            totalFiles: totalFiles
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching image data', error: error.message });
    }
};

const searchFilesByName = async (req, res) => {
  const { query } = req; // Get the query parameters from the request
  const searchTerm = query.name ? query.name.toLowerCase() : ''; // Get the search term

  try {
    // Query the database for images that match the search term
    const matchingImages = await Image.find({
      alt: { $regex: searchTerm, $options: 'i' } // Case-insensitive search
    });

    // Format the response to include id, image, and alt
    const formattedFiles = matchingImages.map(img => ({
      id: img._id, // Use the MongoDB document ID
      image: img.image, // The image filename or path
      alt: img.alt // The alt text
    }));

    res.status(200).json({
      message: 'Files retrieved successfully',
      files: formattedFiles // Return the formatted files
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching images from database', error: err.message });
  }
};

const deleteFile = (req, res) => {
  const uploadDir = 'uploads/';
  const { filename } = req.params; // Get the filename from the request parameters
  const filePath = path.join(uploadDir, filename); // Construct the full file path

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting file', error: err.message });
    }

    res.status(200).json({ message: 'File deleted successfully' });
  });
};

const updateAltText = async (req, res) => {
  const { id } = req.params; // Get the image ID from the request parameters
  const { alt } = req.body; // Get the new alt text from the request body

  if (!id || !alt) {
    return res.status(400).json({ message: 'Image ID and alt text are required' });
  }

  try {
    const updatedImage = await Image.findByIdAndUpdate(
      id, // Find the document by image ID
      { alt }, // Update the alt text
      { new: true } // Return the updated document
    );

    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.status(200).json({
      message: 'Alt text updated successfully',
      image: updatedImage
    });
  } catch (dbError) {
    return res.status(500).json({ message: 'Error updating alt text', error: dbError.message });
  }
};

export { uploadFile, getRecentUploads, searchFilesByName, deleteFile, updateAltText };