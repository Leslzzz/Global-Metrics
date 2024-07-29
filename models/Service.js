const mongoose = require('mongoose');
const moment = require('moment');

const serviceSchema = new mongoose.Schema({
    folio: {
        type: Number,
        unique: true
    },
    producerName: String,
    serviceDate: {
        type: Date,
        default: Date.now,
        get: (date) => moment(date).format('YYYY-MM-DD')
    },
    location: String,
    premises: String,
    hectares: Number,
    serviceApplied: String,
    serviceCode: String,
    serviceName: String,
    image: String,
    archivoKML: String,
    contador: Number,
    notas: String
});

serviceSchema.set('toJSON', { getters: true });

const counterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 0
    }
});

const Counter = mongoose.model('Counter', counterSchema);

serviceSchema.pre('save', async function(next) {
    const doc = this;
    if (doc.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'serviceFolio' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        doc.folio = counter.seq;
    }
    next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
