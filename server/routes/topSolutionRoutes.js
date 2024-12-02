import express from 'express';
import { createTopService, updateTopServiceTitle, getAllTopServices, getServicesByTopServiceId, addServiceToTopService, removeServiceFromTop, moveServiceInTopService, getTopServices } from '../controllers/topSolutionController.js';

const router = express.Router();


// For Admin
router.post('/create_top_service', createTopService);
router.put('/update_top_service/:id', updateTopServiceTitle);
router.get('/get_all_top_services', getAllTopServices);
router.get('/get_services_by_top_service/:id', getServicesByTopServiceId);
router.post('/add_services_to_top/:id', addServiceToTopService);
router.post('/remove_service_from_top/:id', removeServiceFromTop);
router.post('/move_service_in_top/:id', moveServiceInTopService);

// For Client
router.get('/get_top_solutions', getTopServices);

export default router;