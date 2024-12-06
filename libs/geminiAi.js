import { GoogleGenerativeAI } from "@google/generative-ai";

const token = process.env.TOKENAPI;

const genAI = new GoogleGenerativeAI(token);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const geminiAI = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export default geminiAI;
