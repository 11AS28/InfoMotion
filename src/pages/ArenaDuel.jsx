import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'sonner';
import { Swords, Code2, Trophy, Timer, Home, RefreshCw } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

function ArenaDuel() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { currentUser } = useAuth();

  const matchData = location.state?.matchData;

  const [problem, setProblem] = useState(matchData?.problem || null);
  const [playerCode, setPlayerCode] = useState(matchData?.problem?.startingCode || "");
  const [opponentProgress, setOpponentProgress] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(300); 
  const [matchStatus, setMatchStatus] = useState('playing');
  const [winnerName, setWinnerName] = useState("");

  const [eu, setEu] = useState({ username: currentUser?.displayName || "Tu" });
  const [oponent, setOponent] = useState({ username: "Oponent" });

  useEffect(() => {
    if (!matchData) {
      toast.error("Nu ai un meci activ în această cameră!");
      navigate('/arena');
    }
  }, [matchData, navigate]);

  useEffect(() => {
    if (!matchData) return;
    const esteP1 = matchData.players.p1.username === currentUser?.displayName;
    if (esteP1) {
      setEu(matchData.players.p1);
      setOponent(matchData.players.p2);
    } else {
      setEu(matchData.players.p2);
      setOponent(matchData.players.p1);
    }
  }, [matchData, currentUser]);

  useEffect(() => {
    if (matchStatus !== 'playing') return;
    if (timeLeft <= 0) { setMatchStatus('timeout'); return; }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, matchStatus]);

  useEffect(() => {
    if (!socket) return;

    socket.on('opponent_updated_progress_broadcast', (data) => {
      if (data.roomId === roomId && data.username === oponent.username) {
        setOpponentProgress(data.progress);
      }
    });

    socket.on('duel_ended_broadcast', (data) => {
      if (data.roomId === roomId) {
        setWinnerName(data.winnerUsername);
        if (data.winnerUsername === eu.username) {
          setMatchStatus('won');
        } else {
          setMatchStatus('lost');
        }
      }
    });

    return () => {
      socket.off('opponent_updated_progress_broadcast');
      socket.off('duel_ended_broadcast');
    };
  }, [socket, roomId, eu.username, oponent.username]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRunCode = async () => {
    if (!socket || matchStatus !== 'playing') return;

    const idToast = toast.loading("Se compilează și se rulează testele în sandbox...");

    try {
      const response = await fetch('http://localhost:5000/api/compile-duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: playerCode, roomId: roomId })
      });

      const data = await response.json();

      if (data.success) {
        socket.emit('update_progress', {
          roomId,
          username: eu.username,
          progress: data.progressPercent
        });

        if (data.allTestsPassed) {
          toast.success("Toate testele au trecut! Validăm victoria...", { id: idToast });
          socket.emit('player_solved', { roomId, username: eu.username });
        } else {
          toast.error(data.error || "Codul tău nu trece toate testele!", { id: idToast, duration: 4000 });
        }
      } else {
        toast.error(data.error || "Eroare de compilare g++!", { id: idToast, duration: 5000 });
      }
    } catch (error) {
      toast.error("Eroare de conexiune cu sandbox-ul.", { id: idToast });
    }
  };

  if (!problem || !matchData) return <div style={{ color: '#fff', padding: '20px' }}>Se încarcă meciul...</div>;

  return (
    usePageTitle("InfoMotion - Duel live"),
    <div className="arena-wrapper" style={{ padding: '20px', color: '#fff', position: 'relative' }}>
      <Toaster position="top-center" richColors />
      
      {matchStatus !== 'playing' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#120a0a', border: matchStatus === 'won' ? '2px solid #e3ad16' : '2px solid #832211',
            padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '450px', width: '90%'
          }}>
            <h1 style={{ fontSize: '38px', margin: '0 0 10px 0', color: matchStatus === 'won' ? '#e3ad16' : '#e63946' }}>
              {matchStatus === 'won' ? 'VICTORIE! 🎉' : 'ÎNFRÂNGERE! 💔'}
            </h1>
            <h3 style={{ color: matchStatus === 'won' ? '#00ff00' : '#ff3333', margin: '10px 0 25px 0', fontFamily: 'monospace' }}>
              {matchStatus === 'won' ? '+30 XP ACUMULAT' : '+0 XP'}
            </h3>
            <p style={{ color: '#ccc', fontSize: '15px', marginBottom: '35px', lineHeight: '1.5' }}>
              {matchStatus === 'won' 
                ? `Ai reparat bug-ul din Bubble Sort înaintea lui ${oponent.username}!` 
                : `${winnerName || oponent.username} a rezolvat problema înaintea ta.`}
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/arena')}
                style={{
                  backgroundColor: '#333', color: '#fff', border: '1px solid #555', padding: '12px 20px',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Home size={18} /> Back to Home
              </button>
              <button
                onClick={() => navigate('/arena')}
                style={{
                  backgroundColor: '#832211', color: '#fff', border: 'none', padding: '12px 20px',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <RefreshCw size={18} /> Rematch
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="arena-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <Swords color="#e63946" /> {eu.username} <span style={{fontSize: '14px', color: '#555'}}>vs</span> {oponent.username}
            </h2>
            <p style={{ color: '#aaa', margin: '5px 0 0 0' }}>Cameră: {roomId}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#221515', padding: '10px 20px', borderRadius: '8px', border: '1px solid #832211' }}>
            <Timer color="#e63946" size={20} />
            <span style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progres + Editor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ background: '#120a0a', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '20px' }}>
              <h3>{problem.title}</h3>
              <p style={{ color: '#ccc', lineHeight: '1.6' }}>{problem.description}</p>
            </div>

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

          <div style={{ background: '#120a0a', padding: '20px', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 color="#832211" />
              <h4 style={{ margin: 0 }}>Repară codul C++:</h4>
            </div>
            <textarea 
              value={playerCode}
              onChange={(e) => setPlayerCode(e.target.value)}
              disabled={matchStatus !== 'playing'}
              style={{ width: '100%', height: '300px', backgroundColor: '#1e1e1e', color: '#00ff00', fontFamily: 'monospace', padding: '10px', borderRadius: '6px', border: '1px solid #444', resize: 'none' }}
            />
            <button 
              onClick={handleRunCode}
              disabled={matchStatus !== 'playing'}
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