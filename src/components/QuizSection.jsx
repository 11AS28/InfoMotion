import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

function QuizSection({ lessonId, quizData, cfData }) {
  const { currentUser } = useAuth();
  const [userAnswers, setUserAnswers] = useState(Array(5).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [cfStatus, setCfStatus] = useState([null, null]);
  const [loadingCf, setLoadingCf] = useState(false);

  // Verificăm dacă avem datele necesare, altfel nu afișăm nimic (previne crash)
  if (!quizData || quizData.length === 0) return <p>Se încarcă quiz-ul...</p>;

  const handleSelect = (qIdx, vIdx) => {
    if (showResults) return;
    const newAns = [...userAnswers];
    newAns[qIdx] = vIdx;
    setUserAnswers(newAns);
  };

  const handleVerifyQuiz = () => {
    if (userAnswers.includes(null)) return alert("Răspunde la toate întrebările!");
    setShowResults(true);
  };

  const handleVerifyCodeforces = async () => {
    if (!currentUser?.codeforcesHandle) {
      return alert("Setează-ți Codeforces Handle în profil mai întâi!");
    }
    setLoadingCf(true);
    try {
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${currentUser.codeforcesHandle}&from=1&count=50`);
      const data = await res.json();
      
      if (data.status === "OK") {
        const solvedIDs = data.result
          .filter(s => s.verdict === "OK")
          .map(s => `${s.contestId}/${s.problem.index}`);

        const results = cfData.map(id => solvedIDs.includes(id) ? 'OK' : 'MISSING');
        setCfStatus(results);

        if (results.every(r => r === 'OK')) {
          // SALVARE ÎN FIREBASE
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            lectiiTerminate: arrayUnion(lessonId)
          });
          alert("Lecție completată cu succes! 🎉");
        } else {
          alert("Mai ai probleme de rezolvat pe Codeforces!");
        }
      }
    } catch (e) {
      alert("Eroare la verificarea Codeforces.");
    }
    setLoadingCf(false);

    if (results.every(r => r === 'OK')) {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        lectiiTerminate: arrayUnion(lessonId)
      });
      
      alert("Lecție completată cu succes! 🎉");
      
      // AICI E CHEIA: Apelăm funcția primită de la părinte
      if (onComplete) onComplete(); 
    }
  };

  return (
    <div className="quiz-container" style={{marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '12px'}}>
      <h2 style={{color: '#333'}}>🧠 Quiz & Practică</h2>
      <hr />

      {/* QUIZ RENDER */}
      {quizData.map((q, qIdx) => (
        <div key={qIdx} style={{marginBottom: '20px', textAlign: 'left'}}>
          <p><strong>{qIdx + 1}. {q.intrebare}</strong></p>
          <div style={{display: 'grid', gap: '10px'}}>
            {q.variante.map((v, vIdx) => {
              let color = "#fff";
              if (showResults) {
                if (vIdx === q.corect) color = "#d4edda"; // Verde
                else if (userAnswers[qIdx] === vIdx) color = "#f8d7da"; // Rosu
              } else if (userAnswers[qIdx] === vIdx) {
                color = "#e2e3e5"; // Selectat
              }
              return (
                <button 
                  key={vIdx}
                  onClick={() => handleSelect(qIdx, vIdx)}
                  style={{padding: '10px', background: color, border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', textAlign: 'left'}}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!showResults ? (
        <button className="admin-btn-primary" onClick={handleVerifyQuiz}>Verifică Quiz</button>
      ) : (
        <div style={{marginTop: '30px', padding: '20px', background: '#fff', border: '2px dashed #378ADD'}}>
          <h3>🚀 Pasul 2: Probleme Codeforces</h3>
          <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
            {cfData.map((id, i) => (
              <div key={i} style={{flex: 1, padding: '10px', border: '1px solid #eee'}}>
                <span>Problemă: <strong>{id}</strong></span>
                <p>Status: {cfStatus[i] === 'OK' ? '✅ Rezolvată' : '❌ Neterminată'}</p>
              </div>
            ))}
          </div>
          <button 
            className="admin-btn-primary" 
            onClick={handleVerifyCodeforces} 
            disabled={loadingCf}
          >
            {loadingCf ? 'Se verifică...' : 'Verifică Finalizarea Lecției'}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizSection;