import { GoogleGenAI, Modality } from "https://esm.run/@google/genai";

// ============================
// CONFIGURACIÓN
// ============================

// API Gemini para chat
const ai = new GoogleGenAI({
  apiKey: "AIzaSyA-2MswbH_N3R1RmxBCDQZn76NzzE68YPQ"
});

// API Gemini para video
const aiVideo = new GoogleGenAI({
  apiKey: "AIzaSyA-2MswbH_N3R1RmxBCDQZn76NzzE68YPQ"
});

// API Gemini Live para audio
const aiLive = new GoogleGenAI({
  apiKey: "AIzaSyA-2MswbH_N3R1RmxBCDQZn76NzzE68YPQ"
});

// ============================
// CHAT
// ============================
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

// ============================
// VIDEO
// ============================
document.getElementById("crearVideo").addEventListener("click", async () => {
  const prompt = document.getElementById("videoPrompt").value;
  const div = document.getElementById("videoRespuesta");
  div.textContent = "⏳ Generando video...";

  try {
    let operation = await aiVideo.models.generateVideos({
      model: "veo-3.0-generate-preview",
      prompt: prompt,
    });

    // Esperar hasta que termine
    while (!operation.done) {
      div.textContent = "⏳ Esperando que el video esté listo...";
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await aiVideo.operations.getVideosOperation({
        operation: operation,
      });
    }

    // Mostrar el video generado
    const videoUrl = operation.response.generatedVideos[0].video.uri;
    div.innerHTML = `
      <p>🎬 Video generado:</p>
      <video controls width="400">
        <source src="${videoUrl}" type="video/mp4">
        Tu navegador no soporta video.
      </video>
    `;
  } catch (error) {
    div.textContent = "❌ Error: " + error.message;
  }
});

// ============================
// API LIVE (Audio en tiempo real)
// ============================

// Configuración del modelo en vivo
const modelLive = "gemini-2.5-flash-preview-native-audio-dialog";

async function startLive() {
  const responseQueue = [];

  async function waitMessage() {
    let done = false;
    let message = undefined;
    while (!done) {
      message = responseQueue.shift();
      if (message) {
        done = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    return message;
  }

  const session = await aiLive.live.connect({
    model: modelLive,
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: "You are a helpful assistant that answers in audio.",
    },
    callbacks: {
      onopen: function () {
        console.log("🔵 Sesión en vivo iniciada");
      },
      onmessage: function (message) {
        console.log("📩 Mensaje en vivo recibido:", message);
        responseQueue.push(message);
      },
      onerror: function (e) {
        console.error("❌ Error en live:", e.message);
      },
      onclose: function (e) {
        console.log("🔴 Sesión cerrada:", e.reason);
      },
    },
  });

  // Ejemplo: enviar un archivo de audio WAV
  const fileBuffer = await fetch("sample.wav").then(res => res.arrayBuffer());
  const base64Audio = btoa(
    String.fromCharCode(...new Uint8Array(fileBuffer))
  );

  session.sendRealtimeInput({
    audio: {
      data: base64Audio,
      mimeType: "audio/pcm;rate=16000",
    },
  });

  // Esperar respuesta
  const message = await waitMessage();
  console.log("🎧 Respuesta de Gemini Live:", message);
}

// Botón para iniciar Live
document.getElementById("iniciarLive").addEventListener("click", () => {
  startLive();
});
