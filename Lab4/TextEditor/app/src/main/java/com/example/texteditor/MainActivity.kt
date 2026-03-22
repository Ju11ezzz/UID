package com.example.texteditor

import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var editor: EditText
    private lateinit var welcomeContainer: View // Тип змінено з TextView на View
    private lateinit var statusStats: TextView
    private lateinit var statusMessage: TextView

    private var isModified = false
    private var currentUri: Uri? = null

    private val openFileLauncher = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        uri?.let {
            currentUri = it
            val text = contentResolver.openInputStream(it)?.bufferedReader()?.use { reader -> reader.readText() } ?: ""
            showEditor(text)
            statusMessage.text = "Файл відкрито"
        }
    }

    private val saveFileLauncher = registerForActivityResult(ActivityResultContracts.CreateDocument("text/plain")) { uri: Uri? ->
        uri?.let {
            currentUri = it
            writeTextToUri(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        editor = findViewById(R.id.editor)
        welcomeContainer = findViewById(R.id.welcomeContainer) // Знаходимо новий блок
        statusStats = findViewById(R.id.statusStats)
        statusMessage = findViewById(R.id.statusMessage)

        editor.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                if (!isModified && s?.isNotEmpty() == true) {
                    isModified = true
                    statusMessage.text = "Редагування..."
                }
                val charCount = s?.length ?: 0
                val lineCount = if (charCount == 0) 1 else s.toString().split("\n").size
                statusStats.text = "Символів: $charCount | Рядків: $lineCount"
            }
        })

        findViewById<Button>(R.id.btnNew).setOnClickListener { maybeSave { clearEditor() } }
        findViewById<Button>(R.id.btnOpen).setOnClickListener { maybeSave { openFileLauncher.launch(arrayOf("text/plain")) } }
        findViewById<Button>(R.id.btnSave).setOnClickListener { saveFile() }
        findViewById<Button>(R.id.btnExit).setOnClickListener { maybeSave { finish() } }
    }

    private fun showEditor(text: String) {
        welcomeContainer.visibility = View.GONE // Ховаємо блок привітання
        editor.visibility = View.VISIBLE
        editor.setText(text)
        isModified = false

        editor.postDelayed({
            editor.requestFocus()
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showSoftInput(editor, 0)
        }, 100)
    }

    private fun clearEditor() {
        currentUri = null
        showEditor("") // Викликаємо showEditor, щоб сховати привітання
        statusMessage.text = "Новий файл"
    }

    private fun saveFile() {
        if (currentUri != null) {
            writeTextToUri(currentUri!!)
        } else {
            saveFileLauncher.launch("Новий_документ.txt")
        }
    }

    private fun writeTextToUri(uri: Uri) {
        try {
            contentResolver.openOutputStream(uri)?.use { it.write(editor.text.toString().toByteArray()) }
            isModified = false
            statusMessage.text = "Збережено"
            Toast.makeText(this, "Успішно збережено", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Помилка збереження", Toast.LENGTH_SHORT).show()
        }
    }

    private fun maybeSave(onComplete: () -> Unit) {
        if (isModified) {
            AlertDialog.Builder(this)
                .setTitle("Увага")
                .setMessage("Зберегти поточні зміни?")
                .setPositiveButton("Так") { _, _ ->
                    saveFile()
                    if (currentUri != null) onComplete()
                }
                .setNegativeButton("Ні") { _, _ -> onComplete() }
                .setNeutralButton("Скасувати", null)
                .show()
        } else {
            onComplete()
        }
    }
}