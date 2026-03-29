import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following text or claim for misinformation. Act as VeraCT Scan, a system that uses fact extraction, intelligent search, credibility analysis, and reasoning to determine the truth.

Text to analyze:
"${text}"`,
      config: {
        systemInstruction: "You are VeraCT Scan, an advanced AI-powered fake news detector. You use Retrieval-Augmented Verification to extract facts, simulate web searches for corroboration, analyze source credibility, and provide transparent reasoning for your verdicts.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: "The final verdict: 'True', 'Fake', 'Misleading', or 'Unverified'.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score from 0 to 100.",
            },
            reasoning: {
              type: Type.STRING,
              description: "Transparent reasoning explaining how the verdict was reached.",
            },
            extractedFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Core factual claims extracted from the text.",
            },
            credibilityAnalysis: {
              type: Type.STRING,
              description: "Evaluation of the trustworthiness of the sources or the nature of the claim.",
            },
          },
          required: ["verdict", "confidence", "reasoning", "extractedFacts", "credibilityAnalysis"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(resultText);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 });
  }
}
