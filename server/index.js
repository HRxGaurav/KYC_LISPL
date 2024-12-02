import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import concernRoutes from './routes/concernRoutes.js';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import topSolutionRoutes from './routes/topSolutionRoutes.js';
import topConcernRoutes from './routes/topConcernRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import livenessCheckRoutes from './routes/livenessCheckRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use('/models', express.static(path.join(__dirname, 'models')));


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

dotenv.config();
const PORT = process.env.PORT || 9000;

//Cors policy
app.use(cors()); 

//Connect Database
connectDB();

//JSON
app.use(express.json())

//Load Routes
app.use('/api', livenessCheckRoutes);
app.use('/api', authRoutes);
// app.use(concernRoutes);
// app.use(topSolutionRoutes);
// app.use(topConcernRoutes);
// app.use(mailRoutes);

// app.use('/auth', authRoutes);
// app.use('/files', fileRoutes);


app.listen(PORT, ()=>{
    console.log(`Server Running on port ${PORT}`);
})

