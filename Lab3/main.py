import sys
import os
from PySide6.QtWidgets import (QApplication, QMainWindow, QTextEdit, 
                             QFileDialog, QDialog, QVBoxLayout, 
                             QWidget, QPushButton, QHBoxLayout, QLabel, QFrame)
from PySide6.QtCore import Qt, QStandardPaths

# --- Клас кастомного вікна попередження ---
class CustomSaveDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.Dialog)
        self.setObjectName("CustomDialog")
        self.setFixedSize(480, 210)
        self.result_value = "cancel"

        layout = QVBoxLayout(self)
        layout.setContentsMargins(35, 30, 35, 30)

        title = QLabel("Попередження")
        title.setObjectName("DialogTitle")
        layout.addWidget(title)

        text = QLabel("У вас є незбережені зміни. Зберегти перед продовженням?")
        text.setObjectName("DialogText")
        text.setWordWrap(True)
        layout.addWidget(text)

        layout.addStretch()

        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)

        self.btn_yes = QPushButton("Так")
        self.btn_yes.setObjectName("BtnYes")
        self.btn_yes.setFocusPolicy(Qt.NoFocus)
        self.btn_yes.clicked.connect(lambda: self.done_with_val("yes"))

        self.btn_no = QPushButton("Ні")
        self.btn_no.setObjectName("BtnNo")
        self.btn_no.setFocusPolicy(Qt.NoFocus)
        self.btn_no.clicked.connect(lambda: self.done_with_val("no"))

        self.btn_cancel = QPushButton("Скасувати")
        self.btn_cancel.setObjectName("BtnCancel")
        self.btn_cancel.setFocusPolicy(Qt.NoFocus)
        self.btn_cancel.clicked.connect(self.reject)

        btn_layout.addStretch()
        btn_layout.addWidget(self.btn_yes)
        btn_layout.addWidget(self.btn_no)
        btn_layout.addWidget(self.btn_cancel)
        layout.addLayout(btn_layout)

    def done_with_val(self, val):
        self.result_value = val
        self.accept()

# --- Головне вікно ---
class QtTextEditor(QMainWindow):
    def __init__(self):
        super().__init__()
        # Прибираємо системні рамки
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.Window)
        self.resize(1000, 750)
        
        self.current_path = None
        self.is_modified = False

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)

        self.init_ui()
        self.load_styles()

    def load_styles(self):
        base_path = os.path.dirname(__file__)
        style_path = os.path.join(base_path, "styles.qss")
        if os.path.exists(style_path):
            with open(style_path, "r", encoding="utf-8") as f:
                self.setStyleSheet(f.read())

    def init_ui(self):
        # 1. Заголовок
        self.title_bar = QFrame()
        self.title_bar.setObjectName("TitleBar")
        self.title_bar.setFixedHeight(40)
        title_layout = QHBoxLayout(self.title_bar)
        title_layout.setContentsMargins(15, 0, 15, 0)
        self.window_title_label = QLabel("Текстовий редактор")
        self.window_title_label.setObjectName("WindowTitleLabel")
        title_layout.addWidget(self.window_title_label)
        title_layout.addStretch()
        self.main_layout.addWidget(self.title_bar)

        # 2. Панель кнопок
        self.toolbar = QFrame()
        self.toolbar.setObjectName("Toolbar")
        self.toolbar.setFixedHeight(65)
        tool_layout = QHBoxLayout(self.toolbar)
        tool_layout.setContentsMargins(15, 0, 15, 0)
        tool_layout.setSpacing(10)

        btns = [("Новий", self.new_file), ("Відкрити", self.open_file), 
                ("Зберегти", self.save_file), ("Вихід", self.exit_app)]
        for text, slot in btns:
            btn = QPushButton(text)
            btn.setFocusPolicy(Qt.NoFocus) # Прибирає фокус з кнопок
            btn.clicked.connect(slot)
            tool_layout.addWidget(btn)
        
        tool_layout.addStretch()
        self.main_layout.addWidget(self.toolbar)

        # 3. Центральна частина
        self.content_stack = QWidget()
        self.content_layout = QVBoxLayout(self.content_stack)
        self.content_layout.setContentsMargins(0, 0, 0, 0)

        self.welcome_widget = QWidget()
        v_layout = QVBoxLayout(self.welcome_widget)
        v_layout.setAlignment(Qt.AlignCenter)
        t1 = QLabel("Привіт 👋"); t1.setObjectName("WelcomeTitle")
        t2 = QLabel('Натисніть "Новий" або "Відкрити", щоб розпочати.'); t2.setObjectName("WelcomeSub")
        v_layout.addWidget(t1, 0, Qt.AlignCenter)
        v_layout.addSpacing(15)
        v_layout.addWidget(t2, 0, Qt.AlignCenter)

        self.editor = QTextEdit()
        self.editor.hide()
        self.editor.textChanged.connect(self.handle_text_change)

        self.content_layout.addWidget(self.welcome_widget)
        self.content_layout.addWidget(self.editor)
        self.main_layout.addWidget(self.content_stack, 1) # Stretch = 1 розтягує редактор

        # 4. Статус-бар
        self.status_bar = QFrame()
        self.status_bar.setObjectName("StatusBar")
        self.status_bar.setFixedHeight(35)
        status_layout = QHBoxLayout(self.status_bar)
        status_layout.setContentsMargins(15, 0, 15, 0)
        self.stats_label = QLabel("Символів: 0 | Рядків: 1")
        self.stats_label.setObjectName("StatsLabel")
        self.status_msg = QLabel("Готово")
        self.status_msg.setObjectName("StatusMsg")
        status_layout.addWidget(self.stats_label)
        status_layout.addStretch()
        status_layout.addWidget(self.status_msg)
        self.main_layout.addWidget(self.status_bar)

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_pos)
            event.accept()

    def maybe_save(self):
        if not self.is_modified: return True
        dialog = CustomSaveDialog(self)
        if dialog.exec():
            if dialog.result_value == "yes": return self.save_file()
            if dialog.result_value == "no": return True
        return False

    def new_file(self):
        if self.maybe_save():
            self.welcome_widget.hide(); self.editor.show()
            self.editor.clear(); self.current_path = None
            self.is_modified = False
            self.window_title_label.setText("Новий файл")
            self.status_msg.setText("Створено новий файл")

    def open_file(self):
        if self.maybe_save():
            docs = QStandardPaths.writableLocation(QStandardPaths.DocumentsLocation)
            path, _ = QFileDialog.getOpenFileName(self, "Відкрити", docs, "Текстові файли (*.txt)")
            if path:
                self.welcome_widget.hide(); self.editor.show()
                with open(path, 'r', encoding='utf-8') as f: self.editor.setPlainText(f.read())
                self.current_path = path; self.is_modified = False
                self.window_title_label.setText(os.path.basename(path))
                self.status_msg.setText("Файл успішно відкрито")

    def save_file(self):
        if not self.current_path:
            docs = QStandardPaths.writableLocation(QStandardPaths.DocumentsLocation)
            path, _ = QFileDialog.getSaveFileName(self, "Зберегти", docs, "Текстові файли (*.txt)")
            if not path: return False
            self.current_path = path
        with open(self.current_path, 'w', encoding='utf-8') as f: f.write(self.editor.toPlainText())
        self.is_modified = False
        self.window_title_label.setText(os.path.basename(self.current_path))
        self.status_msg.setText("Файл збережено")
        return True

    def handle_text_change(self):
        self.is_modified = True
        name = os.path.basename(self.current_path) if self.current_path else "Новий файл"
        self.window_title_label.setText(name + " *")
        text = self.editor.toPlainText()
        lines = text.count('\n') + 1 if text else 1
        self.stats_label.setText(f"Символів: {len(text)} | Рядків: {lines}")
        self.status_msg.setText("Редагування...")

    def exit_app(self):
        if self.maybe_save(): self.close()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = QtTextEditor()
    window.show()
    sys.exit(app.exec())