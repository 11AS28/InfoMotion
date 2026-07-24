<div align="center">

# 🎓 InfoMotion

### Laboratorul digital care transformă algoritmica din teorie seacă în experiență vizuală și competitivă

[![Live Demo](https://img.shields.io/badge/🌐_Live-infomotion.space-23a9b3?style=for-the-badge)](https://infomotion.space)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

</div>

---

## 📖 Despre proiect

[**DOCUMENTAȚIA O GĂSIȚI AICI**](https://docs.google.com/document/d/1Z5vPx7C196fCTjE-NZTvjNK1hayeKfIs/edit?usp=sharing&ouid=115920545337278714774&rtpof=true&sd=true)

**InfoMotion** a fost creat pentru că algoritmii de bază sunt de obicei explicați teoretic și greoi. Platforma transformă procesul de învățare al algoritmilor într-o experiență vizuală, interactivă și motivantă — prin **animații pas-cu-pas**, un **mediu de execuție C++ și Python integrat**, **descărcare de cheat sheet-uri**, **quiz-uri**, un sistem de **gamificare** și o arenă de concurs zilnică.

Ideea de bază: un algoritm devine cu adevărat înțeles abia atunci când îl vezi *mișcându-se* — nu citit din pseudocod pe tablă, ci văzut pas cu pas, cu fiecare comparație și interschimbare vizibilă pe ecran.

---

## ✨ Funcționalități principale

### 📚 Lecții interactive animate
- Explicații pe înțelesul elevilor, cu teorie, cod (**C++ și Python**) și probleme practice (inspirate din [pbinfo.ro](https://www.pbinfo.ro/))
- Animații vizuale proprii pentru algoritmi clasici: Bubble Sort, Quick Sort, Merge Sort, căutare binară, divide et impera, sume parțiale, sliding window, stivă monotonă și altele
- Bară de căutare rapidă pentru orice concept

### 💻 Editor de cod și execuție (C++ & Python)
- Editor de cod în browser cu **Monaco Editor** (același din spatele VS Code)
- Compilare și rulare reală pe server (`g++` pentru C++ și `python3` pentru Python), cu măsurare de timp și memorie
- Detectare TLE (Time Limit Exceeded), erori de sintaxă/compilare și erori de runtime

### 📑 Cheat Sheet-uri descărcabile (NOU!)
- Ai acces instant la esențial: poți descărca direct din platformă **cheat sheet-uri** în format digital cu codul, logica și complexitatea algoritmilor învățați, perfecte pentru recapitulare rapidă înainte de teze sau olimpiade.

### ✅ Sistem de Quiz & Gamificare
- Fiecare lecție conține un quiz de verificare
- Finalizarea cu succes marchează lecția ca **completată** și acordă **puncte**
- Streak de zile consecutive de activitate

### 🏆 Arena — Problema Zilei & Clasamente
- O problemă nouă de algoritmică în fiecare zi, rezolvabilă acum în **C++** sau **Python**
- Rezolvare corectă: **30 puncte** · Bonus primii 3: **50 puncte** total
- Clasament live, bazat pe punctele din lecții + Arena

### 👤 Profil utilizator
- Nivel: Începător / Avansat / Expert
- Lecții finalizate, punctaj, procent de parcurgere a platformei
- Username editabil + Codeforces Handle verificabil

### 🛠️ Panou de administrare
- Adăugare, editare și ștergere lecții (editor WYSIWYG + Markdown/HTML)
- Gestionare utilizatori și mesaje de contact
- Dashboard cu tab-uri: Overview, Lecții, Utilizatori, Mesaje, To-Do

---

## 🧰 Tehnologii folosite

<div align="center">

| Frontend | Backend & API | Date & Auth | Infra & Tooling |
|:---:|:---:|:---:|:---:|
| ⚛️ React 19 | 🟢 Node.js | 🔥 Firebase Auth | 🐳 Docker |
| ⚡ Vite | 🚂 Express 5 | 📦 Firestore | ▲ Vercel |
| 🧭 React Router DOM | 🐍 Python 3 (execuție) | 🛡️ firebase-admin | 🧹 ESLint |
| 🖊️ Monaco Editor | ⚙️ C++ / g++ (execuție) | 🧼 DOMPurify | 🗺️ Sitemap auto-generat |
| 🎨 CSS Grid & Flexbox | 🧩 Vercel Serverless | | |
| 📝 React Markdown | | | |

</div>

**Firebase** este utilizat pentru autentificare, stocarea lecțiilor și gestionarea datelor utilizatorilor (profil, punctaj, Codeforces handle).

**Backend-ul de execuție cod** este containerizat cu Docker și rulează izolat codul trimis de utilizatori (C++ sau Python), asigurând un mediu sigur, cu limite stricte de timp și memorie.

---

## 🚀 Cum accesezi platforma

Platforma rulează direct în browser, fără instalare:

1. 🌐 Accesează **[infomotion.space](https://infomotion.space/)**
2. 🔑 Apasă **„LOGARE / CREARE CONT"**
3. 📘 Apasă **„Începe să înveți"**

| Secțiune | Descriere |
|---|---|
| 🏠 Acasă | Informații generale despre platformă |
| ℹ️ Despre | Scopul și funcționalitățile aplicației |
| 📩 Contact | Datele de contact ale autorilor |
| 🏆 Arena | Problema zilei și clasamentele |
| 📖 Începe să înveți | Toate lecțiile disponibile |

---

## 🖥️ Rulare locală (development)

```bash
# Clonează repo-ul
git clone https://github.com/<user>/InfoMotion.git
cd InfoMotion

# Instalează dependențele frontend
npm install

# Creează fișierul .env în rădăcina proiectului
# cu variabilele VITE_FIREBASE_* (vezi Firebase Console)

# Pornește serverul de dezvoltare
npm run dev
```

Pentru backend-ul de execuție cod:

```bash
cd backend
npm install
npm start
```

> ⚠️ Ai nevoie de un fișier `.env` cu configurația Firebase (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.) — acesta **nu** este inclus în repo din motive de securitate.

---

## 💻 Cerințe hardware & software

**Hardware recomandat:** procesor quad-core (i5+), 8 GB RAM, SSD, conexiune internet stabilă. Compatibil și cu dispozitive mobile.

**Sisteme de operare:** Windows 10+, macOS, Linux, Android, iOS

**Browsere:** Chrome · Firefox · Edge · Safari · Brave

**Editor de cod:** Nu mai este nevoie de niciun editor extern (IDE)! Platforma vine la pachet cu un editor integrat de top (Monaco) atât pentru C++, cât și pentru Python.

---

## 📚 Bibliografie & resurse

- 🔗 [pbinfo.ro](https://www.pbinfo.ro/)
- 🔗 [codeforces.com](https://codeforces.com/)
- 🔗 [react.dev](https://react.dev/)
- 🔗 [python.org](https://www.python.org/)
- 🔗 [Firebase Console](https://console.firebase.google.com/)
- 🔗 [vite.dev](https://vite.dev/)
- 🔗 [CSS Flexbox — W3Schools](https://www.w3schools.com/csS/css3_flexbox.asp)
- 🔗 [Monaco Editor](https://www.npmjs.com/package/@monaco-editor/react)

---

<div align="center">

Făcut cu ❤️ pentru elevii care vor să înțeleagă algoritmica, nu doar s-o memoreze.

</div>
