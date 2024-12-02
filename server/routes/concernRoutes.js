import express from 'express';
import { getCategories, addCategory, updateCategoryById, getSubCategories, addSubCategory, addService, getSubCategoriesByTitle,getAllSubCategoriesBoth, updateSubCategoryById,getServicesBySubCategoryId, getAllServicesByCategoryId, getServiceByTitle, updateService, getSubcategoriesAndServices } from '../controllers/categoryController.js';
const router = express.Router();
import { checkAuthUser } from '../middlewares/auth-middleware.js';

// getAllSubCategoriesWithServices


//mainly for admin panel
router.get('/categories', getCategories);
router.post('/categories', checkAuthUser, addCategory);
router.put('/categories/:id', checkAuthUser, updateCategoryById);
router.get('/categories/:categoryId/subcategories', getSubCategories);
router.post('/categories/:categoryId/subcategories', checkAuthUser, addSubCategory);
router.put('/categories/subcategories/:subCategoryId', checkAuthUser, updateSubCategoryById);
router.post('/categories/subcategories/:subCategoryId/services',checkAuthUser, addService);
router.put('/service/:serviceId',checkAuthUser, updateService);
router.get('/subcategories/:subCategoryId/services', getServicesBySubCategoryId);  


// for client
router.get('/concerns/subcategories/:title', getSubCategoriesByTitle);
router.get('/all_subcategories', getAllSubCategoriesBoth);
router.get('/all_subcategories_services', getSubcategoriesAndServices);
router.get('/category/services/:id', getAllServicesByCategoryId);
router.get('/services/:title', getServiceByTitle); //get service by url params

export default router;
