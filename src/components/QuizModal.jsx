import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../components_css/QuizModal.css';

function QuizModal({ lessonId, quizData, onClose, onFinished }) {
  const [answers, setAnswers] = useState(Array(quizData.length).fill(null));
  const [isQuizChecked, setIsQuizChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser, acordaPuncte, scadeInima } = useAuth();

  // Păstrăm inima sincronizată cu ce are userul în momentul deschiderii
  const [localHearts, setLocalHearts] = useState(currentUser?.hearts ?? 3);

  const answeredCount = answers.filter(ans => ans !== null).length;
  const score = answers.filter((ans, idx) => ans === quizData[idx].corect).length;
  const isPerfect = score === quizData.length;

  const handleSelect = (qIdx, vIdx) => {
    if (isQuizChecked) return;
    const newAns = [...answers];
    newAns[qIdx] = vIdx;
    setAnswers(newAns);
  };

  const resetQuiz = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    try {
      await scadeInima(1);
      setLocalHearts(prev => Math.max(0, prev - 1));
      
      setAnswers(Array(quizData.length).fill(null));
      setIsQuizChecked(false);
    } catch (error) {
      console.error("Eroare la procesarea reîncercării:", error);
    }
    setLoading(false);
  };

  const handleFinalizeLesson = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { 
        lectiiTerminate: arrayUnion(lessonId) 
      });
      await acordaPuncte('quiz'); 
      onFinished(); 
    } catch (err) {
      alert("Eroare la salvarea progresului: " + err.message);
    }
    setLoading(false);
  };

  const handleCheckQuiz = async (e) => {
    if (e) e.preventDefault();
    if (isQuizChecked || loading) return;
    
    if (answers.includes(null)) 
      return alert("Răspunde la toate întrebările!");

    if (localHearts <= 0) {
      alert("Nu mai ai inimi active! Cumpără un Refill din Marketplace sau așteaptă 24h.");
      return;
    }

    setIsQuizChecked(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" className="close-x" onClick={onClose}>&times;</button>
        
        <div className="quiz-step">
          <h3>Quiz Finalizare ({answeredCount}/{quizData.length})</h3>
          <p>Finalizează lecția pentru a primi cele 10 puncte!</p>
          <p>Dacă răspunzi greșit, vei pierde o inimă când reîncepi testul.</p>
          <br />
          
          <div className="hearts-indicator" style={{ fontSize: '18px', marginBottom: '15px', textAlign: 'left' }}>
            Inimi rămase: {Array.from({ length: Math.max(0, localHearts) }).map((_, i) => (
              <span key={i} style={{ color: '#fa5252', marginRight: '4px' }}>❤️</span>
            ))}
            {localHearts <= 0 && <span style={{ color: '#fa5252', fontWeight: 'bold' }}>💔 Ai rămas fără inimi!</span>}
          </div>

          {localHearts <= 0 && !isQuizChecked ? (
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(250, 82, 82, 0.1)', borderRadius: '8px' }}>
              <p style={{ color: '#fa5252', fontWeight: 'bold' }}>
                Nu mai poți continua acest quiz deoarece ai 0 inimi. 
              </p>
              <button type="button" className="main-action-btn" onClick={onClose} style={{ background: '#555', marginTop: '10px' }}>
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
                        else btnClass += " disabled";
                      } else if (answers[qIdx] === vIdx) {
                        btnClass += " sel";
                      }

                      return (
                        <button 
                          key={vIdx} 
                          type="button"
                          className={btnClass}
                          onClick={() => handleSelect(qIdx, vIdx)}
                          disabled={isQuizChecked || loading}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!isQuizChecked ? (
                <button type="button" className="main-action-btn" onClick={handleCheckQuiz} disabled={loading}>
                  {loading ? "Se verifică..." : "Verifică Răspunsurile"}
                </button>
              ) : (
                <div className="quiz-results-actions" style={{ marginTop: '20px', padding: '15px', background: '#1e1e24', borderRadius: '8px' }}>
                  {isPerfect ? (
                    <button 
                      type="button"
                      className="main-action-btn next" 
                      onClick={handleFinalizeLesson}
                      disabled={loading}
                    >
                      {loading ? "Se salvează..." : "Perfect! Finalizează Lecția 🎉"}
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ color: '#fa5252', margin: '0 0 5px 0' }}>Revizuire Test Eșuat</h4>
                      <p style={{ color: '#eee', fontSize: '15px', marginBottom: '15px' }}>
                        Ai răspuns corect la {score} din {quizData.length} întrebări. Analizează greșelile marcate mai sus, apoi apasă butonul pentru a încerca din nou în schimbul unei inimi.
                      </p>
                      
                      {localHearts > 0 ? (
                        <button 
                          type="button" 
                          className="main-action-btn retry" 
                          onClick={resetQuiz} 
                          disabled={loading}
                          style={{ background: '#fa5252', width: '100%' }}
                        >
                          {loading ? "Se procesează..." : "Reîncearcă Quiz-ul ↻"}
                        </button>
                      ) : (
                        <div style={{ color: '#fa5252', fontWeight: 'bold', fontSize: '14px' }}>
                          ⚠️ Nu mai poți reîncepe acum deoarece ai 0 inimi. Mergi în Marketplace!
                        </div>
                      )}
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