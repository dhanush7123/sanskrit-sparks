import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyAO98DMrf3tJ_e9oyT67537PfeMhCe7w_k";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.models) {
            const names = data.models.map(m => m.name).filter(n => n.includes('gemini'));
            console.log("AVAILABLE_MODELS_START");
            console.log(names.join('\n'));
            console.log("AVAILABLE_MODELS_END");
        } else {
            console.error("No models found", data);
        }
    })
    .catch(err => console.error("Error:", err));
