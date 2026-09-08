const axios = require('axios');

const extractVoiceSkills = async (req, res) => {
    try {
        const { transcript } = req.body;

        if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
            return res.status(400).json({
                message: 'Transcript is required'
            });
        }

        // Gemini API configuration
        const apiKey = process.env.GEMINI_API_KEY;
        const modelName =
            process.env.GEMINI_MODEL || 'gemini-2.5-flash';

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.status(500).json({
                message: 'GEMINI_API_KEY is not configured on the backend.'
            });
        }

        const prompt = `
You are an AI assistant for a local worker job platform called EverTried.

Extract the worker's skills and years of experience from the following spoken text.

Return ONLY a valid JSON array.

Each object must contain:
- "name": string in Title Case
- "experience": integer representing years of experience

Rules:
1. If experience is not mentioned for a skill, use 1.
2. Do not include skills that are not clearly mentioned.
3. Do not invent skills.
4. If no clear skills are detected, return [].
5. Experience must be a positive integer.
6. Do not include markdown.
7. Do not include explanations.
8. Return ONLY the JSON array.

Example:

Spoken:
"I am an electrician for five years and also a painter"

Response:
[
    {"name": "Electrician", "experience": 5},
    {"name": "Painter", "experience": 1}
]

Worker's Spoken Text:
"${transcript.trim()}"
`;

        // Gemini API endpoint
        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json'
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        // Safely extract Gemini response
        const aiText =
            response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            console.error(
                'Gemini returned an empty response:',
                response?.data
            );

            return res.status(502).json({
                message: 'Gemini returned an empty response.'
            });
        }

        // Remove accidental markdown code fences if Gemini returns them
        const cleanText = aiText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        let extractedSkills;

        try {
            extractedSkills = JSON.parse(cleanText);
        } catch (parseError) {
            console.error(
                'Failed to parse Gemini JSON:',
                cleanText
            );

            // Fallback: find the JSON array inside the response
            const match = cleanText.match(/\[[\s\S]*\]/);

            if (!match) {
                return res.status(502).json({
                    message: 'Gemini returned invalid JSON.'
                });
            }

            try {
                extractedSkills = JSON.parse(match[0]);
            } catch (fallbackError) {
                console.error(
                    'Fallback JSON parsing failed:',
                    fallbackError.message
                );

                return res.status(502).json({
                    message: 'Gemini returned invalid skills data.'
                });
            }
        }

        // Ensure Gemini returned an array
        if (!Array.isArray(extractedSkills)) {
            return res.status(502).json({
                message: 'Gemini returned an invalid skills format.'
            });
        }

        // Validate and normalize the extracted skills
        extractedSkills = extractedSkills
            .filter(
                (skill) =>
                    skill &&
                    typeof skill.name === 'string' &&
                    skill.name.trim().length > 0
            )
            .map((skill) => {
                let experience = Number(skill.experience);

                if (
                    !Number.isFinite(experience) ||
                    experience < 1
                ) {
                    experience = 1;
                }

                experience = Math.round(experience);

                // Convert skill name to Title Case
                const name = skill.name
                    .trim()
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase());

                return {
                    name,
                    experience
                };
            });

        // Remove duplicate skills
        const uniqueSkills = [];
        const seenSkills = new Set();

        for (const skill of extractedSkills) {
            const key = skill.name.toLowerCase();

            if (!seenSkills.has(key)) {
                seenSkills.add(key);
                uniqueSkills.push(skill);
            }
        }

        return res.json({
            skills: uniqueSkills
        });

    } catch (error) {
        console.error(
            'Backend Gemini Error:',
            error.response?.data || error.message
        );

        // Gemini/API error
        if (error.response) {
            const statusCode = error.response.status || 500;

            return res.status(statusCode >= 400 ? statusCode : 500).json({
                message:
                    error.response?.data?.error?.message ||
                    'Gemini API request failed.'
            });
        }

        // Timeout / network error
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                message: 'Gemini request timed out.'
            });
        }

        return res.status(500).json({
            message: 'Server error processing AI skills.'
        });
    }
};

module.exports = {
    extractVoiceSkills
};