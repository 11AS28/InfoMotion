export const lessonsData = [
  {
    id: "bubble-sort",
    clasa: "clasa-9",
    titlu: "Algoritmul Bubble Sort",
    descriere: "Învață cum funcționează metoda bulelor pentru ordonarea unui vector.",
   teorie: `Algoritmul Bubble Sort (Metoda Bulelor) este unul dintre cei mai simpli și intuitivi algoritmi de sortare a unui vector. Numele său provine din modul în care funcționează: elementele cu valori mari "ies la suprafață" (ajung la finalul vectorului) treptat, la fel cum bulele de aer se ridică la suprafața apei.

Cum funcționează?
Algoritmul parcurge vectorul de mai multe ori. La fiecare parcurgere, se compară fiecare element cu vecinul său din dreapta. Dacă primul este mai mare decât al doilea, acestea își schimbă locurile între ele (interschimbare/swap). 

Procesul se repetă până când vectorul este complet sortat, adică se face o parcurgere completă în care nu a mai fost necesară nicio interschimbare (ceea ce înseamnă că toate elementele sunt la locul lor).

Etapele algoritmului (pentru o sortare crescătoare):
1. Se compară elementul de pe poziția i cu cel de pe i+1.
2. Dacă v[i] > v[i+1], se interschimbă.
3. Se trece la următoarea pereche.
4. După prima parcurgere completă a vectorului, suntem siguri că cel mai mare element a ajuns pe ultima poziție.
5. Se reia procesul de la începutul vectorului până când nu se mai fac modificări.

Complexitate:
Deși este foarte ușor de înțeles și de scris, Bubble Sort nu este eficient pentru vectori mari. Are o complexitate în timp de O(n²), ceea ce înseamnă că timpul de execuție crește foarte rapid pe măsură ce numărul de elemente din vector devine mai mare.`,   
    

    problemePbinfo: [
      {
        idProblema: "#119",
        titluProblema: "Sortare",
        url: "https://www.pbinfo.ro/probleme/119/sortare"
      },
      {
        idProblema: "#120",
        titluProblema: "Sortare Descrescător",
        url: "https://www.pbinfo.ro/probleme/120/sortaredesc"
      }
    ],
    // ------------------------------------



    
    animatie: "BubbleSortAnim", 
        codCPlusPlus: `#include <iostream>
using namespace std;

int main() {
    int n = 5; // Numarul de elemente din vector
    int v[] = {5, 1, 4, 2, 8}; // Vectorul nesortat
    
    // Variabila care ne spune daca am facut sau nu modificari la ultima parcurgere
    bool sortat; 
    
    do {
        // Presupunem ca vectorul este sortat la inceputul fiecarei parcurgeri
        sortat = true; 
        
        // Parcurgem vectorul pana la penultimul element
        for(int i = 0; i < n - 1; i++) {
            
            // Comparam elementul curent cu vecinul sau din dreapta
            if(v[i] > v[i+1]) {
                
                // Daca nu sunt in ordinea corecta, le interschimbam (facem swap)
                swap(v[i], v[i+1]);
                
                // Deoarece am facut o schimbare, inseamna ca vectorul NU era inca sortat
                sortat = false; 
            }
        }
        
    // Repetam parcurgerea pana cand reusim sa trecem prin tot vectorul 
    // FARA sa mai facem nicio interschimbare (adica sortat ramane true)
    } while(!sortat); 
    
    // Afisarea vectorului dupa sortare
    cout << "Vectorul sortat este: ";
    for(int i = 0; i < n; i++) {
        cout << v[i] << " ";
    }
    
    return 0;
}`
  },
  
  
   {
    id: "variabile-cpp",
    clasa: "clasa-9",
    titlu: "Variabile și Tipuri de Date",
    descriere: "Baza oricărui program: cum stocăm informațiile în memorie.",
    
    teorie: `O variabilă este, în esență, o „cutie” în memoria calculatorului în care putem păstra o anumită valoare. Fiecare variabilă are un nume (pentru a o putea accesa) și un tip de dată (pentru a spune calculatorului ce fel de informație vom stoca în acea cutie).

În C++, trebuie să declarăm tipul variabilei înainte să o folosim. Acest lucru ajută calculatorul să știe exact câtă memorie să rezerve.

Principalele tipuri de date din C++:
• int (Integer): Stochează numere întregi (fără virgulă), cum ar fi -10, 0, sau 42.
• float și double: Stochează numere reale (cu virgulă zecimală), cum ar fi 3.14 sau -0.5. Diferența este că "double" este de două ori mai precis (poate reține mai multe zecimale).
• char (Character): Stochează un singur caracter, cum ar fi 'A' sau '7'. Se scrie mereu între apostrofuri.
• bool (Boolean): Stochează o valoare logică de adevărat (true / 1) sau fals (false / 0).

Reguli pentru numele variabilelor:
1. Pot conține litere, cifre și underscore (_).
2. NU pot începe cu o cifră (ex: "1numar" este greșit, dar "numar1" este corect).
3. NU pot conține spații.
4. C++ este "case-sensitive" (ține cont de majuscule), deci "Var" și "var" sunt două variabile complet diferite.`,

    problemePbinfo: [
      {
        idProblema: "#1",
        titluProblema: "Suma",
        url: "https://www.pbinfo.ro/probleme/1/suma"
      },
      {
        idProblema: "#1260",
        titluProblema: "Adunare",
        url: "https://www.pbinfo.ro/probleme/1260/adunare"
      }
    ],

    animatie: null, // Aici poți pune numele componentei dacă faci o animație în viitor
    
    codCPlusPlus: `#include <iostream>
using namespace std;

int main() {
    // DECLARAREA ȘI INIȚIALIZAREA VARIABILELOR

    // 1. int -> stochează numere întregi (pozitive sau negative)
    int varsta = 16;
    int temperatura = -5;

    // 2. float -> stochează numere cu virgulă (precizie simplă)
    float notaMate = 9.50;

    // 3. double -> stochează numere cu virgulă (precizie dublă, folosit pentru numere mari)
    double numarPi = 3.1415926535;

    // 4. char -> stochează un singur caracter (încadrat mereu între apostrofuri)
    char litera = 'A';
    char operatorMatematic = '+';

    // 5. bool -> stochează o valoare de adevărat (true) sau fals (false)
    bool esteElev = true;
    bool aPicatTestul = false;

    // Afișarea variabilelor pe ecran
    cout << "Varsta: " << varsta << " ani" << endl;
    cout << "Nota la matematica: " << notaMate << endl;
    cout << "Litera magica este: " << litera << endl;

    // Putem modifica valoarea unei variabile mai târziu în program
    varsta = 17; // Anul viitor
    cout << "Varsta de anul viitor va fi: " << varsta << endl;

    return 0;
}`
  },
    {
    id: "cautare-binara",
    clasa: "clasa-10",
    titlu: "Algoritmul de Căutare Binară",
    descriere: "Învață cum să găsești rapid un element într-un vector ordonat prin înjumătățiri succesive.",
    
    teorie: `Algoritmul de Căutare Binară este una dintre cele mai rapide și eficiente metode de a găsi o valoare într-un șir de elemente. 

Condiția obligatorie: Pentru ca acest algoritm să poată fi aplicat, elementele vectorului TREBUIE să fie sortate (ordonate) anterior aplicării metodei de căutare!

Care este logica din spate?
În loc să verificăm fiecare element rând pe rând (căutare secvențială), Căutarea Binară verifică mereu elementul din mijlocul intervalului. 

Vom lucra cu trei indici importanți:
• st (stânga) - marchează începutul intervalului de căutare (inițial 1 sau 0).
• dr (dreapta) - marchează sfârșitul intervalului (inițial n, lungimea vectorului).
• m (mijlocul) - poziția elementului aflat la jumătatea distanței dintre 'st' și 'dr' (calculat ca m = (st + dr) / 2).

Cum funcționează pas cu pas?
1. Se calculează poziția de mijloc: m = (st + dr) / 2.
2. Se compară elementul căutat (x) cu valoarea din mijloc v[m].
   - Cazul A: Dacă x == v[m], am găsit elementul! Căutarea se oprește cu succes.
   - Cazul B: Dacă x < v[m], înseamnă că x se poate afla doar în jumătatea din stânga. Ignorăm partea dreaptă și setăm noul 'dr' ca fiind m - 1.
   - Cazul C: Dacă x > v[m], înseamnă că x se poate afla doar în jumătatea din dreapta. Ignorăm partea stângă și setăm noul 'st' ca fiind m + 1.
3. Procesul se repetă cât timp stânga este mai mic sau egal cu dreapta (st <= dr) și elementul nu a fost încă găsit.

Dacă bucla se încheie și elementul nu a fost găsit, înseamnă că valoarea căutată nu există în vector.

Complexitate:
Eficiența acestui algoritm este extraordinară! În loc de o complexitate O(n) (cum are căutarea secvențială), Căutarea Binară are o complexitate de O(log n). Dacă ai un dicționar cu 1.000.000 de cuvinte, vei găsi cuvântul căutat în cel mult 20 de verificări!`,

    problemePbinfo: [
      {
        idProblema: "#508",
        titluProblema: "Cautare Binara",
        url: "https://www.pbinfo.ro/probleme/508/cautare-binara"
      },
      {
        idProblema: "#2442",
        titluProblema: "Cautare Binara 2",
        url: "https://www.pbinfo.ro/probleme/2442/cautare-binara-2"
      }
    ],

    animatie: "CautareBinaraAnim", // Mai târziu poți crea o animație care taie un vector în două pe ecran
    
    codCPlusPlus: `#include <iostream>
using namespace std;

// Funcție care returnează poziția (indexul) pe care a fost găsit elementul x
// Returnează -1 dacă elementul nu există în vector
int cautareBinara(int v[], int n, int x) {
    // 1. Inițializăm capetele intervalului
    int st = 0;         // Prima poziție din vector (indexare de la 0)
    int dr = n - 1;     // Ultima poziție din vector
    
    // 2. Căutăm atâta timp cât intervalul este valid
    while (st <= dr) {
        
        // Calculăm mijlocul intervalului curent
        int m = (st + dr) / 2;
        
        // Verificăm dacă elementul din mijloc este exact cel căutat
        if (v[m] == x) {
            return m; // Element găsit! Returnăm poziția.
        }
        
        // Dacă elementul căutat este mai mic, căutăm doar în stânga
        if (x < v[m]) {
            dr = m - 1; // Mutăm capătul din dreapta înaintea mijlocului
        }
        // Dacă elementul căutat este mai mare, căutăm doar în dreapta
        else {
            st = m + 1; // Mutăm capătul din stânga după mijloc
        }
    }
    
    // 3. Dacă ieșim din while fără a găsi elementul (când st > dr)
    return -1; // Elementul nu există în vector
}

int main() {
    // ATENȚIE: Vectorul trebuie să fie ordonat crescător!
    int n = 7;
    int v[] = {2, 5, 8, 12, 16, 23, 38};
    int x = 16; // Elementul pe care îl căutăm
    
    int pozitie = cautareBinara(v, n, x);
    
    if (pozitie != -1) {
        cout << "Elementul " << x << " a fost gasit pe pozitia: " << pozitie << endl;
    } else {
        cout << "Elementul " << x << " NU a fost gasit in vector." << endl;
    }
    
    return 0;
}`
  }
];