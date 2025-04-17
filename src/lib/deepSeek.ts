export async function fetchDetranQuestions() {
    const prompt = `
  Gere 30 perguntas de múltipla escolha sobre o DETRAN 2025.
  Cada pergunta deve ter:
  - Um enunciado claro.
  - 4 alternativas.
  - A informação de qual alternativa é a correta (índice de 0 a 3).
  
  Formato de resposta (em JSON):
  [
    {
      "question": "Qual a velocidade máxima permitida em vias urbanas?",
      "options": ["a: 30 km/h", "b: 50 km/h", "c: 60 km/h", "d: 80 km/h"],
      "correctIndex": 1
    },
    ...
  ]
  `;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      return JSON.parse(content);
    } catch (err) {
      console.error("Erro ao interpretar resposta do DeepSeek:", err);
      return [];
    }
}