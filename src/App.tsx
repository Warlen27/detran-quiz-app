// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import questionsData from "./lib/questions.json";
// import { RadioGroup } from "@/components/ui/radio-group";
// import { Card } from "@/components/ui/card";

// type Question = {
//   question: string;
//   options: string[];
//   correctIndex: number;
//   image: string | null;
// };

// const App = () => {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [answers, setAnswers] = useState<number[]>(new Array(30).fill(-1));
//   const [submitted, setSubmitted] = useState(false);

//   const getRandomQuestions = () => {
//     // Faz uma cópia do array de questões para não modificar o original
//     const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
//     // Seleciona as primeiras 30 questões do array embaralhado
//     return shuffled.slice(0, 30);
//   };

//   const handleAnswerChange = (index: number, value: number) => {
//     const newAnswers = [...answers];
//     newAnswers[index] = value;
//     setAnswers(newAnswers);
//   };

//   const handleSubmit = () => {
//     const correctAnswers = answers.filter(
//       (answer, index) => answer === questions[index]?.correctIndex
//     ).length;

//     setSubmitted(true);
//     alert(
//       `Você acertou ${correctAnswers} de 30 perguntas! ${correctAnswers >= 21
//         ? "Parabéns, você está pronto!"
//         : "Continue estudando!"
//       }`
//     );
//   };

//   const handleGenerateQuestions = () => {
//     const randomQuestions = getRandomQuestions();
//     console.log("🚀 ~ handleGenerateQuestions ~ randomQuestions:", randomQuestions)
//     setQuestions(randomQuestions);
//     setAnswers(new Array(randomQuestions.length).fill(-1));
//     setSubmitted(false);
//   };

//   useEffect(() => {
//     handleGenerateQuestions();
//   }, []);

//   const isSubmitDisabled = answers.includes(-1);

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Simulado DETRAN 2025</h1>

//       {questions.map((question, index) => (
//         <Card key={index} className="mb-4 p-4">
//           <h2 className="text-xl mb-2">{index + 1}. {question.question}</h2>
         
//           <RadioGroup
//             value={answers[index].toString()} // Convertendo para string se necessário
//             onValueChange={(value) => handleAnswerChange(index, parseInt(value))}
//             className="space-y-2"
//           >
//             {question.options.map((option, idx) => (
//               <div key={idx} className="flex items-center space-x-2">
//                 <input
//                   type="radio"
//                   id={`question-${index}-option-${idx}`}
//                   value={idx}
//                   checked={answers[index] === idx}
//                   onChange={() => handleAnswerChange(index, idx)}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500"
//                 />
//                 <label
//                   htmlFor={`question-${index}-option-${idx}`}
//                   className="ml-2 block text-sm text-gray-900"
//                 >
//                   {option}
//                 </label>
//               </div>
//             ))}
//           </RadioGroup>
//           {question.image && (
//             <img
//               src={question.image}
//               alt="Ilustração da questão"
//               className="mb-4 max-w-full h-auto"
//             />
//           )}
//         </Card>
//       ))}

//       <Button
//         disabled={isSubmitDisabled}
//         onClick={handleSubmit}
//         className="mt-4"
//       >
//         Enviar Respostas
//       </Button>

//       <Button onClick={handleGenerateQuestions} className="mt-4 ml-4">
//         Gerar Novas Perguntas
//       </Button>
//     </div>
//   );
// };

// export default App;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import questionsData from "./lib/questions.json";
import { RadioGroup } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  image: string | null;
};

const App = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>(new Array(30).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [wrongQuestionsIndexes, setWrongQuestionsIndexes] = useState<number[]>([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const getRandomQuestions = () => {
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 30);
  };

  const getQuestionsIncludingWrongOnes = () => {
    // Pega as questões que o usuário errou
    const wrongQuestions = wrongQuestionsIndexes.map(index => questions[index]);
    
    // Preenche o restante com novas questões aleatórias
    const remainingCount = 30 - wrongQuestions.length;
    const otherQuestions = [...questionsData]
      .filter(q => !wrongQuestions.includes(q))
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingCount);
    
    return [...wrongQuestions, ...otherQuestions].sort(() => 0.5 - Math.random());
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
      if (answer !== questions[index]?.correctIndex) {
        wrongIndexes.push(index);
      } else {
        correctCount++;
      }
    });

    setCorrectAnswersCount(correctCount);
    setWrongQuestionsIndexes(wrongIndexes);
    setSubmitted(true);
    
    alert(
      `Você acertou ${correctCount} de 30 perguntas! ${
        correctCount >= 21
          ? "Parabéns, você está pronto!"
          : "Continue estudando!"
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

      {questions.map((question, index) => (
        <Card key={index} className="mb-4 p-4">
          <h2 className="text-xl mb-2">
            {index + 1}. {question.question}
          </h2>
          {question.image && (
            <img
              src={question.image}
              alt="Ilustração da questão"
              className="mb-4 max-w-full h-auto"
            />
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
        </Card>
      ))}

      <div className="flex flex-wrap gap-4 mt-4">
        <Button
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
        >
          Enviar Respostas
        </Button>

        <Button onClick={handleGenerateQuestions}>
          Gerar Novas Perguntas
        </Button>

        {submitted && wrongQuestionsIndexes.length > 0 && (
          <Button 
            onClick={handleGenerateWithWrongQuestions}
            variant="outline"
          >
            Gerar Simulado com Questões Erradas ({wrongQuestionsIndexes.length})
          </Button>
        )}
      </div>

      {submitted && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold">Resultado:</h2>
          <p>
            Você acertou {correctAnswersCount} de 30 perguntas (
            {Math.round((correctAnswersCount / 30) * 100)}%)
          </p>
          {wrongQuestionsIndexes.length > 0 && (
            <p className="mt-2">
              Você errou {wrongQuestionsIndexes.length} questões. Clique no botão acima para gerar um novo simulado incluindo essas questões.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;