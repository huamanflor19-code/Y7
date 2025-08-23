import { GoogleGenAI } from "https://esm.run/@google/genai";

// ✅ Gemini para chat
const ai = new GoogleGenAI({
  apiKey: "AIzaSyDGOEA2AtjXUCKmO45RLr3t535438aFFsk"
});

// ✅ Gemini Veo para video
const aiVideo = new GoogleGenAI({
  apiKey: "AIzaSyDGOEA2AtjXUCKmO45RLr3t535438aFFsk"
});

// --- CHAT ---
document.getElementById("enviar").addEventListener("click", async () => {
  const pregunta = document.getElementById("prompt").value;

  document.getElementById("respuesta").textContent = "⏳ Esperando respuesta...";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: pregunta,
    });
    document.getElementById("respuesta").textContent = response.text;
  } catch (error) {
    document.getElementById("respuesta").textContent = "❌ Error: " + error.message;
  }
});

// --- VIDEO ---
document.getElementById("crearVideo").addEventListener("click", async () => {
  const prompt = document.getElementById("videoPrompt").value;
  const div = document.getElementById("videoRespuesta");
  div.textContent = "⏳ Generando video...";

  try {
    let operation = await aiVideo.models.generateVideos({
      model: "veo-3.0-generate-preview",
      prompt: prompt,
    });

    // Espera hasta que termine
    while (!operation.done) {
      div.textContent = "⌛ Esperando que el video esté listo...";
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await aiVideo.operations.getVideosOperation({
        operation: operation,
      });
    }

    // Muestra el video en la página
    const videoUrl = operation.response.generatedVideos[0].video.uri;
    div.innerHTML = `
      <p>✅ Video generado:</p>
      <video controls width="400">
        <source src="${videoUrl}" type="video/mp4">
        Tu navegador no soporta video.
      </video>
    `;
  } catch (error) {
    div.textContent = "❌ Error: " + error.message;
  }
});
