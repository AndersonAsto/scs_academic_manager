const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function generateStudentNarrative(studentData) {
    const {
        names,
        course,
        dailyAverage,
        practiceAverage,
        examAverage,
        attendanceAverage,
        blockAverage
    } = studentData;

    const prompt = `Eres un asistente educativo. Redacta un resumen breve
(3-4 oraciones, tono profesional y cercano, en español) sobre el desempeño
de un estudiante en un curso, dirigido a su apoderado.

No inventes datos que no se te dieron. No menciones información que aparezca
como "sin datos".

Estudiante: ${names}
Curso: ${course}
Promedio calificación diaria: ${dailyAverage ?? 'sin datos'}
Promedio prácticas: ${practiceAverage ?? 'sin datos'}
Promedio examen: ${examAverage ?? 'sin datos'}
Asistencia: ${
        attendanceAverage !== null && attendanceAverage !== undefined
            ? (attendanceAverage * 100).toFixed(0) + '%'
            : 'sin datos'
    }
Promedio del bloque: ${blockAverage ?? 'sin datos'}`;

    const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0.4,
        max_tokens: 200,
    });

    return completion.choices[0].message.content.trim();
}

module.exports = {
    generateStudentNarrative,
};