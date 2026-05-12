import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../components_css/QuizModal.css';


function QuizModal({ lessonId, quizData, cfData, onClose, onFinished }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1); 
  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [isQuizChecked, setIsQuizChecked] = useState(false);
  const [cfLoading, setCfLoading] = useState(false);

  // Calculăm scorul


// Câte răspunsuri au fost selectate (indiferent dacă-s corecte sau nu)
const answeredCount = answers.filter(ans => ans !== null).length;

// Calculăm și scorul corect pentru validarea de la final
const score = answers.filter((ans, idx) => ans === quizData[idx].corect).length;

  const isPerfect = score === quizData.length;

  const handleSelect = (qIdx, vIdx) => {
    if (isQuizChecked) return;
    const newAns = [...answers];
    newAns[qIdx] = vIdx;
    setAnswers(newAns);
  };
   

  const handleCheckQuiz = () => {
    if (answers.includes(null)) return alert("Răspunde la toate întrebările!");
    setIsQuizChecked(true);
  };

  // FUNCȚIA DE RESET (Nouă)
  const resetQuiz = () => {
    setAnswers(Array(5).fill(null));
    setIsQuizChecked(false);
  };

  const verifyCF = async () => {
    if (!currentUser?.codeforcesHandle) return alert("Setează-ți handle-ul în profil!");
    setCfLoading(true);
    try {
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${currentUser.codeforcesHandle}&from=1&count=50`);
      const data = await res.json();
      if (data.status === "OK") {
        const solved = data.result.filter(s => s.verdict === "OK").map(s => `${s.contestId}/${s.problem.index}`);
        if (cfData.every(id => solved.includes(id))) {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, { lectiiTerminate: arrayUnion(lessonId) });
          onFinished(); 
        } else {
          alert("Încă nu ai rezolvat ambele probleme pe Codeforces!");
        }
      }
    } catch (e) { alert("Eroare la verificarea Codeforces."); }
    setCfLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-x" onClick={onClose}>&times;</button>
        
        {step === 1 ? (
          <div className="quiz-step">
            <h3>🧠 Pasul 1: Quiz ({answeredCount}/{quizData.length})</h3>
            {quizData.map((q, qIdx) => (
              <div key={qIdx} className="q-block">
                <p><strong>{qIdx + 1}. {q.intrebare}</strong></p>
                <div className="v-grid">
                  {q.variante.map((v, vIdx) => {
                    let btnClass = "v-btn";
                    if (isQuizChecked) {
                      if (vIdx === q.corect) btnClass += " correct";
                      else if (answers[qIdx] === vIdx) btnClass += " wrong";
                    } else if (answers[qIdx] === vIdx) {
                      btnClass += " sel";
                    }
                    return (
                      <button 
                        key={vIdx} 
                        className={btnClass}
                        onClick={() => handleSelect(qIdx, vIdx)}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* LOGICA DE BUTOANE DUPĂ VERIFICARE */}
            {!isQuizChecked ? (
              <button className="main-action-btn" onClick={handleCheckQuiz}>Verifică Răspunsurile</button>
            ) : (
              <div className="quiz-results-actions">
                {isPerfect ? (
                  <button className="main-action-btn next" onClick={() => setStep(2)}>
                    Excelent! Mergi la Codeforces →
                  </button>
                ) : (
                  <div style={{textAlign: 'center'}}>
                    <p style={{color: '#fa5252', fontWeight: 'bold', marginTop: '10px'}}>
                      Ai greșit {quizData.length - score} întrebări. Trebuie să răspunzi corect la toate!
                    </p>
                    <button className="main-action-btn retry" onClick={resetQuiz} style={{background: '#fa5252'}}>
                      Reîncearcă Quiz-ul ↻
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="cf-step">
            {/* ... restul codului de Codeforces rămâne neschimbat ... */}
            <h3>🚀 Pasul 2: Practică Codeforces</h3>
            <div className="cf-list">
              {cfData.map((id, i) => (
                <div key={i} className="cf-card">
                  <span>Problema {id}</span>
                  <a href={`https://codeforces.com/problemset/problem/${id}`} target="_blank" rel="noreferrer">Deschide Problema ↗</a>
                </div>
              ))}
            </div>
            <button className="main-action-btn" onClick={verifyCF} disabled={cfLoading}>
              {cfLoading ? "Se verifică..." : "Verifică Finalizarea Lecției"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizModal;