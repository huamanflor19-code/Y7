import { GoogleGenAI } from "https://esm.run/@google/genai";

const ai = new GoogleGenAI({
  apiKey: "TU_API_KEY_AQUI" // 👈 inseguro en producción
});

document.getElementById("enviar").addEventListener("click", async () => {
  const pregunta = document.getElementById("prompt").value;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: pregunta,
  });

  document.getElementById("respuesta").textContent = response.text;
});
