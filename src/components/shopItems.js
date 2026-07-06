export const shopItems = [
  {
    id: "theme_default",
    name: "Classic Slate",
    price: 0,
    description: "Tema implicită a platformei InfoMotion.",
    category: "editor",
    previewColor: "#1e1e1e"
  },
  {
    id: "theme_cyberpunk",
    name: "Cyberpunk 2077",
    price: 150,
    description: "Culori neon stridente, perfecte pentru sesiunile de codat nocturne.",
    category: "editor",
    previewColor: "#fcee0a"
  },
  {
    id: "theme_dracula",
    name: "Dracula Vampire",
    price: 300,
    description: "Tema clasică și iubită de programatori, bazată pe nuanțe de mov închis.",
    category: "editor",
    previewColor: "#282a36"
  },
  {
    id: "theme_matrix",
    name: "Matrix Code",
    price: 500,
    description: "Intră în simulare. Monocrom verde digital pe fundal negru intens.",
    category: "editor",
    previewColor: "#00FF00"
  }
];

export const customThemes = {
  theme_dracula: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'identifier', foreground: 'f8f8f2' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#6272a4',
      'editorLineNumber.activeForeground': '#ff79c6',
      'editor.lineHighlightBackground': '#44475a',
      'editor.selectionBackground': '#44475a',
    }
  },
  theme_cyberpunk: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '00f0ff', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff0055', fontStyle: 'bold' },
      { token: 'string', foreground: 'fcee0a' },
      { token: 'number', foreground: '3f00ff' },
      { token: 'type', foreground: '00f0ff' },
    ],
    colors: {
      'editor.background': '#120418',
      'editor.foreground': '#fcee0a',
      'editorLineNumber.foreground': '#ff0055',
      'editorLineNumber.activeForeground': '#00f0ff',
      'editor.lineHighlightBackground': '#1a0826',
      'editor.selectionBackground': '#ff005533',
    }
  },
  theme_matrix: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008800', fontStyle: 'italic' },
      { token: 'keyword', foreground: '00ff00', fontStyle: 'bold' },
      { token: 'string', foreground: '00dd00' },
      { token: 'number', foreground: '00ff00' },
      { token: 'identifier', foreground: '00ff00' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#00ff00',
      'editorLineNumber.foreground': '#005500',
      'editorLineNumber.activeForeground': '#00ff00',
      'editor.lineHighlightBackground': '#001100',
      'editor.selectionBackground': '#003300',
    }
  }
};