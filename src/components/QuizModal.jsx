import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../components_css/QuizModal.css';

function QuizModal({ lessonId, quizData, onClose, onFinished }) {
  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [isQuizChecked, setIsQuizChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser, acordaPuncte } = useAuth();


  const answeredCount = answers.filter(ans => ans !== null).length;
  const score = answers.filter((ans, idx) => ans === quizData[idx].corect).length;
  const isPerfect = score === quizData.length;

  const handleSelect = (qIdx, vIdx) => {
    if (isQuizChecked) return;
    const newAns = [...answers];
    newAns[qIdx] = vIdx;
    setAnswers(newAns);
  };

  const resetQuiz = () => {
    setAnswers(Array(5).fill(null));
    setIsQuizChecked(false);
  };

  const handleFinalizeLesson = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
     
      await updateDoc(userRef, { 
        lectiiTerminate: arrayUnion(lessonId) 
      });
      
      
      await acordaPuncte('quiz'); 
      
      
      onFinished(); 
    } catch (e) {
      alert("Eroare la salvarea progresului: " + e.message);
    }
    setLoading(false);
  };

  const handleCheckQuiz = () => {
    if (answers.includes(null)) return alert("Răspunde la toate întrebările!");
    setIsQuizChecked(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <div className="quiz-step">
          <h3>🧠 Quiz Finalizare ({answeredCount}/{quizData.length})</h3>
          
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

          {!isQuizChecked ? (
            <button className="main-action-btn" onClick={handleCheckQuiz}>
              Verifică Răspunsurile
            </button>
          ) : (
            <div className="quiz-results-actions">
              {isPerfect ? (
                <button 
                  className="main-action-btn next" 
                  onClick={handleFinalizeLesson}
                  disabled={loading}
                >
                  {loading ? "Se salvează..." : "Felicitări! Finalizează Lecția 🏆"}
                </button>
              ) : (
                <div style={{textAlign: 'center'}}>
                  <p style={{color: '#fa5252', fontWeight: 'bold', marginTop: '10px'}}>
                    Ai greșit {quizData.length - score} întrebări. Trebuie să răspunzi corect la toate pentru puncte!
                  </p>
                  <button className="main-action-btn retry" onClick={resetQuiz} style={{background: '#fa5252'}}>
                    Reîncearcă Quiz-ul ↻
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizModal;