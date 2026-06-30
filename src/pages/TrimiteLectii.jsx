import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // Asigură-te că importul către instanța ta de Firebase este corect
import { useAuth } from "../context/AuthContext"; // Dacă vrei să salvezi și cine a trimis lecția
import Nav from "../components/nav";
import Footer from "../components/footer";
import '../pages_css/trimiteLectii.css';
import usePageTitle from '../hooks/usePageTitle';

const TrimiteLectii = () => {
    const { currentUser } = useAuth(); // Extragem utilizatorul logat, dacă este cazul
    
    // Starea inițială a formularului
    const [form, setForm] = useState({
        titlu: "",
        clasa: "",
        teorie: "",
        codCPlusPlus: "",
        acceptTerms: false,
        numeAutor: currentUser ? (currentUser.nume || currentUser.email.split('@')[0]) : "" 
    });

    // Stări pentru feedback-ul utilizatorului (încărcare, succes, eroare)
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    // Funcția care actualizează state-ul la fiecare modificare a unui input/textarea/checkbox
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            // Dacă e checkbox folosim "checked", altfel folosim "value"
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Funcția care se execută când utilizatorul apasă butonul "Trimite Lecția"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previne reîncărcarea paginii
        
        // Validare de siguranță (opțională, HTML5 deja blochează prin atributul 'required')
        if (!form.titlu || !form.clasa || !form.teorie || !form.acceptTerms) {
            setStatusMessage({ type: "error", text: "Te rugăm să completezi toate câmpurile obligatorii și să accepți termenii." });
            return;
        }

        setLoading(true);
        setStatusMessage({ type: "", text: "" });

        try {
            // Trimitem datele în baza de date Firestore
            await addDoc(collection(db, "propuneri_lectii"), {
                titlu: form.titlu,
                clasa: form.clasa,
                teorie: form.teorie,
                codCPlusPlus: form.codCPlusPlus,
                // Aici salvam ce a scris omul în câmpul "Numele tău", sau "Anonim" dacă a lăsat gol
                numeAutorDorit: form.numeAutor || "Anonim", 
                autorId: currentUser ? currentUser.uid : "Anonim", 
                emailAutor: currentUser ? currentUser.email : "Anonim",
                dataTrimiterii: serverTimestamp(),
                status: "in_asteptare" 
            });

            // Afișăm un mesaj de succes
            setStatusMessage({ type: "success", text: "Lecția a fost trimisă cu succes! Îți mulțumim pentru contribuție." });
            
            // Resetăm formularul după trimiterea cu succes (inclusiv checkbox și nume)
            setForm({
                titlu: "",
                clasa: "",
                teorie: "",
                codCPlusPlus: "",
                acceptTerms: false,
                numeAutor: currentUser ? (currentUser.nume || currentUser.email.split('@')[0]) : ""
            });

        } catch (error) {
            console.error("Eroare la trimiterea lecției: ", error);
            setStatusMessage({ type: "error", text: "A apărut o eroare la trimiterea lecției. Te rugăm să încerci din nou." });
        } finally {
            setLoading(false);
        }
    };

    return (    
        <div className="page-wrapper">
        {usePageTitle("InfoMotion - Trimite o Lecție")}
        <Nav />
        <main className="trimite-lectii-container">
            <header className="trimite-lectii-header">
            <h1>Trimite o Lecție</h1>
            <h2>Contribuie la comunitatea InfoMotion!</h2>
            </header>
            
            <section className="trimite-lectii-content">
            <p>
                Ești profesor sau pasionat de informatică și ai o lecție pe care vrei să o împărtășești cu elevii din toată țara?
                Acesta este locul potrivit! Completează formularul de mai jos cu detaliile lecției tale și trimite-ne propunerea.
            </p>
            
            {/* Afișarea mesajelor de status (Eroare sau Succes) */}
            {statusMessage.text && (
                <div style={{ 
                    padding: '15px', 
                    marginBottom: '20px', 
                    borderRadius: '8px',
                    color: '#fff',
                    backgroundColor: statusMessage.type === 'success' ? '#2e7d32' : '#d32f2f',
                    textAlign: 'center'
                }}>
                    {statusMessage.text}
                </div>
            )}

            <form className="trimite-lectii-form" onSubmit={handleSubmit}>    
                <label>
                    Titlul Lecției:
                    <input
                        type="text"
                        name="titlu"
                        value={form.titlu}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Introducere în Grafuri"
                    />
                </label>
                
                <label>
                    Clasa:
                    <select
                        name="clasa"
                        value={form.clasa}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selectează o clasă</option>
                        <option value="a-IX-a">a-IX-a</option>
                        <option value="a-X-a">a-X-a</option>
                        <option value="a-XI-a">a-XI-a</option>
                    </select>
                </label>
                
                <label>
                    Teorie:
                    <textarea
                        name="teorie"
                        value={form.teorie}
                        onChange={handleChange}
                        required
                        rows="8"
                        placeholder="Explică conceptele pas cu pas aici..."
                    />
                </label>
                
                <label>
                    Cod C++ (opțional):
                    <textarea
                        name="codCPlusPlus"
                        value={form.codCPlusPlus}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Lipește exemplul tău de cod C++ aici (opțional)..."
                        style={{ fontFamily: 'monospace' }}
                    />
                </label>

                <label>
                    Numele tău:
                    <input
                        type="text"
                        name="numeAutor"
                        value={form.numeAutor}      
                        onChange={handleChange}     
                        placeholder="Ex: Popescu Ion"
                    />
                </label>

                <div className="termeni-container">
                    <input
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={form.acceptTerms}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="acceptTerms">
                        Sunt de acord cu <a href="/termeni" target="_blank" rel="noopener noreferrer">termenii și condițiile</a>
                    </label>
                </div>

                <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? "Se trimite..." : "Trimite Lecția"}
                </button>
            </form>
            </section>
        </main>
       
        </div>
    );
}

export default TrimiteLectii;