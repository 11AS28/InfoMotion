import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'sonner';
import { Swords, Code2, Trophy, Timer } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

function ArenaDuel() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { currentUser } = useAuth();

  // Luăm datele meciului trimise la navigare din Arena.jsx
  const matchData = location.state?.matchData;

  const [problem, setProblem] = useState(matchData?.problem || null);
  const [playerCode, setPlayerCode] = useState(matchData?.problem?.startingCode || "");
  const [opponentProgress, setOpponentProgress] = useState(0); // Procentaj sau teste trecute
  const [timeLeft, setTimeLeft] = useState(300); // 5 minute de meci (300 secunde)

  // Dacă cineva intră pe URL direct fără să treacă prin matchmaking, îl dăm afară
  useEffect(() => {
    if (!matchData) {
      toast.error("Nu ai un meci activ în această cameră!");
      navigate('/arena');
    }
  }, [matchData, navigate]);

  // Timer-ul meciului
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.info("Timpul a expirat!");
      // Aici vom pune logica de final de meci
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Ascultăm evenimentele din timpul meciului (ex: progresul oponentului)
  useEffect(() => {
    if (!socket) return;

    socket.on('opponent_updated_progress', (data) => {
      // Când oponentul trece teste, îi actualizăm progresul pe ecranul nostru
      setOpponentProgress(data.progress);
    });

    socket.on('duel_ended', (data) => {
      if (data.winner === socket.id) {
        toast.success("FELICITĂRI! Ai câștigat duelul! 🎉");
      } else {
        toast.error("Oponentul a rezolvat bug-ul înaintea ta. Ai pierdut! ⚔️");
      }
    });

    return () => {
      socket.off('opponent_updated_progress');
      socket.off('duel_ended');
    };
  }, [socket]);

  // 1. Adaugă acest useEffect în ArenaDuel.jsx pentru a trimite progresul când userul scrie cod
useEffect(() => {
  if (!socket || !problem) return;

  // Trimitem lungimea codului sau o logică simplă de progres către oponent
  // Pentru început, trimitem doar un semnal că scriem, ca oponentul să vadă progres live
  const procentProgres = Math.min(Math.floor((playerCode.length / problem.startingCode.length) * 100), 100);

  socket.emit('update_progress', {
    roomId,
    progress: procentProgres
  });
}, [playerCode, socket, roomId, problem]);




  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

 // 2. Înlocuiește vechea funcție handleRunCode cu asta:
const handleRunCode = async () => {
  if (!socket) return;

  const idToast = toast.loading("Se compilează și se rulează testele în sandbox...");

  try {
    // Trimitem codul către serverul tău de backend pentru a fi compilat și verificat pe teste
    // Folosim ruta pe care o ai deja în aplicație pentru rularea codului (ajustează URL-ul dacă e diferit)
    const response = await fetch('http://localhost:5000/api/run-cpp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: playerCode,
        roomId: roomId,
        userId: currentUser?.uid
      })
    });

    const data = await response.json();

    if (data.success && data.allTestsPassed) {
      toast.success("Toate testele au trecut! Trimitem rezultatul...", { id: idToast });
      
      // Anunțăm serverul prin WebSockets că am terminat cu succes problema!
      socket.emit('player_solved', { roomId });
    } else {
      // Dacă a picat testele sau are eroare de compilare
      toast.error(data.error || "Codul tău încă are bug-uri sau nu trece testele!", { id: idToast });
    }
  } catch (error) {
    console.error(error);
    toast.error("Eroare la conectarea cu sandbox-ul.", { id: idToast });
  }
};

  if (!problem) return <div style={{ color: '#fff', padding: '20px' }}>Se încarcă meciul...</div>;

  // Identificăm cine ești tu și cine e oponentul
  const esteP1 = matchData.players.p1.id === socket?.id;
  const eu = esteP1 ? matchData.players.p1 : matchData.players.p2;
  const oponent = esteP1 ? matchData.players.p2 : matchData.players.p1;

  return (
    usePageTitle("InfoMotion - Duel live"),
    <div className="arena-wrapper" style={{ padding: '20px', color: '#fff' }}>
      <Toaster position="top-center" richColors />
      <div className="arena-container">
        
        {/* Header-ul Duelului */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <Swords color="#e63946" /> {eu.username} vs {oponent.username}
            </h2>
            <p style={{ color: '#aaa', margin: '5px 0 0 0' }}>Cameră: {roomId}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#221515', padding: '10px 20px', borderRadius: '8px', border: '1px solid #832211' }}>
            <Timer color="#e63946" size={20} />
            <span style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Layout-ul pe două coloane: Stânga (Problemă + Progres), Dreapta (Editor de cod) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Coloana Stângă */}
          <div>
            <div style={{ background: '#120a0a', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '20px' }}>
              <h3>{problem.title}</h3>
              <p style={{ color: '#ccc', lineHeight: '1.6' }}>{problem.description}</p>
            </div>

            {/* Bara de progres live a oponentului */}
            <div style={{ background: '#120a0a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="#e3ad16" /> Progres Oponent ({oponent.username})
              </h4>
              <div style={{ background: '#222', height: '20px', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ background: '#e63946', width: `${opponentProgress}%`, height: '100%', transition: 'width 0.3s ease' }}></div>
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 'bold' }}>
                  {opponentProgress === 100 ? "A REZOLVAT!" : `${opponentProgress}% finalizat`}
                </span>
              </div>
            </div>
          </div>

          {/* Coloana Dreaptă (Zona de cod primitiv / editor) */}
          <div style={{ background: '#120a0a', padding: '20px', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexHeading: 'column', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 color="#832211" />
              <h4 style={{ margin: 0 }}>Repară codul C++ de mai jos:</h4>
            </div>
            
            {/* Momentan punem un textarea simplu. Ulterior poți integra Monaco Editor sau ce folosești tu în compiler/liber */}
            <textarea 
              value={playerCode}
              onChange={(e) => setPlayerCode(e.target.value)}
              style={{ width: '100%', height: '300px', backgroundColor: '#1e1e1e', color: '#00ff00', fontFamily: 'monospace', padding: '10px', borderRadius: '6px', border: '1px solid #444', resize: 'none' }}
            />

            <button 
              onClick={handleRunCode}
              style={{ backgroundColor: '#832211', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              Rulează și Verifică Codul ➔
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ArenaDuel;