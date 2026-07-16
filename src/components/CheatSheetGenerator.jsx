import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { db } from '../firebase';
import CheatSheetPDF from './CheatSheetPDF';

const CACHE_KEY = 'infomotion_lessons_cache_v3';

export default function CheatSheetGenerator() {
  const [toateLectiile, setToateLectiile] = useState([]);
  const [selectate, setSelectate] = useState([]);
  const [lectiiPDF, setLectiiPDF] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initComponenta() {
      setLoading(true);
      //daca e cache foloseste 
      const cache = localStorage.getItem(CACHE_KEY);
      if (cache) {
        try {
          const lectiiDinCache = JSON.parse(cache);

          const listaSelectie = lectiiDinCache.map((lectie) => ({
            id: lectie.id,
            titlu: lectie.titlu,
          }));

          setToateLectiile(listaSelectie);
          setLoading(false);
          return; 
        } catch (error) {
          console.error('Cache invalid, facem fallback la DB...', error); //asta tre scos dupa 
        }
      }
      //daca nu e cache ramane exact la fel cum ai facut tu 
      try {
        const snapshot = await getDocs(collection(db, 'lectii'));

        const lectiiDescarcate = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(lectiiDescarcate));

        const listaSelectie = lectiiDescarcate.map((lectie) => ({
          id: lectie.id,
          titlu: lectie.titlu,
        }));
        setToateLectiile(listaSelectie);
      } catch (error) {
        console.error('Eroare la descărcarea lecțiilor din DB:', error);  //si asta tre scos dupa 
      } finally {
        setLoading(false);
      }
    }
    initComponenta();
  }, []);

  const toggle = (id) =>
    setSelectate((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  //asta il pregateste normal a ramas la fel da ia din cache ezi 
  const pregatestePDF = () => {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) {
      alert('Nu am găsit datele în cache pentru a genera PDF-ul!');
      return;
    }

    try {
      const lectiiDinCache = JSON.parse(cache);
      const lectiiFiltrate = lectiiDinCache.filter((lectie) =>
        selectate.includes(lectie.id)
      );

      const lectiiFormatate = lectiiFiltrate.map((lectie) => ({
        id: lectie.id,
        titlu: lectie.titlu,
        descriere: lectie.descriere,
        cod: lectie.codCPlusPlus,
      }));

      setLectiiPDF(lectiiFormatate);
    } catch (error) {
      console.error('Eroare la generarea datelor pentru PDF:', error); // si asta dupa 
    }
  };

  if (loading) {
    return <p>Se încarcă lecțiile...</p>;
  }

  return (
    <div>
      {toateLectiile.map((l) => (
        <label key={l.id} style={{ display: 'block' }}>
          <input type="checkbox" onChange={() => toggle(l.id)} />
          {l.titlu}
        </label>
      ))}

      <button onClick={pregatestePDF} disabled={!selectate.length}>
        Pregătește copiuța
      </button>

      {lectiiPDF && (
        <PDFDownloadLink
          document={<CheatSheetPDF lectii={lectiiPDF} />}
          fileName="copiuta.pdf"
        >
          {({ loading }) => (loading ? 'Se generează...' : 'Descarcă PDF')}
        </PDFDownloadLink>
      )}
    </div>
  );
}