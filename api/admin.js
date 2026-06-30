import admin from 'firebase-admin';

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
      error: 'Serverul nu a putut inițializa Firebase Admin.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, sessionToken, username, data, targetId } = req.body;

  const admins = {
    'SexyBadircea6969': process.env.ADMIN_1_PASS,
    's.m._.maria': process.env.ADMIN_2_PASS,
    'Fane': process.env.ADMIN_3_PASS,
    'Emi': process.env.ADMIN_4_PASS
  };

  const expectedPassword = admins[username];
  if (!expectedPassword || sessionToken !== expectedPassword) {
    return res.status(403).json({ error: 'Neautorizat! Sesiune invalidă.' });
  }

  const currentTimestamp = new Date().toISOString();

  try {
    switch (action) {
      case 'publish_lesson': {
        const { isEditing, propunereInCurs, clasaFinala, ordineFinala, fId, lectieData } = data;
        const batch = db.batch();
        const lectiiRef = db.collection('lectii');

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

        const nouaLectieRef = lectiiRef.doc(fId);
        batch.set(nouaLectieRef, {
          ...lectieData,
          cheieSecuritate: sessionToken,
          adminUsername: username
        }, { merge: true });

        if (propunereInCurs) {
          const propRef = db.collection('propuneri_lectii').doc(propunereInCurs);
          batch.delete(propRef);
        }
        const metaRef = db.collection('meta').doc('lectii');
        batch.set(metaRef, { ultimaActualizare: Date.now() }, { merge: true });
        await batch.commit();
        return res.status(200).json({ success: true });
      }

      case 'delete_lesson':
        await db.collection('lectii').doc(targetId).delete();
        return res.status(200).json({ success: true });

      case 'add_todo':
        const todoRef = await db.collection('admin_todo').add({
          text: data.text, author: username, completed: false, createdAt: currentTimestamp,
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
        await db.collection('users').doc(data.userId).collection('notifications').add({
          type: data.type,
          text: data.text,
          read: false,
          createdAt: currentTimestamp
        });
        return res.status(200).json({ success: true });
      }

      case 'send_announcement': {
        let targetIds = data.userIds;
        if (targetIds === 'all' || (Array.isArray(targetIds) && targetIds.includes('all'))) {
          const allUsersSnap = await db.collection('users').get();
          targetIds = allUsersSnap.docs.map((d) => d.id);
        }

        // Folosim batch-uri de max 500 operații pentru siguranță și viteză
        let batch = db.batch();
        let count = 0;

        for (const uid of targetIds) {
          const notifRef = db.collection('users').doc(uid).collection('notifications').doc();
          batch.set(notifRef, {
            type: 'anunt_admin',
            text: data.text,
            read: false,
            createdAt: currentTimestamp
          });
          count++;

          if (count === 500) {
            await batch.commit();
            batch = db.batch();
            count = 0;
          }
        }
        if (count > 0) await batch.commit();

        return res.status(200).json({ success: true, count: targetIds.length });
      }

      case 'reject_proposal': {
        if (data.autorId) {
          await db.collection('users').doc(data.autorId).collection('notifications').add({
            type: 'lectie_respinsa',
            text: `Propunerea ta pentru lecția „${data.titlu}" a fost respinsă.`,
            read: false,
            createdAt: currentTimestamp
          });
        }
        await db.collection('propuneri_lectii').doc(data.proposalId).delete();
        return res.status(200).json({ success: true });
      }

      case 'reply_message': {
        await db.collection('contact_messages').doc(data.messageId).update({
          answered: true,
          raspuns: data.raspuns,
          raspunsAdmin: data.numeAdmin,
          raspunsLa: currentTimestamp
        });
        if (data.userUid) {
          await db.collection('users').doc(data.userUid).collection('notifications').add({
            type: 'contact_raspuns',
            text: `${data.numeAdmin} ți-a răspuns la mesaj: "${data.raspuns}"`,
            read: false,
            createdAt: currentTimestamp
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
        await db.collection('users').doc(data.targetId).update(data.fields);
        return res.status(200).json({ success: true });
      }

      case 'list_users_minimal': {
        const usersSnap = await db.collection('users').get();
        const users = usersSnap.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username || '',
          email: doc.data().email || ''
        }));
        return res.status(200).json({ success: true, users });
      }

      case 'broadcast_announcement': {
        const { type, userId, text } = data; // destructurare din 'data' pentru consistență

        if (type === 'unul') {
          if (!userId) return res.status(400).json({ success: false, message: 'ID-ul utilizatorului lipsește.' });

          await db.collection('users').doc(userId).collection('notifications').add({
            type: 'anunt_admin',
            text: text,
            read: false,
            createdAt: currentTimestamp,
            adminUsername: username
          });

          return res.status(200).json({ success: true, message: 'Notificare trimisă cu succes!' });
        }

        if (type === 'toti') {
          const usersSnap = await db.collection('users').get();
          let batch = db.batch();
          let count = 0;

          for (const userDoc of usersSnap.docs) {
            const notifRef = db.collection('users').doc(userDoc.id).collection('notifications').doc();
            batch.set(notifRef, {
              type: 'anunt_admin',
              text: text,
              read: false,
              createdAt: currentTimestamp,
              adminUsername: username
            });
            count++;

            if (count === 500) {
              await batch.commit();
              batch = db.batch();
              count = 0;
            }
          }
          if (count > 0) await batch.commit();

          return res.status(200).json({ success: true, message: `Anunț trimis la toți cei ${usersSnap.size} utilizatori!` });
        }

        return res.status(400).json({ success: false, message: 'Tip de anunț invalid.' });
      }

      default:
        return res.status(400).json({ error: 'Acțiune necunoscută!' });
    }
  } catch (error) {
    console.error(`Eroare la executarea acțiunii ${action}:`, error);
    return res.status(500).json({ error: 'A apărut o eroare internă pe server.' });
  }
}