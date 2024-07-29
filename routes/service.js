const express = require('express');
const Service = require('../models/Service');

module.exports = (upload) => {
    const router = express.Router();

    // Crear un nuevo servicio
    router.post('/', upload.fields([{ name: 'image' }, { name: 'kmlKmzFile' }]), async (req, res) => {
        try {
            const service = new Service({
                producerName: req.body.producerName,
                serviceDate: req.body.serviceDate,
                location: req.body.location,
                premises: req.body.premises,
                hectares: req.body.hectares,
                serviceApplied: req.body.serviceApplied,
                serviceCode: req.body.serviceCode,
                serviceName: req.body.serviceName,
                image: req.files['image'] ? req.files['image'][0].filename : null,
                archivoKML: req.files['kmlKmzFile'] ? req.files['kmlKmzFile'][0].filename : null,
                contador: req.body.contador,
                notas: req.body.notas
            });

            await service.save();

            // Actualizar el contador
            await Service.updateOne({ producerName: req.body.producerName }, { $inc: { contador: 1 } }, { upsert: true });

            res.status(201).send(service);
        } catch (error) {
            res.status(400).send(error);
        }
    });

    // Obtener todos los servicios
    router.get('/', async (req, res) => {
        try {
            const services = await Service.find({});
            res.send(services);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Actualizar un servicio
    router.put('/:id', upload.fields([{ name: 'image' }, { name: 'archivoKML' }]), async (req, res) => {
        try {
            const service = await Service.findById(req.params.id);
            if (!service) {
                return res.status(404).send();
            }

            // Actualizar los campos del servicio
            service.producerName = req.body.producerName || service.producerName;
            service.serviceDate = req.body.serviceDate || service.serviceDate;
            service.location = req.body.location || service.location;
            service.premises = req.body.premises || service.premises;
            service.hectares = req.body.hectares || service.hectares;
            service.serviceApplied = req.body.serviceApplied || service.serviceApplied;
            service.serviceCode = req.body.serviceCode || service.serviceCode;
            service.serviceName = req.body.serviceName || service.serviceName;
            service.contador = req.body.contador || service.contador;
            service.notas = req.body.notas || service.notas;

            // Actualizar archivos si se han proporcionado
            if (req.files['image']) {
                service.image = req.files['image'][0].filename;
            }
            if (req.files['archivoKML']) {
                service.archivoKML = req.files['archivoKML'][0].filename;
            }

            await service.save();
            res.send(service);
        } catch (error) {
            res.status(400).send(error);
        }
    });

    // Eliminar un servicio
    router.delete('/:id', async (req, res) => {
        try {
            const service = await Service.findByIdAndDelete(req.params.id);
            if (!service) {
                return res.status(404).send();
            }
            res.send(service);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Ruta de búsqueda
    router.get('/search', async (req, res) => {
        const { query, filterBy } = req.query;
        const regex = new RegExp(query, 'i');

        try {
            const filter = {};
            filter[filterBy] = regex;

            const services = await Service.find(filter);
            res.send(services);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};
