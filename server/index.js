import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import livenessCheckRoutes from './routes/livenessCheckRoutes.js';
import kycRoutes from './routes/kycRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use('/models', express.static(path.join(__dirname, 'models')));


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

dotenv.config();
const PORT = process.env.PORT || 9000;

//Cors policy
app.use(cors()); 

//Connect Database
connectDB();

//JSON
app.use(express.json())

app.get('/health', (req, res) => {
    res.status(200).json({ message: "I am working" });
});

//Load Routes
app.use('/api', livenessCheckRoutes);
app.use('/api', authRoutes);
app.use('/api', kycRoutes);
// app.use(concernRoutes);
// app.use(topSolutionRoutes);
// app.use(topConcernRoutes);
// app.use(mailRoutes);

// app.use('/auth', authRoutes);
// app.use('/files', fileRoutes);


app.listen(PORT, ()=>{
    console.log(`Server Running on port ${PORT}`);
})

