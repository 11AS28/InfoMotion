// server.js
const express = require('express');
const cors = require('cors');

// Importăm simulatoarele create mai sus
const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');

const app = express();
const PORT = process.env.PORT || 5000;

// Activăm middleware-urile obligatorii
app.use(cors());          // Permite conexiunea dinspre frontend
app.use(express.json());  // Permite serverului să înțeleagă date trimise în format JSON

// Singura rută universală de care ai nevoie pentru animații
app.post('/api/simulate', (req, res) => {

  const { algorithmType, inputData } = req.body;
  
  let steps = [];
  switch (algorithmType) {
    case 'bubbleSort':
    case 'BubbleSortAnim': 
      steps = simulateBubbleSort(inputData);
      break;
    default:
      return res.status(400).json({ error: "Algoritm neimplementat" });
  }

  res.json({ steps });
});

// Pornim serverul propriu-zis
app.listen(PORT, () => {
    console.log(`🚀 Backend-ul InfoMotion rulează pe http://localhost:${PORT}`);
});