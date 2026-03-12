import { GoogleGenAI, Type } from "@google/genai";
import { Frequency } from '../types';

// NOTE: In a real environment, this should be accessed safely.
// For this demo, we assume the environment variable is set.
const API_KEY = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;

try {
    if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
} catch (error) {
    console.error("Failed to initialize Gemini Client", error);
}

export const suggestMoreTasks = async (areaName: string, excludeTasks: string[], language: string = 'es', maxFrequency: string = 'Weekly'): Promise<{title: string, freq: Frequency}[]> => {
    if (!ai) {
        return [];
    }
    try {
        const langInstruction = 'CRITICAL: You MUST provide all task titles in Spanish. Do not use English.';
        const prompt = `Suggest exactly 30 cleaning or maintenance tasks for a "${areaName}". 
        Do NOT include any of the following tasks: ${excludeTasks.join(', ')}. 
        IMPORTANT: Order the tasks by importance, putting the most important and critical tasks first, and the least important tasks last.
        IMPORTANT: The user cleans their house with a frequency of "${maxFrequency}". Therefore, NO task should have a frequency more frequent than "${maxFrequency}". For example, if maxFrequency is "Semanal", do not suggest "Diario" tasks. Suggest "Semanal", "Quincenal", "Mensual", or "Trimestral".
        ${langInstruction}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "The name of the task, e.g., 'Limpiar el horno'",
                            },
                            freq: {
                                type: Type.STRING,
                                enum: ["Diario", "Semanal", "Quincenal", "Mensual", "Trimestral"],
                                description: "The recommended frequency for this task",
                            },
                        },
                        required: ["title", "freq"],
                    },
                },
            },
        });

        const jsonStr = response.text?.trim() || "[]";
        const tasks = JSON.parse(jsonStr);
        return tasks;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return [];
    }
};

export const getCleaningAdvice = async (taskTitle: string, areaName: string, language: string = 'en'): Promise<string> => {
    if (!ai) {
        return language === 'es' ? "Por favor configura tu API Key para obtener consejos inteligentes." : "Please configure your API Key to get smart advice.";
    }

    try {
        const model = 'gemini-3-flash-preview';
        const langInstruction = 'CRITICAL: You MUST provide the advice entirely in Spanish. Do not use English.';
        const prompt = `
        I need professional cleaning advice for the following task: "${taskTitle}" in the "${areaName}".
        
        Please provide:
        1. A brief list of recommended tools/products.
        2. A concise step-by-step guide (max 3-4 steps).
        3. A "pro tip" for better results.
        
        Keep the tone helpful and motivating. Format with simple markdown. ${langInstruction}
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text || "No advice available at the moment.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I couldn't fetch the cleaning advice right now. Please try again later.";
    }
};

export const getSmartScheduleSuggestion = async (apartmentType: string, numResidents: number): Promise<string> => {
   if (!ai) return "Gemini not configured.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Sugiere una frecuencia de limpieza para un ${apartmentType} con ${numResidents} residentes. Devuelve solo una frecuencia sugerida (Diario, Semanal, Mensual) y una razón de una oración en Español.`,
        });
        return response.text || "Semanal";
    } catch (e) {
        return "Semanal";
    }
}
