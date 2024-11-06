const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;

async function connectToDatabase() {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

const energySchema = new mongoose.Schema({
    total_kwh: Number,
    createdAt: { type: Date, default: Date.now },
    algo_status: String
});
const Energy = mongoose.model('Energy', energySchema);

const logSchema = new mongoose.Schema({
    access_time: String,
    access_date: { type: Date, default: Date.now },
    employee_name: String,
    algo_status: String
});
const Log = mongoose.model('Log', logSchema);

app.get('/api/energy', async (req, res) => {
    try {
        const data = await Energy.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving energy data', error });
    }
});

app.post('/api/logs', async (req, res) => {
    try {
        const log = new Log(req.body);
        await log.save();

        const filteredData = await Energy.find({
            createdAt: { $gte: new Date(req.body.access_date) },
            algo_status: req.body.algo_status
        });

        res.json({ message: 'Log stored successfully', data: filteredData });
    } catch (error) {
        res.status(500).json({ message: 'Error saving log', error });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectToDatabase();
});
