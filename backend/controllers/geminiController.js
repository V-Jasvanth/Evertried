const axios = require('axios');

const extractVoiceSkills = async (req, res) => {
    try {
        const { transcript } = req.body;
        if (!transcript) {
            return res.status(400).json({ message: 'Transcript is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the backend.' });
        }

        const prompt = `You are an AI assistant for a local worker job platform called EverTried. 
        Extract the worker's skills and years of experience from the following spoken text. 
        Format your response strictly as a JSON array of objects. 
        Each object must have 'name' (string formatted as Title Case, e.g. 'Plumber', 'Electrician', 'Carpenter') and 'experience' (integer representing years).
        If they do not specify experience years, default to 1.
        Do not add any markdown formatting (like \`\`\`json), only return the raw JSON array.
        If no clear skills are detected, return an empty array [].
        Examples: 
        Spoken: "I am an electrician for five years and also a painter"
        Response: [{"name": "Electrician", "experience": 5}, {"name": "Painter", "experience": 1}]
        
        Worker's Spoken Text: "${transcript}"`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        const aiText = response.data.candidates[0].content.parts[0].text;
        
        // Robust JSON Extractions using Regex to find the array regardless of what Gemini says
        const match = aiText.match(/\[.*\]/s);
        const cleanJson = match ? match[0] : "[]";
        let extractedSkills = [];
        try {
             extractedSkills = JSON.parse(cleanJson);
        } catch (e) {
            extractedSkills = [];
        }

        res.json({ skills: extractedSkills });
    } catch (error) {
        console.error("Backend Gemini Error:", error.response?.data || error.message);
        res.status(500).json({ message: 'Server error processing AI skills' });
    }
};

module.exports = { extractVoiceSkills };
