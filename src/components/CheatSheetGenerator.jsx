import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { db } from '../firebase'; 
import CheatSheetPDF from './CheatSheetPDF';

export default function CheatSheetGenerator() {
  const [toateLectiile, setToateLectiile] = useState([]);
  const [selectate, setSelectate] = useState([]);
  const [lectiiPDF, setLectiiPDF] = useState(null);

  useEffect(() => {
    async function fetchLectii() {
      const snapshot = await getDocs(collection(db, 'lectii'));
      setToateLectiile(
        snapshot.docs.map((doc) => ({ id: doc.id, titlu: doc.data().titlu }))
      );
    }
    fetchLectii();
  }, []);

  const toggle = (id) =>
    setSelectate((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const pregatestePDF = async () => {
    const q = query(collection(db, 'lectii'), where(documentId(), 'in', selectate));
    const snapshot = await getDocs(q);
    const lectii = snapshot.docs.map((doc) => ({
      id: doc.id,
      titlu: doc.data().titlu,
      descriere: doc.data().descriere,
      cod: doc.data().codCPlusPlus,
    }));
    setLectiiPDF(lectii);
  };

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