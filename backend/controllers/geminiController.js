const axios = require('axios');

const extractVoiceSkills = async (req, res) => {
    try {
        const { transcript } = req.body;

        // Validate transcript
        if (!transcript || !transcript.trim()) {
            return res.status(400).json({
                message: 'Transcript is required'
            });
        }

        // Get Gemini API key
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.status(500).json({
                message: 'GEMINI_API_KEY is not configured on the backend.'
            });
        }

        // Prompt for Gemini
        const prompt = `
You are an AI assistant for a local worker job platform called EverTried.

Extract the worker's skills and years of experience from the spoken text below.

Return ONLY a valid JSON array.

Each object must contain:
- "name": the skill name in Title Case
- "experience": an integer representing the number of years of experience

Rules:
1. If the worker explicitly gives years of experience, use that number.
2. If no experience is specified for a skill, use 1.
3. Do not include explanations.
4. Do not include markdown.
5. Do not use code fences.
6. Return only the JSON array.
7. If no clear skills are detected, return [].

Example:

Spoken:
"I am an electrician for five years and also a painter."

Response:
[
    {
        "name": "Electrician",
        "experience": 5
    },
    {
        "name": "Painter",
        "experience": 1
    }
]

Worker's Spoken Text:
"${transcript}"
`;

        // Gemini API endpoint
        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

        // Send request to Gemini
        const response = await axios.post(
            url,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Safely extract Gemini response
        const aiText =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        console.log('Gemini raw response:', aiText);

        if (!aiText) {
            return res.status(500).json({
                message: 'Gemini returned an empty response'
            });
        }

        // Remove possible markdown code fences
        const cleanedText = aiText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        // Extract JSON array from response
        const match = cleanedText.match(/\[[\s\S]*\]/);

        if (!match) {
            console.error(
                'Could not find JSON array in Gemini response:',
                cleanedText
            );

            return res.status(500).json({
                message: 'AI returned an invalid skills format'
            });
        }

        let extractedSkills;

        try {
            extractedSkills = JSON.parse(match[0]);
        } catch (parseError) {
            console.error(
                'Failed to parse Gemini JSON:',
                parseError.message
            );

            return res.status(500).json({
                message: 'AI returned invalid JSON'
            });
        }

        // Make sure the response is actually an array
        if (!Array.isArray(extractedSkills)) {
            return res.status(500).json({
                message: 'AI returned an invalid skills format'
            });
        }

        // Validate and normalize skills
        extractedSkills = extractedSkills
            .filter(
                (skill) =>
                    skill &&
                    typeof skill.name === 'string' &&
                    skill.name.trim() !== '' &&
                    Number.isFinite(Number(skill.experience))
            )
            .map((skill) => ({
                name: skill.name.trim(),
                experience: Math.max(
                    1,
                    Math.round(Number(skill.experience))
                )
            }));

        console.log('Extracted skills:', extractedSkills);

        return res.status(200).json({
            skills: extractedSkills
        });

    } catch (error) {
        console.error(
            'Backend Gemini Error:',
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: 'Server error processing AI skills'
        });
    }
};

module.exports = {
    extractVoiceSkills
};