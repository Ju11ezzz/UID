import { useState, useEffect } from 'react'

function App() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [status, setStatus] = useState("Очікування");

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCreate = () => {
    if (hasUnsavedChanges && !window.confirm("Є незбережені зміни. Продовжити без збереження?")) return;
    setText("");
    setFileName("new_file.txt");
    setHasUnsavedChanges(false);
    setStatus("Створено");
  };

  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (hasUnsavedChanges && !window.confirm("Є незбережені зміни. Продовжити без збереження?")) {
      e.target.value = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target.result);
      setFileName(file.name);
      setHasUnsavedChanges(false);
      setStatus("Відкрито");
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleSave = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "document.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    setHasUnsavedChanges(false);
    setStatus("Збережено");
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setHasUnsavedChanges(true);
    setStatus("Редагування...");
  };

  const handleExit = () => {
    if (hasUnsavedChanges && !window.confirm("Є незбережені зміни. Вийти без збереження?")) return;
    window.location.reload();
  };

  const isEditing = fileName !== "";

  return (
    <div className="min-h-screen bg-[#111111] flex items-start justify-center pt-24 p-4 font-sans text-white">
      <div className="flex flex-col w-full max-w-[850px] h-[60vh] bg-[#2d2d2d] rounded-lg shadow-2xl overflow-hidden">
        
        <header className="flex flex-col px-6 py-4 bg-[#2d2d2d]">
          <span className="text-[#888888] text-[13px] font-medium mb-3">Текстовий редактор</span>
          <div className="flex items-center gap-2">
            <button onClick={handleCreate} className="px-5 py-1.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-[13px] font-medium transition">Новий</button>
            <label className="px-5 py-1.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded cursor-pointer text-[13px] font-medium transition">
              Відкрити
              <input type="file" accept=".txt" onChange={handleOpen} className="hidden" />
            </label>
            <button onClick={handleSave} disabled={!isEditing} className={`px-5 py-1.5 bg-[#3c3c3c] rounded text-[13px] font-medium transition ${isEditing ? 'hover:bg-[#4c4c4c]' : 'opacity-50 cursor-not-allowed'}`}>Зберегти</button>
            <button onClick={handleExit} className="px-5 py-1.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-[13px] font-medium transition">Вихід</button>
          </div>
        </header>

        <main className="flex-grow flex flex-col bg-[#1f1f1f] border-t border-[#3a3a3a]">
          {isEditing ? (
            <textarea
              className="flex-grow p-6 bg-transparent text-[#e0e0e0] text-sm font-medium outline-none resize-none"
              value={text}
              onChange={handleTextChange}
              spellCheck="false"
            />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <h1 className="text-3xl font-bold mb-3">Привіт 👋</h1>
              <p className="text-[#777777] text-[13px] font-medium">Натисніть "Новий" або "Відкрити", щоб розпочати.</p>
            </div>
          )}
        </main>

        <footer className="px-6 py-2.5 text-[#666666] text-[12px] font-medium flex justify-between bg-[#1f1f1f] border-t border-[#2a2a2a]">
          <span>{fileName ? `Файл: ${fileName}${hasUnsavedChanges ? '*' : ''}` : 'Файл не обрано'}</span>
          <span>Символів: {text.length} | Рядків: {text ? text.split('\n').length : 1} | {status}</span>
        </footer>
        
      </div>
    </div>
  );
}

export default App;