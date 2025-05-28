import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import questionsData from "./lib/questions.json";
import { RadioGroup } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";

type Question = {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  image: string | null;
};

const LOCAL_STORAGE_KEY = "acertadasAnteriores";
const TOGGLE_KEY = "usarAcertosAnteriores";

// Utilitários para localStorage
const getPreviousCorrectQuestions = (): string[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const addCorrectQuestionToLocalStorage = (id: string) => {
  const current = getPreviousCorrectQuestions();
  if (!current.includes(id)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...current, id]));
  }
};

const removeCorrectQuestionFromLocalStorage = (id: string) => {
  const current = getPreviousCorrectQuestions();
  const updated = current.filter((item) => item !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

const App = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>(new Array(30).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [wrongQuestionsIndexes, setWrongQuestionsIndexes] = useState<number[]>([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const [usePreviousCorrect, setUsePreviousCorrect] = useState<boolean>(() => {
    const stored = localStorage.getItem(TOGGLE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  const toggleUsePreviousCorrect = () => {
    const newValue = !usePreviousCorrect;
    setUsePreviousCorrect(newValue);
    localStorage.setItem(TOGGLE_KEY, JSON.stringify(newValue));
  };

  const getRandomQuestions = () => {
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 30);
  };

  const getQuestionsIncludingWrongOnes = () => {
    const previousCorrectIds = getPreviousCorrectQuestions();

    const wrongQuestions = wrongQuestionsIndexes.map((index) => questions[index]);

    const usedIds = new Set(questions.map((q) => q._id));
    const wrongIds = new Set(wrongQuestions.map((q) => q._id));

    let candidates = [...questionsData].filter(
      (q) =>
        !wrongIds.has(q._id) &&
        !usedIds.has(q._id) &&
        (usePreviousCorrect || !previousCorrectIds.includes(q._id))
    );

    candidates = [...wrongQuestions, ...candidates.sort(() => 0.5 - Math.random())];

    return candidates.slice(0, 30).sort(() => 0.5 - Math.random());
  };

  const handleAnswerChange = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const wrongIndexes: number[] = [];
    let correctCount = 0;

    answers.forEach((answer, index) => {
      const question = questions[index];
      if (answer === question.correctIndex) {
        correctCount++;
        addCorrectQuestionToLocalStorage(question._id);
      } else {
        wrongIndexes.push(index);
        removeCorrectQuestionFromLocalStorage(question._id);
      }
    });

    setCorrectAnswersCount(correctCount);
    setWrongQuestionsIndexes(wrongIndexes);
    setSubmitted(true);

    alert(
      `Você acertou ${correctCount} de 30 perguntas! ${
        correctCount >= 21 ? "Parabéns, você está pronto!" : "Continue estudando!"
      }`
    );
  };

  const handleGenerateQuestions = () => {
    const randomQuestions = getRandomQuestions();
    setQuestions(randomQuestions);
    setAnswers(new Array(randomQuestions.length).fill(-1));
    setSubmitted(false);
    setWrongQuestionsIndexes([]);
  };

  const handleGenerateWithWrongQuestions = () => {
    const newQuestions = getQuestionsIncludingWrongOnes();
    setQuestions(newQuestions);
    setAnswers(new Array(newQuestions.length).fill(-1));
    setSubmitted(false);
  };

  useEffect(() => {
    handleGenerateQuestions();
  }, []);

  const isSubmitDisabled = answers.includes(-1);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Simulado DETRAN 2025</h1>

      {/* Toggle */}
      <div className="mb-4 flex items-center space-x-2">
        <input
          type="checkbox"
          id="usar-acertos-anteriores"
          checked={usePreviousCorrect}
          onChange={toggleUsePreviousCorrect}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="usar-acertos-anteriores" className="text-sm text-gray-900">
          Usar perguntas acertadas em simulados anteriores
        </label>
      </div>

      {questions.map((question, index) => {
        const previouslyCorrect = getPreviousCorrectQuestions().includes(question._id);

        return (
          <Card key={index} className="mb-4 p-4">
            <h2 className="text-xl mb-2">
              {index + 1}. {question.question}
            </h2>

            {previouslyCorrect && (
              <div className="text-sm text-green-600 mb-2">
                ✅ Você acertou essa pergunta em um simulado anterior
              </div>
            )}

            <RadioGroup
              value={answers[index].toString()}
              onValueChange={(value) => handleAnswerChange(index, parseInt(value))}
              className="space-y-2"
            >
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`question-${index}-option-${idx}`}
                    value={idx}
                    checked={answers[index] === idx}
                    onChange={() => handleAnswerChange(index, idx)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`question-${index}-option-${idx}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>

            {question.image && (
              <img
                src={question.image}
                alt="Ilustração da questão"
                className="mb-4 max-w-[220px] h-auto"
              />
            )}
          </Card>
        );
      })}

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-4 mt-4">
        <Button disabled={isSubmitDisabled} onClick={handleSubmit}>
          Enviar Respostas
        </Button>

        <Button onClick={handleGenerateQuestions}>
          Gerar Novas Perguntas
        </Button>

        {submitted && wrongQuestionsIndexes.length > 0 && (
          <Button onClick={handleGenerateWithWrongQuestions} variant="outline">
            Gerar Simulado com Questões Erradas ({wrongQuestionsIndexes.length})
          </Button>
        )}
      </div>

      {/* Resultado */}
      {submitted && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold">Resultado:</h2>
          <p>
            Você acertou {correctAnswersCount} de 30 perguntas (
            {Math.round((correctAnswersCount / 30) * 100)}%)
          </p>
          {wrongQuestionsIndexes.length > 0 && (
            <p className="mt-2">
              Você errou {wrongQuestionsIndexes.length} questões. Clique no botão acima para gerar
              um novo simulado incluindo essas questões.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
