import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import '../components_css/arena.css';

function Arena() {
  const { currentUser, acordaPuncte, verificaProblemaCodeforces } = useAuth();
  const [dailyProblem, setDailyProblem] = useState(null);
  const [solvers, setSolvers] = useState([]);
  const [isChecking, setIsChecking] = useState(false); // Pentru a bloca butonul pe durata verificării

  // Funcție sigură pentru a genera data (ex: 13_5_2026)
  const getSafeDateString = () => {
    const today = new Date();
    return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
  };

  useEffect(() => {
    const fetchArena = async () => {
      try {
        const dataAzi = getSafeDateString();
        const docRef = doc(db, 'dailyChallenges', dataAzi);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          // Problema a fost deja aleasă astăzi de un alt utilizator
          setDailyProblem(docSnap.data());
          setSolvers(docSnap.data().solvers || []);
        } else {
          // Nimeni nu a intrat azi. Alegem o problemă random de pe Codeforces!
          console.log("Generăm problema zilei din Codeforces...");
          
          const response = await fetch('https://codeforces.com/api/problemset.problems');
          const data = await response.json();
          
          if (data.status === 'OK') {
            const allProblems = data.result.problems;
            
            // Filtrăm problemele să nu fie nici prea grele, nici extrem de ciudate (rating între 800 și 1200)
            const easyProblems = allProblems.filter(p => p.rating >= 800 && p.rating <= 1200);
            
            // Alegem una la întâmplare
            const randomIndex = Math.floor(Math.random() * easyProblems.length);
            const chosenProblem = easyProblems[randomIndex];
            
            // Construim noul obiect pentru baza de date
            const idProblema = `${chosenProblem.contestId}${chosenProblem.index}`; // ex: 158A, 71A
            const newDailyProblem = {
              titlu: `${chosenProblem.name} (Rating: ${chosenProblem.rating})`,
              link: `https://codeforces.com/problemset/problem/${chosenProblem.contestId}/${chosenProblem.index}`,
              idCF: idProblema,
              solvers: [],
              data: dataAzi
            };
            
            // Salvăm în Firebase pentru toți ceilalți utilizatori de azi
            await setDoc(docRef, newDailyProblem);
            
            // Setăm în state-ul curent
            setDailyProblem(newDailyProblem);
            setSolvers([]);
          }
        }
      } catch (error) {
        console.error("Eroare la preluarea/generarea problemei:", error);
      }
    };
    
    fetchArena();
  }, []);

  const handleSolve = async () => {
    // 1. Verificăm dacă există o problemă azi
    if (!dailyProblem) return;

    // 2. Verificăm dacă userul a luat deja punctele ca să nu facă exploit
    const hasAlreadySolved = solvers.some(s => s.uid === currentUser.uid);
    if (hasAlreadySolved) {
      alert("Ai primit deja punctele pentru problema de azi!");
      return;
    }

    setIsChecking(true);
    try {
      const isGata = await verificaProblemaCodeforces(dailyProblem.idCF);
      
      if (isGata) {
        const tipPunctaj = solvers.length < 3 ? 'daily_sprinter' : 'daily_normal';
        
        await acordaPuncte(tipPunctaj);
        
        const nouSolver = { 
          nume: currentUser.nume, 
          uid: currentUser.uid, 
          ora: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) 
        };

        const dataAzi = getSafeDateString();
        await updateDoc(doc(db, 'dailyChallenges', dataAzi), {
          solvers: arrayUnion(nouSolver)
        });

        // Actualizăm starea locală ca să apară instant în listă fără refresh
        setSolvers(prev => [...prev, nouSolver]);
        alert("Felicitări! Punctele au fost adăugate.");
      } else {
        alert("Submisia nu a fost găsită sau nu este acceptată pe Codeforces.");
      }
    } catch (error) {
      console.error("Eroare la verificare:", error);
      alert("A apărut o eroare la verificare.");
    } finally {
      setIsChecking(false);
    }
    setLoading(false);
  };

  const idxLast = currentPage * solversPerPage;
  const idxFirst = idxLast - solversPerPage;
  const currentSolvers = solvers.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(solvers.length / solversPerPage);

    return (
      <div>
    <div className="arena-container">
      {dailyProblem ? (
        <>
          <h2>🚀 Problema Zilei: {dailyProblem.titlu}</h2>
          <a href={dailyProblem.link} target="_blank" rel="noopener noreferrer">
            Rezolvă pe Codeforces
          </a>
          <br />
          <button 
            onClick={handleSolve} 
            disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid)}
          >
            {isChecking ? "Se verifică..." : "Verifică Submisia"}
          </button>
        </>
      ) : (
        <h2>Nu a fost setată nicio problemă pentru astăzi! 😴</h2>
      )}

      <div className="solvers-list">
        <h3>Top 5 Solveri (Azi)</h3>
        {solvers.length > 0 ? (
          solvers.slice(0, 5).map((s, idx) => (
            /* Refolosim exact structura clasamentului */
            <div key={idx} className={`user-row ${idx === 0 ? 'rank-1' : ''}`}>
              <span className="rank">#{idx + 1}</span>
              <span className="username">{s.nume}</span>
              <span className="value">{s.ora}</span>
            </div>
          ))
        ) : (
          <p className="empty-solvers">Fii primul care rezolvă problema de azi!</p>
        )}
      </div>
    </div>
    </div>
  );
}

export default Arena;