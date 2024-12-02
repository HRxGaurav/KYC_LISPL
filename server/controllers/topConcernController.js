import TopSubCategory from '../models/topSubCategorySchema.js';
import Category from '../models/Category.js';


const createTopSubCategory = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const newTopSubCategory = new TopSubCategory({ title });
    await newTopSubCategory.save();

    return res.status(201).json(newTopSubCategory);
  } catch (error) {
    console.error('Error creating TopSubCategory:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTopSubCategoryTitle = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const updatedSubCategory = await TopSubCategory.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({ message: 'Top sub-category not found' });
    }

    return res.status(200).json(updatedSubCategory);
  } catch (error) {
    console.error('Error updating top sub-category:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllTopSubCategories = async (req, res) => {
  try {
    const topSubCategories = await TopSubCategory.find({}, 'title _id');
    return res.status(200).json(topSubCategories);
  } catch (error) {
    console.error('Error fetching top sub-categories:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubCategoriesByTopSubCategoryId = async (req, res) => {
  const { id } = req.params;

  try {
    const topSubCategory = await TopSubCategory.findById(id);
    if (!topSubCategory) {
      return res.status(404).json({ message: 'Top sub-category not found' });
    }

    const categories = await Category.find({}).populate({
      path: 'sub_categories.image',
      model: 'Image'
    });

    const allSubCategories = categories.flatMap(category => category.sub_categories);

    const top_sub_categories = [];
    const non_top_sub_categories = [];

    topSubCategory.subCategories.forEach(subCategoryId => {
      const subCategory = allSubCategories.find(sc => sc._id.toString() === subCategoryId.toString());
      if (subCategory) {
        top_sub_categories.push({
          _id: subCategory._id,
          title: subCategory.title,
          image: subCategory.image,
          alt: subCategory.alt
        });
      }
    });

    allSubCategories.forEach(subCategory => {
      if (!topSubCategory.subCategories.includes(subCategory._id)) {
        non_top_sub_categories.push({
          _id: subCategory._id,
          title: subCategory.title,
          image: subCategory.image,
          alt: subCategory.alt
        });
      }
    });

    return res.status(200).json({ top_sub_categories, non_top_sub_categories });
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addSubCategoryToTopSubCategory = async (req, res) => {
  const { id } = req.params;
  const { subCategoryId } = req.body;

  if (!subCategoryId) {
    return res.status(400).json({ message: 'Sub-category ID is required' });
  }

  try {
    const updatedTopSubCategory = await TopSubCategory.findByIdAndUpdate(
      id,
      { $addToSet: { subCategories: subCategoryId } },
      { new: true }
    );

    if (!updatedTopSubCategory) {
      return res.status(404).json({ message: 'Top sub-category not found' });
    }

    return res.status(200).json(updatedTopSubCategory);
  } catch (error) {
    console.error('Error adding sub-category to TopSubCategory:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeSubCategoryFromTop = async (req, res) => {
  const { id } = req.params;
  const { subCategoryId } = req.body;

  if (!subCategoryId) {
    return res.status(400).json({ message: 'Sub-category ID is required' });
  }

  try {
    const updatedTopSubCategory = await TopSubCategory.findByIdAndUpdate(
      id,
      { $pull: { subCategories: subCategoryId } },
      { new: true }
    );

    if (!updatedTopSubCategory) {
      return res.status(404).json({ message: 'Top sub-category not found' });
    }

    return res.status(200).json(updatedTopSubCategory);
  } catch (error) {
    console.error('Error removing sub-category from TopSubCategory:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const moveSubCategoryInTopSubCategory = async (req, res) => {
  const { id } = req.params;
  const { subCategoryId, direction } = req.body;

  if (!subCategoryId || !direction) {
    return res.status(400).json({ message: 'Sub-category ID and direction are required' });
  }

  if (direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ message: 'Direction must be either "up" or "down"' });
  }

  try {
    const topSubCategory = await TopSubCategory.findById(id);

    if (!topSubCategory) {
      return res.status(404).json({ message: 'Top sub-category not found' });
    }

    const currentIndex = topSubCategory.subCategories.findIndex(sc => sc.toString() === subCategoryId);

    if (currentIndex === -1) {
      return res.status(404).json({ message: 'Sub-category not found in top sub-category' });
    }

    const newIndex = direction === 'up' ? Math.max(0, currentIndex - 1) : Math.min(topSubCategory.subCategories.length - 1, currentIndex + 1);

    const [removedSubCategory] = topSubCategory.subCategories.splice(currentIndex, 1);
    topSubCategory.subCategories.splice(newIndex, 0, removedSubCategory);

    await topSubCategory.save();

    return res.status(200).json(topSubCategory);
  } catch (error) {
    console.error('Error moving sub-category in TopSubCategory:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTopConcerns = async (req, res) => {
  try {
    const topConcerns = await TopSubCategory.find().lean();

    const populatedTopConcerns = await Promise.all(topConcerns.map(async (topConcern) => {
      const populatedSubCategories = await Category.aggregate([
        { $unwind: '$sub_categories' },
        { $match: { 'sub_categories._id': { $in: topConcern.subCategories } } },
        {
          $lookup: {
            from: 'images',
            localField: 'sub_categories.image',
            foreignField: '_id',
            as: 'imageDetails'
          }
        },
        {
          $unwind: {
            path: '$imageDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: '$sub_categories._id',
            title: '$sub_categories.title',
            image: {
              id: '$imageDetails._id',
              image: '$imageDetails.image',
              alt: '$imageDetails.alt'
            },
            alt: '$sub_categories.alt',
            services_count: { $size: '$sub_categories.services' }
          }
        }
      ]);

      return {
        title: topConcern.title,
        _id: topConcern._id,
        subCategories: populatedSubCategories
      };
    }));

    res.json(populatedTopConcerns);
  } catch (error) {
    console.error('Error fetching top concerns:', error);
    res.status(500).json({ message: 'Error fetching top concerns', error: error.message });
  }
};

export { createTopSubCategory, updateTopSubCategoryTitle, getAllTopSubCategories, getSubCategoriesByTopSubCategoryId, addSubCategoryToTopSubCategory, removeSubCategoryFromTop, moveSubCategoryInTopSubCategory, getTopConcerns };