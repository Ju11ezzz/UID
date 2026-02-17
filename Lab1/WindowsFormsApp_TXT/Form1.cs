using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;

namespace WindowsFormsApp_TXT
{
    public partial class Form1 : Form
    {
        string currentFilePath = "";
        bool isModified = false;

        public Form1()
        {
            InitializeComponent();
            ApplyModernStyle();
            UpdateTitle();
        }

        private void ApplyModernStyle()
        {
            this.BackColor = Color.WhiteSmoke;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.MinimumSize = new Size(800, 500);
            this.Font = new Font("Segoe UI", 10);

            textBox1.Font = new Font("Consolas", 12);
            textBox1.BackColor = Color.White;
            textBox1.ForeColor = Color.Black;
            textBox1.BorderStyle = BorderStyle.FixedSingle;

            toolStripStatusLabel1.Text = "Готово";
        }

        // Оновлення заголовку з урахуванням зірочки при незбережених змінах
        private void UpdateTitle()
        {
            string fileName = string.IsNullOrEmpty(currentFilePath) ? "Новий файл" : Path.GetFileName(currentFilePath);
            string modifiedMark = isModified ? "*" : "";
            this.Text = $"Текстовий редактор - {fileName}{modifiedMark}";
        }

        private void новийToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (CheckSaveBeforeAction())
            {
                textBox1.Clear();
                currentFilePath = "";
                isModified = false;
                UpdateTitle();
                toolStripStatusLabel1.Text = "Створено новий файл";
            }
        }

        private void відкритиToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!CheckSaveBeforeAction()) return;

            OpenFileDialog openFileDialog = new OpenFileDialog();
            openFileDialog.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*";

            if (openFileDialog.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    currentFilePath = openFileDialog.FileName;
                    textBox1.Text = File.ReadAllText(currentFilePath);
                    isModified = false;
                    UpdateTitle();
                    toolStripStatusLabel1.Text = "Файл відкрито";
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Помилка відкриття: " + ex.Message);
                }
            }
        }

        private void зберегтиToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(currentFilePath))
            {
                SaveFileDialog saveFileDialog = new SaveFileDialog();
                saveFileDialog.Filter = "Text Files (*.txt)|*.txt";

                if (saveFileDialog.ShowDialog() == DialogResult.OK)
                {
                    currentFilePath = saveFileDialog.FileName;
                }
            }

            if (!string.IsNullOrEmpty(currentFilePath))
            {
                try
                {
                    File.WriteAllText(currentFilePath, textBox1.Text);
                    isModified = false;
                    UpdateTitle(); // зірочка зникає після збереження
                    toolStripStatusLabel1.Text = "Файл збережено";
                    MessageBox.Show("Файл успішно збережено!",
                                    "Інформація",
                                    MessageBoxButtons.OK,
                                    MessageBoxIcon.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Помилка збереження: " + ex.Message);
                }
            }
        }

        private void вихідToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (CheckSaveBeforeAction())
                Application.Exit();
        }

        private void textBox1_TextChanged(object sender, EventArgs e)
        {
            isModified = true;
            toolStripStatusLabel1.Text =
                "Символів: " + textBox1.Text.Length +
                " | Рядків: " + textBox1.Lines.Length;

            UpdateTitle(); // оновлення заголовку при редагуванні
        }

        private bool CheckSaveBeforeAction()
        {
            if (!isModified) return true;

            var result = MessageBox.Show(
                "У вас є незбережені зміни. Зберегти їх?",
                "Підтвердження",
                MessageBoxButtons.YesNoCancel,
                MessageBoxIcon.Question);

            if (result == DialogResult.Yes)
            {
                зберегтиToolStripMenuItem_Click(null, null);
                return true;
            }
            else if (result == DialogResult.No)
                return true;
            else
                return false;
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void statusStrip1_ItemClicked(object sender, ToolStripItemClickedEventArgs e)
        {

        }

        private void menuStrip2_ItemClicked(object sender, ToolStripItemClickedEventArgs e)
        {

        }
    }
}
