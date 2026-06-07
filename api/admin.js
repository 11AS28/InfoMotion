// api/admin.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, sessionToken, username, data, targetId } = req.body;

  const admins = {
    'SexyBadircea6969': process.env.ADMIN_1_PASS,
    's.m._.maria':      process.env.ADMIN_2_PASS,
    'Fane':             process.env.ADMIN_3_PASS,
    'Emi':              process.env.ADMIN_4_PASS
  };

  const expectedPassword = admins[username];
  if (!expectedPassword || sessionToken !== expectedPassword) {
    return res.status(403).json({ error: 'Neautorizat! Sesiune invalidă.' });
  }

  try {
    switch (action) {
      case 'publish_lesson': {
        const { isEditing, propunereInCurs, clasaFinala, categorieVal, ordineFinala, fId, lectieData } = data;
        const lectiiRef = collection(db, 'lectii');
        const batch = writeBatch(db);

        if (!isEditing && !propunereInCurs) {
          const qVerificare = query(lectiiRef, where('clasa', '==', clasaFinala), where('ordine', '==', ordineFinala));
          const snapVerificare = await getDocs(qVerificare);

          if (!snapVerificare.empty) {
            const qDecalare = query(lectiiRef, where('clasa', '==', clasaFinala), where('ordine', '>=', ordineFinala));
            const snapDecalare = await getDocs(qDecalare);

            snapDecalare.forEach((document) => {
              const docRef = doc(db, 'lectii', document.id);
              batch.update(docRef, { 
                ordine: document.data().ordine + 1,
                cheieSecuritate: sessionToken,
                adminUsername: username
              });
            });
          }
        }

        const nouaLectieRef = doc(db, 'lectii', fId);
        batch.set(nouaLectieRef, {
          ...lectieData,
          cheieSecuritate: sessionToken,
          adminUsername: username
        });

        if (propunereInCurs) {
          const propRef = doc(db, 'propuneri_lectii', propunereInCurs);
          batch.update(propRef, { cheieSecuritate: sessionToken, adminUsername: username });
          batch.delete(propRef);
        }

        await batch.commit();
        return res.status(200).json({ success: true });
      }

      case 'delete_lesson':
        await updateDoc(doc(db, 'lectii', targetId), { cheieSecuritate: sessionToken, adminUsername: username });
        await deleteDoc(doc(db, 'lectii', targetId));
        return res.status(200).json({ success: true });

      case 'add_todo':
        const todoRef = await addDoc(collection(db, 'admin_todo'), {
          text: data.text, author: username, completed: false, createdAt: new Date().toISOString(),
          cheieSecuritate: sessionToken, adminUsername: username
        });
        return res.status(200).json({ success: true, id: todoRef.id });

      case 'toggle_todo':
        await updateDoc(doc(db, 'admin_todo', targetId), { completed: data.completed, cheieSecuritate: sessionToken, adminUsername: username });
        return res.status(200).json({ success: true });

      case 'delete_todo':
        await updateDoc(doc(db, 'admin_todo', targetId), { cheieSecuritate: sessionToken, adminUsername: username });
        await deleteDoc(doc(db, 'admin_todo', targetId));
        return res.status(200).json({ success: true });

      default:
        return res.status(400).json({ error: 'Acțiune necunoscută!' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}