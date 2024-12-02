import express from 'express';
import {
  createTopSubCategory,
  updateTopSubCategoryTitle,
  getAllTopSubCategories,
  getSubCategoriesByTopSubCategoryId,
  addSubCategoryToTopSubCategory,
  removeSubCategoryFromTop,
  moveSubCategoryInTopSubCategory,
  getTopConcerns
} from '../controllers/topConcernController.js';

const router = express.Router();


// For Admin
router.post('/create_top_sub_category', createTopSubCategory);
router.put('/update_top_sub_category/:id', updateTopSubCategoryTitle);
router.get('/get_all_top_sub_categories', getAllTopSubCategories);
router.get('/get_sub_categories_by_top_sub_category/:id', getSubCategoriesByTopSubCategoryId);
router.post('/add_sub_category_to_top/:id', addSubCategoryToTopSubCategory);
router.post('/remove_sub_category_from_top/:id', removeSubCategoryFromTop);
router.post('/move_sub_category_in_top/:id', moveSubCategoryInTopSubCategory);



// for Client 

router.get('/get_top_concerns', getTopConcerns);

export default router;
