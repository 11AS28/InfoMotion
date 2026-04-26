import React, { useState, useEffect } from 'react';
import '../animatii_css/CautareBinaraAnim.css';

function CautareBinaraAnim() {
  // Vector mai lung, iar ținta este 45 (care necesită mai mulți pași pentru a fi găsită)
  const array = [2, 5, 8, 12, 16, 23, 38, 45, 56];
  const target = 45;

  const [st, setSt] = useState(0);
  const [dr, setDr] = useState(array.length - 1);
  const [m, setM] = useState(Math.floor((array.length - 1) / 2));
  
  // status: "idle" (înainte de start), "running" (rulează), "found", "not_found"
  const [status, setStatus] = useState("idle");
  const [stepMessage, setStepMessage] = useState("Apasă 'Începe Animația' pentru a urmări cum se înjumătățește vectorul.");

  // Folosim useEffect pentru a rula algoritmul automat, pas cu pas, odată ce statusul este "running"
  useEffect(() => {
    let timer;
    
    if (status === "running") {
      // Setăm un timer care execută logica algoritmului o dată la 2 secunde (2000 ms)
      timer = setTimeout(() => {
        
        if (st <= dr) {
          const currentMid = Math.floor((st + dr) / 2);
          setM(currentMid);

          // Cazul 1: Am găsit elementul
          if (array[currentMid] === target) {
            setStatus("found");
            setStepMessage(`[PAS FINAL] Elementul din mijloc este ${array[currentMid]}. Deoarece ${array[currentMid]} == ${target}, l-am găsit la indexul ${currentMid}!`);
          } 
          // Cazul 2: Elementul e mai mare (căutăm în dreapta)
          else if (target > array[currentMid]) {
            const newSt = currentMid + 1;
            setStepMessage(`[PAS CURENT] Mijlocul este ${array[currentMid]}. Deoarece ${target} > ${array[currentMid]}, elementul trebuie să fie în dreapta. Mutăm stânga la indexul ${newSt}.`);
            // Actualizăm starea pentru următorul pas
            setSt(newSt);
          } 
          // Cazul 3: Elementul e mai mic (căutăm în stânga)
          else {
            const newDr = currentMid - 1;
            setStepMessage(`[PAS CURENT] Mijlocul este ${array[currentMid]}. Deoarece ${target} < ${array[currentMid]}, elementul trebuie să fie în stânga. Mutăm dreapta la indexul ${newDr}.`);
            // Actualizăm starea pentru următorul pas
            setDr(newDr);
          }
        } else {
          // Condiția de ieșire: st a depășit dr
          setStatus("not_found");
          setStepMessage(`[PAS FINAL] Interval invalid (st > dr). Elementul ${target} NU există în vector.`);
        }
        
      }, 2500); // 2.5 secunde pauză între pași ca elevul să apuce să citească
    }

    // Curățăm timer-ul la demontarea componentei sau la schimbarea stării
    return () => clearTimeout(timer);
  }, [status, st, dr, array, target]);


  const startAnimation = () => {
    if (status === "idle") {
      setStatus("running");
      setStepMessage(`Începem căutarea. Verificăm mijlocul intervalului inițial [0, 8].`);
    }
  };

  const resetAnimation = () => {
    setSt(0);
    setDr(array.length - 1);
    setM(Math.floor((array.length - 1) / 2));
    setStatus("idle");
    setStepMessage("Apasă 'Începe Animația' pentru a urmări cum se înjumătățește vectorul.");
  };

  const getBoxClass = (index) => {
    if (status === "found" && index === m) return "array-box found";
    
    // În modul "running" sau "idle", evidențiem mijlocul DOAR dacă e calculat corect
    if (status !== "idle" && index === m && status !== "not_found") return "array-box mid";
    
    if (index >= st && index <= dr) return "array-box active";
    
    return "array-box inactive";
  };

  return (
    <div className="cautare-binara-container">
      
      <div className="animation-header">
        <div className="target-info">
          Căutăm elementul: <strong>{target}</strong>
        </div>
      </div>

      <div className="array-container">
        {array.map((value, index) => (
          <div key={index} className="array-element-wrapper">
            
            <div className="pointer-container">
              {/* Afișăm pointerii doar în timpul rulării sau la final, pentru intervalul corect */}
              {index === st && status !== "idle" && status !== "not_found" && <span className="pointer st-pointer">st</span>}
              {index === dr && status !== "idle" && status !== "not_found" && <span className="pointer dr-pointer">dr</span>}
              {index === m && status !== "idle" && status !== "not_found" && <span className="pointer m-pointer">m</span>}
            </div>
            
            <div className={getBoxClass(index)}>
              {value}
            </div>
            
            <div className="index-label">{index}</div>
          </div>
        ))}
      </div>

      <div className={`message-box ${status === 'idle' ? 'running' : status}`}>
        {stepMessage}
      </div>

      <div className="controls">
        {status === "idle" ? (
          <button className="control-btn step-btn" onClick={startAnimation}>
            Începe Animația ▶
          </button>
        ) : (
          <button className="control-btn reset-btn" onClick={resetAnimation}>
            Resetează Animația 🔄
          </button>
        )}
      </div>

    </div>
  );
}

export default CautareBinaraAnim;