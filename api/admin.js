// api/admin.js
import admin from 'firebase-admin';

// Inițializăm Firebase Admin o singură dată per instanță serverless
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        // Înlocuim eventualele caractere newline salvate greșit în variabila de mediu
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } catch (error) {
    console.error('Eroare la inițializarea Firebase Admin:', error);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, sessionToken, username, data, targetId } = req.body;

  // Mapare parole administrative
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
        const { isEditing, propunereInCurs, clasaFinala, ordineFinala, fId, lectieData } = data;
        const batch = db.batch();
        const lectiiRef = db.collection('lectii');

        // Decalare automată a lecțiilor dacă ordinea se suprapune
        if (!isEditing && !propunereInCurs) {
          const snapVerificare = await lectiiRef
            .where('clasa', '==', clasaFinala)
            .where('ordine', '==', ordineFinala)
            .get();

          if (!snapVerificare.empty) {
            const snapDecalare = await lectiiRef
              .where('clasa', '==', clasaFinala)
              .where('ordine', '>=', ordineFinala)
              .get();

            snapDecalare.forEach((document) => {
              const docRef = lectiiRef.doc(document.id);
              batch.update(docRef, { 
                ordine: document.data().ordine + 1,
                cheieSecuritate: sessionToken,
                adminUsername: username
              });
            });
          }
        }

        // Setăm noua lecție (Bypass total la Firebase Rules)
        const nouaLectieRef = lectiiRef.doc(fId);
        batch.set(nouaLectieRef, {
          ...lectieData,
          cheieSecuritate: sessionToken,
          adminUsername: username
        }, { merge: true });

        // Ștergem propunerea din listă dacă a fost aprobată
        if (propunereInCurs) {
          const propRef = db.collection('propuneri_lectii').doc(propunereInCurs);
          batch.delete(propRef);
        }

        await batch.commit();
        return res.status(200).json({ success: true });
      }

      case 'delete_lesson':
        await db.collection('lectii').doc(targetId).delete();
        return res.status(200).json({ success: true });

      case 'add_todo':
        const todoRef = await db.collection('admin_todo').add({
          text: data.text, author: username, completed: false, createdAt: new Date().toISOString(),
          cheieSecuritate: sessionToken, adminUsername: username
        });
        return res.status(200).json({ success: true, id: todoRef.id });

      case 'toggle_todo':
        await db.collection('admin_todo').doc(targetId).update({ 
          completed: data.completed, cheieSecuritate: sessionToken, adminUsername: username 
        });
        return res.status(200).json({ success: true });

      case 'delete_todo':
        await db.collection('admin_todo').doc(targetId).delete();
        return res.status(200).json({ success: true });

      default:
        return res.status(400).json({ error: 'Acțiune necunoscută!' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}