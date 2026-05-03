const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const responses = [
    { keywords: ['study spot', 'where to study', 'study place'], reply: 'You can find study spots like libraries and cafés on the Map page!' },
    { keywords: ['library'], reply: 'Libraries are great for quiet studying. Use the Map page to find the nearest library!' },
    { keywords: ['cafe', 'coffee'], reply: 'Cafés like Starbucks and Zus Coffee are popular study spots. Check the Map page for nearby cafés!' },
    { keywords: ['task', 'todo', 'homework'], reply: 'Manage your study tasks on the Task List page. Add, delete and track your progress!' },
    { keywords: ['add task'], reply: 'Go to the Task List page and tap the + button to add a new study session!' },
    { keywords: ['hello', 'hi', 'hey'], reply: 'Hello! How can I help with your study today?' },
    { keywords: ['thank'], reply: 'You are welcome! Keep up the great work!' },
];

app.post('/api/chatbot', (req, res) => {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();

    let reply = "Sorry, I'm not sure about that. Try ask another question.";

    for (const response of responses) {
        if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
            reply = response.reply;
            break;
        }
    }

    res.json({ reply });
});

let locationHistory = [];
app.post('/api/save-location', (req, res) => {
    const { latitude, longitude, timestamp } = req.body;
    
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing latitude or longitude' 
        });
    }
    
    const locationRecord = {
        id: locationHistory.length + 1,
        lat: latitude,
        lng: longitude,
        timestamp: timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    locationHistory.unshift(locationRecord);
    
    if (locationHistory.length > 100) {
        locationHistory = locationHistory.slice(0, 100);
    }
    
    console.log('Location saved:', locationRecord);
    
    res.json({
        success: true,
        message: 'Location saved to cloud',
        data: locationRecord
    });
});

app.get('/api/location-history', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const history = locationHistory.slice(0, limit);
    
    res.json({
        success: true,
        count: history.length,
        data: history
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});