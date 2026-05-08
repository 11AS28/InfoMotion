import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../components_css/QuizModal.css'; // Creează și acest fișier pentru stil

function QuizModal({ isOpen, onClose, lectie, onSucces }) {
  const { verificaProblemaCodeforces, marcheazaLectieTerminata } = useAuth();
  const [pas, setPas] = useState(1); // 1 pentru Quiz, 2 pentru Codeforces
  const [raspunsuri, setRaspunsuri] = useState({});
  const [quizFinalizat, setQuizFinalizat] = useState(false);
  const [verificandCF, setVerificandCF] = useState(false);

  if (!isOpen || !lectie) return null;

  const handleRaspuns = (intrebareId, indexOptiune) => {
    setRaspunsuri({ ...raspunsuri, [intrebareId]: indexOptiune });
  };

  const verificaQuiz = () => {
    const scor = lectie.quiz.reduce((acc, q) => {
      return acc + (raspunsuri[q.id] === q.corect ? 1 : 0);
    }, 0);

    if (scor === lectie.quiz.length) {
      setQuizFinalizat(true);
      setPas(2); // Trecem la pasul Codeforces
    } else {
      alert(`Ai greșit ${lectie.quiz.length - scor} întrebări. Mai încearcă!`);
    }
  };

  const handleVerificaCF = async () => {
    setVerificandCF(true);
    const rezolvata = await verificaProblemaCodeforces(lectie.codeforcesId);
    setVerificandCF(false);

    if (rezolvata) {
      await marcheazaLectieTerminata(lectie.id);
      onSucces(); // Închide modalul și dă refresh la UI
      alert("Felicitări! Lecție finalizată 100%!");
    } else {
      alert("Nu am găsit problema rezolvată pe Codeforces cu statusul 'OK'. Asigură-te că ai dat submit!");
    }
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        {pas === 1 ? (
          <div className="quiz-content">
            <h2>Test de verificare: {lectie.titlu}</h2>
            <p>Răspunde corect la toate întrebările (60% din progres)</p>
            {lectie.quiz.map((q) => (
              <div key={q.id} className="question-block">
                <p>{q.intrebare}</p>
                <div className="options">
                  {q.optiuni.map((opt, idx) => (
                    <button 
                      key={idx} 
                      className={`opt-btn ${raspunsuri[q.id] === idx ? 'selected' : ''}`}
                      onClick={() => handleRaspuns(q.id, idx)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="submit-btn" onClick={verificaQuiz}>Verifică Teoria</button>
          </div>
        ) : (
          <div className="cf-content">
            <h2>Pasul 2: Demonstrația Practică</h2>
            <p>Pentru a termina lecția, rezolvă problema pe Codeforces:</p>
            <a href={`https://codeforces.com/problemset/problem/${lectie.codeforcesId.slice(0,-1)}/${lectie.codeforcesId.slice(-1)}`} target="_blank" rel="noreferrer" className="cf-link">
              Problema Codeforces {lectie.codeforcesId}
            </a>
            <button 
              className="verify-cf-btn" 
              onClick={handleVerificaCF} 
              disabled={verificandCF}
            >
              {verificandCF ? "Se verifică..." : "Am rezolvat problema!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizModal;