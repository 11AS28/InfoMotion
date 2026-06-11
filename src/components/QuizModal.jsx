import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../components_css/QuizModal.css';

function QuizModal({ lessonId, quizData, onClose, onFinished }) {
  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [isQuizChecked, setIsQuizChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser, acordaPuncte, scadeInima } = useAuth();

  // O singură sursă de adevăr pentru inimi, cu fallback stabil la 3
  const inimiCurente = currentUser?.hearts ?? 3;

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

  const handleCheckQuiz = async () => {
    if (answers.includes(null)) 
      return alert("Răspunde la toate întrebările!");

    if (inimiCurente <= 0) {
      alert("Nu mai ai inimi active! Cumpără un Refill din Marketplace sau așteaptă 24h.");
      return;
    }

    setIsQuizChecked(true);

    const gresite = quizData.length - answers.filter((ans, idx) => ans === quizData[idx].corect).length;

    if (gresite > 0) {
      await scadeInima(1); 
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <div className="quiz-step">
          <h3>Quiz Finalizare ({answeredCount}/{quizData.length})</h3>
          <p>Finalizeaza lecția pentru a primi cele 10 puncte!</p>
          <p>Daca răspunzi greșit, vei pierde o inimă. Fiecare inima se regenereaza la 24h.</p>
          <br />
          <div className="hearts-indicator" style={{ fontSize: '18px', marginBottom: '15px', textAlign: 'left' }}>
            Inimi rămase: {Array.from({ length: Math.max(0, inimiCurente) }).map((_, i) => (
              <span key={i} style={{ color: '#fa5252', marginRight: '4px', textAlign: 'left' }}>❤️</span>
            ))}
            {inimiCurente <= 0 && <span style={{ color: '#fa5252', fontWeight: 'bold' }}>💔 Ai rămas fără inimi!</span>}
          </div>

          {inimiCurente <= 0 ? (
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(250, 82, 82, 0.1)', borderRadius: '8px' }}>
              <p style={{ color: '#fa5252', fontWeight: 'bold' }}>
                Nu mai poți continua acest quiz deoarece ai 0 inimi. 
              </p>
              <p style={{ fontSize: '14px', color: '#aaa' }}>
                Mergi în Marketplace pentru un Refill sau așteaptă regenerarea de 24h!
              </p>
              <button className="main-action-btn" onClick={onClose} style={{ background: '#555', marginTop: '10px' }}>
                Închide Quiz-ul
              </button>
            </div>
          ) : (
            <>
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
                      {loading ? "Se salvează..." : "Felicitări! Finalizează Lecția "}
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
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default QuizModal;