const algoritmiCunoscuti = {
  // === CLASA 9 ===
  "bubble sort": "bubble-sort",
  "metoda bulelor": "bubble-sort",
  "sortarea prin metoda bulelor": "bubble-sort",
  
  "descompunere in factori primi": "descompunere-factori-primi",
  "factori primi": "descompunere-factori-primi",
  
  "fibonacci": "generarea-sirului-fibonacci",
  "sirul lui fibonacci": "generarea-sirului-fibonacci",
  
  "interclasare": "interclasare-vectori",
  "interclasarea vectorilor": "interclasare-vectori",
  
  "matrici": "matrici",
  "matrice": "matrici",
  "tablou bidimensional": "matrici",
  
  "operatori": "operatori-si-expresii",
  "expresii in c++": "operatori-si-expresii",
  
  "cifrele unui numar": "procesarea-cifrelor-unui-numar",
  "extragererea cifrelor": "procesarea-cifrelor-unui-numar",
  
  "sortare prin insertie": "sortare-insertie",
  "insertion sort": "sortare-insertie",
  
  "sortare prin interschimbare": "sortare-interschimbare",
  "metoda interschimbarii": "sortare-interschimbare",
  
  "sortare prin selectie": "sortare-selectie",
  "selection sort": "sortare-selectie",
  
  "if": "structuri-decizionale-if-switch",
  "switch": "structuri-decizionale-if-switch",
  "structura decizionala": "structuri-decizionale-if-switch",
  
  "sume partiale": "sume-partiale-1d",
  "sume partiale in vectori": "sume-partiale-1d",
  
  "variabile": "variabile-cpp",
  "tipuri de date": "variabile-cpp",
  "int": "variabile-cpp",
  
  "vector": "vectori-introducere",
  "vectori": "vectori-introducere",
  "tablou unidimensional": "vectori-introducere",
  
  "numar prim": "verificare-numar-prim",
  "verificare prim": "verificare-numar-prim",

  // === CLASA 10 ===
  "analiza combinatorica": "analiza-combinatorica",
  "combinari": "analiza-combinatorica",
  "permutari": "analiza-combinatorica",
  "aranjamente": "analiza-combinatorica",
  
  "cautare binara": "cautare-binara",
  "binary search": "cautare-binara",
  
  "divide et impera": "divide-et-impera",
  
  "recursivitate": "introducere-in-recursivitate-stiva",
  "stiva sistemului": "introducere-in-recursivitate-stiva",
  "functii recursive": "introducere-in-recursivitate-stiva",
  
  "merge sort": "merge-sort",
  "sortare prin interclasare": "merge-sort",
  
  "quick sort": "quick-sort",
  "quicksort": "quick-sort",
  
  "siruri de caractere": "siruri-de-caractere",
  "char": "siruri-de-caractere",
  
  "strchr": "siruri-functii-cautare",
  "strrchr": "siruri-functii-cautare",
  "strstr": "siruri-functii-cautare",
  
  "strcat": "siruri-strcat-strtok",
  "strtok": "siruri-strcat-strtok",
  
  "strcmp": "siruri-strcmp-strrev",
  "strrev": "siruri-strcmp-strrev",
  
  "strlen": "siruri-strlen-strcpy",
  "strcpy": "siruri-strlen-strcpy",
  
  "struct": "structuri-de-date-neomogene",
  "structuri": "structuri-de-date-neomogene",

  // === CLASA 11 ===
  "bfs": "grafuri-intoducere-bfs",
  "parcurgere in latime": "grafuri-intoducere-bfs",
  "breadth first search": "grafuri-intoducere-bfs",
  
  "graf": "grafuri-introducere-concept",
  "grafuri": "grafuri-introducere-concept",
  "graf neorientat": "grafuri-introducere-concept",
  
  "greedy": "metoda-greedy",
  "metoda greedy": "metoda-greedy",

  // === OLIMPICI ===
  "sliding window": "sliding-window-deque",
  "deque": "sliding-window-deque",
  
  "smenul lui mars": "smenul-lui-mars",
  "vector de diferente": "smenul-lui-mars",
  
  "stiva monotona": "stiva-monotona",
  
  "sume partiale 2d": "sume-partiale-2d",
  "sume partiale in matrice": "sume-partiale-2d",

  // === CONCEPTE ===
  "complexitate": "complexitatea-algoritmilor",
  "timp de executie": "complexitatea-algoritmilor",
  "o(n)": "complexitatea-algoritmilor",
  "o(n log n)": "complexitatea-algoritmilor",
  
  "cum functioneaza calculatorul": "introducere-cum-functioneaza-calculatorul-cpp",
  "tranzistori": "introducere-cum-functioneaza-calculatorul-cpp",
  
  "matchmaking": "matchmaking-jocuri",
  "elo": "matchmaking-jocuri",
  
  "prng": "prng-pacanele",
  "random": "prng-pacanele",
  
  "turnurile din hanoi": "turnurile-din-hanoi",
  "hanoi": "turnurile-din-hanoi"
};

document.addEventListener('mouseup', function(event) {
  if (event.target.id === 'info-redirect-btn' || event.target.id === 'info-not-found-btn') {
    return;
  }
  
  let textSelectat = window.getSelection().toString().trim().toLowerCase();
  
  
  let btnGasit = document.getElementById('info-redirect-btn');
  let btnNegasit = document.getElementById('info-not-found-btn');
  if (btnGasit) btnGasit.remove();
  if (btnNegasit) btnNegasit.remove();

  if (textSelectat.length > 0) {
    if (algoritmiCunoscuti[textSelectat]) {
      
      let idLectie = algoritmiCunoscuti[textSelectat];
      creeazaButonRedirect(idLectie, event.pageX, event.pageY);
    } else if (textSelectat.length <= 30) {
      creeazaButonIndisponibil(event.pageX, event.pageY);
    }
  }
});

function creeazaButonRedirect(idLectie, x, y) {
  let btn = document.createElement('a');
  btn.id = 'info-redirect-btn';
  btn.href = `https://infomotion.space/lectie/${idLectie}`;
  btn.target = "_blank"; 
  
  btn.style.position = 'absolute';
  btn.style.left = `${x}px`;
  btn.style.top = `${y - 40}px`; 
  btn.style.backgroundColor = '#2ea8b0'; 
  btn.style.color = 'white';
  btn.style.padding = '8px 12px';
  btn.style.borderRadius = '8px';
  btn.style.textDecoration = 'none';
  btn.style.fontWeight = 'bold';
  btn.style.fontSize = '14px';
  btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  btn.style.zIndex = '999999';
  btn.style.cursor = 'pointer';
  
  btn.innerText = 'Vezi animația InfoMotion';
  
  document.body.appendChild(btn);
}

function creeazaButonIndisponibil(x, y) {
  let btn = document.createElement('div');
  btn.id = 'info-not-found-btn';
  
  btn.style.position = 'absolute';
  btn.style.left = `${x}px`;
  btn.style.top = `${y - 40}px`; 

  btn.style.backgroundColor = '#4b5563'; 
  btn.style.color = '#d1d5db'; 
  btn.style.padding = '8px 12px';
  btn.style.borderRadius = '8px';
  btn.style.fontWeight = 'bold';
  btn.style.fontSize = '14px';
  btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  btn.style.zIndex = '999999';
  btn.style.cursor = 'default'; 
  
  btn.innerText = 'Nu este pe InfoMotion';
  
  document.body.appendChild(btn);
}

document.addEventListener('mousedown', function(event) {
  let btnGasit = document.getElementById('info-redirect-btn');
  let btnNegasit = document.getElementById('info-not-found-btn');
  

  if (btnGasit && event.target.id !== 'info-redirect-btn') btnGasit.remove();
  if (btnNegasit && event.target.id !== 'info-not-found-btn') btnNegasit.remove();
});