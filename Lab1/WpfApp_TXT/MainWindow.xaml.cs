using Microsoft.Win32;
using System;
using System.IO;
using System.Windows;

namespace TextEditor_WPF
{
    public partial class MainWindow : Window
    {
        string currentFilePath = "";
        bool isModified = false;

        public MainWindow()
        {
            InitializeComponent();
            UpdateTitle();
        }

        // Оновлення заголовку з урахуванням зірочки при незбережених змінах
        private void UpdateTitle()
        {
            string fileName = string.IsNullOrEmpty(currentFilePath) ? "Новий файл" : Path.GetFileName(currentFilePath);
            string modifiedMark = isModified ? "*" : "";
            this.Title = $"Текстовий редактор - {fileName}{modifiedMark}";
        }

        private void NewFile_Click(object sender, RoutedEventArgs e)
        {
            if (!CheckSaveBeforeAction()) return;

            textBox.Clear();
            currentFilePath = "";
            isModified = false;
            UpdateTitle();
            statusText.Text = "Створено новий файл";
        }

        private void OpenFile_Click(object sender, RoutedEventArgs e)
        {
            if (!CheckSaveBeforeAction()) return;

            OpenFileDialog openFileDialog = new OpenFileDialog();
            openFileDialog.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*";

            if (openFileDialog.ShowDialog() == true)
            {
                try
                {
                    currentFilePath = openFileDialog.FileName;
                    textBox.Text = File.ReadAllText(currentFilePath);
                    isModified = false;
                    UpdateTitle();
                    statusText.Text = "Файл відкрито";
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Помилка відкриття файлу: " + ex.Message);
                }
            }
        }

        private void SaveFile_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(currentFilePath))
            {
                SaveFileDialog saveFileDialog = new SaveFileDialog();
                saveFileDialog.Filter = "Text Files (*.txt)|*.txt";

                if (saveFileDialog.ShowDialog() == true)
                {
                    currentFilePath = saveFileDialog.FileName;
                }
            }

            if (!string.IsNullOrEmpty(currentFilePath))
            {
                try
                {
                    File.WriteAllText(currentFilePath, textBox.Text);
                    isModified = false;
                    UpdateTitle(); // зірочка зникає після збереження
                    statusText.Text = "Файл збережено";
                    MessageBox.Show("Файл успішно збережено!", "Інформація", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Помилка збереження файлу: " + ex.Message);
                }
            }
        }

        private void Exit_Click(object sender, RoutedEventArgs e)
        {
            if (CheckSaveBeforeAction())
                Application.Current.Shutdown();
        }

        private void textBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
        {
            isModified = true;
            statusText.Text = $"Символів: {textBox.Text.Length} | Рядків: {textBox.LineCount}";
            UpdateTitle(); // оновлення заголовку при редагуванні
        }

        private bool CheckSaveBeforeAction()
        {
            if (!isModified) return true;

            var result = MessageBox.Show(
                "У вас є незбережені зміни. Зберегти їх?",
                "Підтвердження",
                MessageBoxButton.YesNoCancel,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                SaveFile_Click(null, null);
                return true;
            }
            else if (result == MessageBoxResult.No)
                return true;
            else
                return false;
        }
    }
}
