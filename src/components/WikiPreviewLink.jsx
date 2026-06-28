import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function WikiPreviewLink({ href, idLectieTinta, children }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

 const handleMouseEnter = async () => {
  setVisible(true);
  
  if (previewData || loading) return;

  setLoading(true);
  try {
    const docRef = doc(db, "lectii", idLectieTinta);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      let textTeorie = data.teorie || '';

      // 1. Ștergem marcajele de tip "### Text" (cu tot cu spații sau &nbsp; lipite de ele)
      textTeorie = textTeorie.replace(/###\s*.+?(?=\s|<|\n|$)/g, '');

      // 2. Curățăm toate tagurile HTML ramase (ex: <p>, <div>, <a>)
      textTeorie = textTeorie.replace(/<[^>]*>/g, '');

      // 3. Înlocuim entitățile HTML ciudate precum &nbsp; cu spațiu normal
      textTeorie = textTeorie.replace(/&nbsp;/g, ' ');

      // 4. Scurtăm textul pentru previzualizare (140 de caractere e perfect)
      const textCuratatScurt = textTeorie.trim().substring(0, 140) + '...';

      setPreviewData({
        titlu: data.titlu || 'Lecție',
        descriere: textCuratatScurt
      });
    } else {
      setPreviewData({
        titlu: 'Ups!',
        descriere: 'Lecția corelată nu a mai fost găsită.'
      });
    }
  } catch (err) {
    console.error("Eroare preview Wiki:", err);
  } finally {
    setLoading(false);
  }
};

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <span 
      className="wiki-tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a href={href} className="wiki-interactive-link">
        {children}
      </a>

      {visible && (
        <span className="wiki-popup-box">
          {loading ? (
            <span className="wiki-loading-skeleton">
              <span className="skeleton-line title"></span>
              <span className="skeleton-line text"></span>
            </span>
          ) : (
            <>
              <strong className="wiki-popup-title">{previewData?.titlu}</strong>
              <p className="wiki-popup-desc">{previewData?.descriere}</p>
              <span className="wiki-popup-footer">Click pentru a deschide lecția →</span>
            </>
          )}
        </span>
      )}
    </span>
  );
}