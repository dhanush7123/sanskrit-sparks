
const apiKey = 'AIzaSyANy1Mx_02T-_egx1bPrcbN1NiivY_CJk8';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
const fs = require('fs');

async function listModels() {
    try {
        console.log('Fetching models from:', url);
        const response = await fetch(url);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        const data = await response.json();
        let output = 'Available Models:\n';
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    output += `- ${m.name} (Supported actions: ${m.supportedGenerationMethods})\n`;
                }
            });
        } else {
            output += 'No models found in response: ' + JSON.stringify(data);
        }
        fs.writeFileSync('models.txt', output);
        console.log('Wrote models to models.txt');
    } catch (error) {
        fs.writeFileSync('models.txt', 'Error listing models: ' + error.message);
        console.error('Error listing models:', error);
    }
}

listModels();
