import { GoogleGenAI, Type } from "@google/genai";
import { SmartGoalAnalysis, PlanStep, LearningStrategy, PlanAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
Je bent 'ZimCoach', een didactische AI-coach voor studenten in het hoger onderwijs. 
Je baseert je adviezen strikt op het zelfregulatiemodel van Zimmerman (Forethought, Performance, Self-Reflection).
Spreek de student aan met 'jij'. Wees kort, bemoedigend en to-the-point.
Gebruik de Nederlandse taal.
Je antwoorden moeten klinken als gesproken tekst voor een avatar (geen titels, geen opsommingstekens tenzij strikt noodzakelijk).
`;

export const analyzeGoal = async (goal: string, strategy: LearningStrategy): Promise<SmartGoalAnalysis> => {
  const strategyLabels = {
    [LearningStrategy.MEMORIZE]: "Feitenkennis/Onthouden",
    [LearningStrategy.UNDERSTAND]: "Begrip/Samenvatten",
    [LearningStrategy.APPLY]: "Toepassen/Oefenen",
    [LearningStrategy.ANALYZE]: "Analyseren/Onderzoeken"
  };

  const prompt = `
    Fase: Voorbereiding (Forethought).
    Student doel: "${goal}".
    Gekozen strategie: "${strategyLabels[strategy]}".

    1. Beoordeel of dit doel SMART is.
    2. Beoordeel of de gekozen strategie past bij het doel.
    3. Genereer een zeer korte titel (max 6 woorden) die dit leerdoel samenvat voor op een dashboard.
    
    Geef antwoord in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSmart: { type: Type.BOOLEAN },
            shortTitle: { type: Type.STRING, description: "Korte samenvattende titel voor dashboard (max 6 woorden)." },
            feedback: { type: Type.STRING, description: "Feedback op SMART en de strategie-keuze + de kritische vraag." },
            suggestion: { type: Type.STRING },
            strategyAdvice: { type: Type.STRING, description: "Kort advies over hoe deze strategie het beste toe te passen." }
          },
          required: ["isSmart", "shortTitle", "feedback", "suggestion"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SmartGoalAnalysis;
    }
    throw new Error("Geen antwoord van AI");
  } catch (error) {
    console.error("AI Goal Analysis Error:", error);
    return {
      isSmart: false,
      shortTitle: goal.split(' ').slice(0, 5).join(' ') + '...',
      feedback: "Kan geen verbinding maken. Is je API key correct ingesteld?",
      suggestion: goal
    };
  }
};

export const getPlanningTips = async (goal: string, strategy: LearningStrategy): Promise<string[]> => {
  const prompt = `
    De student wil zelf een planning maken voor doel: "${goal}".
    Strategie: ${strategy}.
    
    Geef 3 korte, concrete suggesties voor studie-activiteiten.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return ["Lees de tekst globaal door", "Maak aantekeningen", "Herhaal hardop"];
  } catch (error) {
    return [];
  }
};

export const analyzePlan = async (goal: string, plan: PlanStep[], strategy: LearningStrategy): Promise<PlanAnalysis> => {
  const planText = plan.map(p => `- ${p.description} (${p.durationMinutes} min)`).join("\n");
  
  const prompt = `
    Fase: Planning Check.
    Doel: "${goal}".
    Strategie: ${strategy}.
    Huidige planning van student:
    ${planText}

    Jouw taak: Wees een KRITISCHE coach.
    1. Kwantiteit: Zijn er genoeg stappen? (Bijv: alleen 'lezen' is te weinig, minimaal 3 stappen verwacht).
    2. Kwaliteit: Zijn de stappen specifiek genoeg? (Bijv: 'leren' is te vaag, welk hoofdstuk? welke methode?).
    3. Betekenisvol: Dragen ze echt bij aan het doel?
    4. Haalbaarheid: Is de tijd realistisch?

    Als de planning te mager, te vaag of te kort is, zet isValid op false.
    Geef in 'feedback' streng maar rechtvaardig commentaar.
    Geef in 'tip' 2 concrete, actiegerichte suggesties voor EXTRA stappen die nu ontbreken.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING, description: "Kritische feedback op de huidige stappen." },
            tip: { type: Type.STRING, description: "Concrete suggesties voor ontbrekende stappen." }
          },
          required: ["isValid", "feedback", "tip"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PlanAnalysis;
    }
    throw new Error("Geen antwoord");
  } catch (error) {
    return {
      isValid: true,
      feedback: "Ziet eruit als een begin. Controleer zelf of je niets vergeet.",
      tip: "Zorg dat je voldoende pauzes neemt."
    };
  }
};

export const getMotivationBoost = async (goal: string, mood: number): Promise<string> => {
  const prompt = `
    Student motivatie cijfer: ${mood}/10. Doel: "${goal}".
    Geef een hele korte (max 15 woorden), enthousiaste 'speech bubble' reactie als coach.
    Bij laag cijfer: focus op 'je kunt het'.
    Bij hoog cijfer: focus op 'lekker bezig'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Zet hem op! Je kunt dit.";
  } catch (error) {
    return "Succes! Je kunt het.";
  }
};

export const analyzeReflection = async (goal: string, reflection: string, strategy: string): Promise<string> => {
  const prompt = `
    Fase: Reflectie.
    Doel was: "${goal}".
    Gebruikte strategie: "${strategy}".
    Ingevulde reflectie: "${reflection}".
    
    Jouw rol: Coach (Avatar).
    Schrijf een korte reactie (max 50 woorden) voor in een spreekwolkje.
    1. Geef een compliment over het reflecteren zelf.
    2. Geef 1 krachtig advies voor de volgende keer (Adaptive Inference).
    Spreek direct tegen de student.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Goed gereflecteerd. Neem deze inzichten mee naar je volgende leersessie!";
  } catch (error) {
    return "Reflectie opgeslagen. Goed gedaan.";
  }
};