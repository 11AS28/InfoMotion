// server.js
const express = require('express');
const cors = require('cors');

// Importăm simulatoarele create mai sus
const { simulateStrlen } = require('./simulators/stringSim');
const { simulateBubbleSort } = require('./simulators/arraySim');
const { simulateQuickSortJS } = require('./simulators/quickSortSim');
const { simulateCautareBinaraDivImpJS } = require('./simulators/cautareBinaraDivImpSim');

const app = express();
const PORT = process.env.PORT || 5000;

// Activăm middleware-urile obligatorii
app.use(cors());          // Permite conexiunea dinspre frontend
app.use(express.json());  // Permite serverului să înțeleagă date trimise în format JSON

// Singura rută universală de care ai nevoie pentru animații
// Înlocuiește complet ruta ta veche cu asta:
app.post('/api/simulate', async (req, res) => {
  try {
    const { algorithmType, inputData } = req.body;
    
    // Verificăm dacă frontend-ul a trimis datele
    if (!inputData || !Array.isArray(inputData)) {
      return res.status(400).json({ error: "Datele de intrare lipsesc sau sunt invalide!" });
    }

    let steps = [];

    switch (algorithmType) {
      case 'bubbleSort':
      case 'BubbleSortAnim':
        steps = simulateBubbleSort(inputData);
        break;
        
      case 'quick_sort_dinamic':
        steps = simulateQuickSortJS(inputData);
        break;

      case 'strlen_dinamic':
        // 1. Transformăm array-ul de coduri ASCII înapoi în cuvânt text (ex: [105, 110] -> "in")
        const cuvantStrlen = inputData.map(ascii => String.fromCharCode(ascii)).join('');
        
        // 2. Pornim simulatorul tău real din `stringSim.js` și așteptăm pașii generated de C++
        // Folosim await pentru că rularea unui executabil durează puțin asincron
        steps = await simulateStrlen(cuvantStrlen);
        break;

      case 'strcpy_dinamic':
        const cuvantStrcpy = inputData.map(ascii => String.fromCharCode(ascii)).join('');
        // Dacă ai o funcție gen simulateStrcpy în stringSim, o chemi aici. 
        // Dacă simulateStrlen se ocupă de ambele, o pui tot pe ea:
        steps = await simulateStrlen(cuvantStrcpy); 
        break;

      case 'cautare_binara_div_imp': {
  // Alegem o țintă (de exemplu, un element din mijloc sau primul element, 
  // ori poți face ca utilizatorul să caute un element implicit)
  // Ca să fie interactiv, luăm valoarea din mijlocul vectorului introdus ca țintă, sau poți pune un număr fix de test (ex: 8)
  const targetTest = inputData[Math.floor(inputData.length / 2)];
  steps = simulateCautareBinaraDivImpJS(inputData, targetTest);
  break;
}

      default:
        return res.status(400).json({ error: "Algoritm neimplementat" });
    }

    // Trimitem înapoi către React array-ul plin cu pașii animației
    return res.json({ steps });

  } catch (error) {
    console.error("Eroare la simulare:", error);
    return res.status(500).json({ error: "Eroare internă de server la rularea binarului C++" });
  }
});

// Pornim serverul propriu-zis
app.listen(PORT, () => {
    console.log(`🚀 Backend-ul InfoMotion rulează pe http://localhost:${PORT}`);
});