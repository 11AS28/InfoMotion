// src/components/animations/BubbleSortAnim.jsx
import React, { useState, useEffect } from 'react';
// Asigură-te că ai CSS-ul pentru bare aici sau importat global

const INITIAL_ARRAY = [24, 18, 35, 12, 42, 8];

function BubbleSortAnim() {
  const [array, setArray] = useState(INITIAL_ARRAY);
  const [activeIndices, setActiveIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);

  const startBubbleSort = async () => {
    let arr = [...INITIAL_ARRAY];
    setArray([...arr]);
    setSortedIndices([]);
    let n = arr.length;
    let localSorted = [];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        setActiveIndices([j, j + 1]);
        await sleep(500);

        if (arr[j] > arr[j + 1]) {
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swapped = true;
          setArray([...arr]);
          await sleep(500);
        }
      }
      localSorted.push(n - i - 1);
      setSortedIndices([...localSorted]);
      if (!swapped) break;
    }
    setSortedIndices([...Array(n).keys()]);
    setActiveIndices([]);
  };

  return (
    <div className="visualizer-container" style={{ margin: "40px 0" }}>
      <h3 style={{ textAlign: "center", marginBottom: "30px" }}>Visualizer Bubble Sort</h3>
      <div className="bars-container" style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "12px", height: "200px", borderBottom: "2px solid #cbd5e1", paddingBottom: "10px" }}>
        {array.map((value, index) => {
          let bgColor = '#01696f';
          if (activeIndices.includes(index)) bgColor = '#ef4444';
          else if (sortedIndices.includes(index)) bgColor = '#22c55e';

          return (
            <div 
              key={index} 
              className="bar" 
              style={{ 
                height: `${value * 4}px`, 
                width: "40px",
                backgroundColor: bgColor,
                borderRadius: "6px 6px 0 0",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                transition: "height 0.4s ease, background-color 0.2s ease"
              }}
            >
              <span style={{ position: "absolute", top: "-25px", fontWeight: "bold", color: "#475569" }}>{value}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button className="button" onClick={startBubbleSort}>Pornește Animația</button>
      </div>
    </div>
  );
}

export default BubbleSortAnim;