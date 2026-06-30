// api/admin.js
import admin from 'firebase-admin';

// Inițializăm Firebase Admin o singură dată per instanță serverless
let db = null;

function getFirestoreDb() {
  if (db) return db;
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  db = admin.firestore();
  return db;
}

export default async function handler(req, res) {
  try {
    db = getFirestoreDb();
  } catch (error) {
    console.error('Eroare la inițializarea Firebase Admin:', error);
    return res.status(500).json({ 
      error: 'Serverul nu a putut inițializa Firebase Admin. Te rugăm să te asiguri că ai configurat variabilele de mediu FIREBASE_PRIVATE_KEY și FIREBASE_CLIENT_EMAIL în proiectul tău Vercel.' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, sessionToken, username, data, targetId } = req.body;

  // Mapare parole administrative — SINGURA sursă de adevăr, exclusiv pe Vercel.
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

      case 'send_notification': {
        // data: { userId, type, text }
        await db.collection('users').doc(data.userId).collection('notifications').add({
          type: data.type,
          text: data.text,
          read: false,
          createdAt: new Date().toISOString()
        });
        return res.status(200).json({ success: true });
      }

      case 'send_announcement': {
        // data: { text, userIds: ['all'] sau ['uid1','uid2',...] }
        let targetIds = data.userIds;
        if (targetIds === 'all' || (Array.isArray(targetIds) && targetIds.includes('all'))) {
          const allUsersSnap = await db.collection('users').get();
          targetIds = allUsersSnap.docs.map((d) => d.id);
        }

        const writes = targetIds.map((uid) =>
          db.collection('users').doc(uid).collection('notifications').add({
            type: 'anunt_admin',
            text: data.text,
            read: false,
            createdAt: new Date().toISOString()
          })
        );
        await Promise.all(writes);
        return res.status(200).json({ success: true, count: targetIds.length });
      }

      case 'reject_proposal': {
        // data: { proposalId, autorId, titlu }
        if (data.autorId) {
          await db.collection('users').doc(data.autorId).collection('notifications').add({
            type: 'lectie_respinsa',
            text: `Propunerea ta pentru lecția „${data.titlu}" a fost respinsă.`,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
        await db.collection('propuneri_lectii').doc(data.proposalId).delete();
        return res.status(200).json({ success: true });
      }

      case 'reply_message': {
        // data: { messageId, raspuns, numeAdmin, userUid }
        await db.collection('contact_messages').doc(data.messageId).update({
          answered: true,
          raspuns: data.raspuns,
          raspunsAdmin: data.numeAdmin,
          raspunsLa: new Date().toISOString()
        });
        if (data.userUid) {
          await db.collection('users').doc(data.userUid).collection('notifications').add({
            type: 'contact_raspuns',
            text: `${data.numeAdmin} ți-a răspuns la mesaj: "${data.raspuns}"`,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
        return res.status(200).json({ success: true });
      }

      case 'list_messages': {
        const snap = await db.collection('contact_messages').orderBy('createdAt', 'desc').get();
        const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.status(200).json({ success: true, messages });
      }

      case 'list_todos': {
        const snap = await db.collection('admin_todo').orderBy('createdAt', 'desc').get();
        const todoList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.status(200).json({ success: true, todos: todoList });
      }

      case 'update_user': {
        // data: { targetId, fields }  — folosit de AdminUsers.jsx
        await db.collection('users').doc(data.targetId).update(data.fields);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Acțiune necunoscută!' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}