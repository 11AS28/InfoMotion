import React, { useState, useEffect } from 'react'; // <-- Nu uita să adaugi useEffect aici!
import { useAuth } from '../context/AuthContext';
import '../components_css/QuizModal.css'; 
import { createPortal } from 'react-dom';

function QuizModal({ isOpen, onClose, lectie, onSucces }) {
  const { verificaProblemaCodeforces, marcheazaLectieTerminata } = useAuth();
  
  // Aici sunt state-urile tale
  const [pas, setPas] = useState(1); 
  const [raspunsuri, setRaspunsuri] = useState({});
  const [quizFinalizat, setQuizFinalizat] = useState(false);
  const [verificandCF, setVerificandCF] = useState(false);

  // --- AICI BAGI BLOCUL DE COD PENTRU SCROLL ---
  useEffect(() => {
    if (isOpen) {
      // Când modalul e deschis, ascundem bara de scroll a paginii
      document.body.style.overflow = 'hidden';
    } else {
      // Când se închide, o punem la loc
      document.body.style.overflow = 'unset';
    }

    // Funcție de curățare în caz că componenta se demontează brusc
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  // ---------------------------------------------

  if (!isOpen || !lectie) return null;

  const handleRaspuns = (indexIntrebare, indexOptiune) => {
    // Salvăm în state: { "0": 1, "1": 2 } 
    setRaspunsuri({ ...raspunsuri, [indexIntrebare]: indexOptiune });
  };

    const verificaQuiz = () => {
    // Adăugăm un array gol ca fallback dacă lectie.quiz e undefined
    const quizIntrebari = lectie.quiz || []; 

    if (quizIntrebari.length === 0) {
      alert("Această lecție nu are un quiz setat!");
      return;
    }

    const intrebariFaraRaspuns = quizIntrebari.filter(q => raspunsuri[q.id] === undefined);
    
    if (intrebariFaraRaspuns.length > 0) {
      alert("Te rugăm să răspunzi la toate întrebările înainte de a verifica!");
      return;
    }

    const scor = quizIntrebari.reduce((acc, q) => {
      // Folosim == în caz că indexul e String în baza de date
      return acc + (raspunsuri[q.id] == q.corect ? 1 : 0);
    }, 0);

    if (scor === quizIntrebari.length) {
      setQuizFinalizat(true);
      setPas(2); 
    } else {
      alert(`Ai greșit ${quizIntrebari.length - scor} întrebare/întrebări. Mai încearcă!`);
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

    const handleClose = () => {
    // Dacă utilizatorul a început să răspundă la ceva, dar nu a terminat quiz-ul
    const aInceputSaRaspunda = Object.keys(raspunsuri).length > 0;
    
    if (aInceputSaRaspunda && pas === 1 && !quizFinalizat) {
      const confirmare = window.confirm("Ești sigur că vrei să părăsești quiz-ul? Progresul tău nu va fi salvat!");
      if (!confirmare) {
        return; // Dacă dă "Cancel", ne oprim aici și nu închidem
      }
    }
    
    // Dacă ajunge aici (fie a dat OK, fie nu a răspuns la nimic, fie a terminat), îl închidem
    onClose();
  };

return createPortal(
    // Adăugăm onClick pe overlay, dar folosim handleClose ca să primească și el alerta de confirmare
    <div className="quiz-overlay" onClick={handleClose}>
      
      {/* Adăugăm e.stopPropagation() ca să NU se închidă dacă dă click pe conținutul alb */}
      <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>

      <button className="close-btn" onClick={handleClose}>&times;</button>
        
        {pas === 1 ? (
          <div className="quiz-content">
            <h2>Test de verificare: {String(lectie.titlu)}</h2>
            <p>Răspunde corect la toate întrebările (60% din progres)</p>
                        {/* Schimbăm lectie.quiz.map în lectie.quiz?.map */}
            {lectie.quiz?.map((q) => (
              <div key={q.id} className="question-block">
                <p>{q.intrebare}</p>
                <div className="options">
                  
                  {/* Schimbăm q.optiuni.map în q.optiuni?.map */}
                  {q.optiuni?.map((opt, idx) => (
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
    </div>, document.body
  ) ;
}

export default QuizModal;