import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [fileName, setFileName] = useState(""); 
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef();

  // Визначаємо, чи розпочато роботу (чи є файл або текст)
  const hasContent = fileName !== "" || text !== "";

  // Відстеження незбережених змін
  useEffect(() => {
    setIsDirty(text !== savedText);
  }, [text, savedText]);

  // Попередження при спробі закрити вкладку браузера
  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Створити новий файл
  const handleNew = () => {
    if (isDirty && !window.confirm("Є незбережені зміни. Продовжити?")) return;
    setText("");
    setSavedText("");
    setFileName("untitled.txt");
  };

  // Натискання на кнопку "Відкрити" з перевіркою змін
  const onOpenButtonClick = () => {
    if (isDirty && !window.confirm("Є незбережені зміни. Відкрити інший файл?")) {
      return;
    }
    fileInputRef.current.click();
  };

  // Обробка вибору файлу
  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setText(content);
      setSavedText(content);
      setFileName(file.name);
      e.target.value = null; // Скидаємо інпут
    };
    reader.readAsText(file);
  };

  // Збереження файлу
  const handleSave = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "untitled.txt";
    link.click();

    setSavedText(text);
  };

  // Вихід (закриття файлу)
  const handleClose = () => {
    if (isDirty && !window.confirm("Є незбережені зміни. Закрити файл?")) return;
    setText("");
    setSavedText("");
    setFileName("");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="title">Текстовий редактор</div>
        <div className="menu">
          <button onClick={handleNew}>Новий</button>
          <button onClick={onOpenButtonClick}>Відкрити</button>
          <button onClick={handleSave} disabled={!isDirty || !fileName}>
            Зберегти
          </button>
          <button onClick={handleClose}>Вихід</button>
        </div>
        <input
          type="file"
          accept=".txt"
          ref={fileInputRef}
          onChange={handleOpen}
          hidden
        />
      </header>

      <div className="editor-container">
        {!hasContent && (
          <div className="welcome-screen">
            <h1>Привіт 👋</h1>
            <p>Натисніть "Новий" або "Відкрити", щоб розпочати.</p>
          </div>
        )}
        <textarea
          className="editor"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Почніть вводити текст..."
          spellCheck="false"
          style={{ display: hasContent ? "block" : "none" }}
        />
      </div>

      <div className="statusbar">
        <span className="filename">
          {fileName ? `${fileName}${isDirty ? " *" : ""}` : "Файл не обрано"}
        </span>
        <span className="stats">
          Символів: {text.length} | Рядків: {text.split('\n').length} | Готово
        </span>
      </div>
    </div>
  );
}

export default App;