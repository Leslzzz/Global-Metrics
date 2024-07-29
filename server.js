const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const serviceRoutes = require('./routes/service');

const app = express();
const port = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/globalmetrics', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.google-earth.kml+xml' || 
        file.mimetype === 'application/vnd.google-earth.kmz' || 
        file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura las rutas
app.use('/api/services', serviceRoutes(upload));

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
