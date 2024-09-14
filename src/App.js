import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import pdfParse from 'pdf-parse';
import axios from 'axios';

function App() {
  const [pdfText, setPdfText] = useState('');
  const [htmlResume, setHtmlResume] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleFileUpload = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const data = await file.arrayBuffer();
    const pdfData = await pdfParse(data);
    setPdfText(pdfData.text);
  };

  const generateHtmlResume = async () => {
    if (!apiKey) {
      alert('Please provide a valid OpenAI API key.');
      return;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions',
        {
          model: 'text-davinci-003',
          prompt: `Convert the following text into a structured HTML resume format:\n\n${pdfText}`,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setHtmlResume(response.data.choices[0].text);
    } catch (error) {
      console.error('Error generating HTML resume:', error);
    }
  };

  return (
    <div>
      <h1>LinkedIn PDF to HTML Resume</h1>

      <label>Enter OpenAI API Key:</label>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Your OpenAI API Key"
      />

      <Dropzone onDrop={handleFileUpload} accept="./Profile.pdf">
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} style={{ border: '2px dashed black', padding: '20px', cursor: 'pointer' }}>
            <input {...getInputProps()} />
            <p>Drag & drop your LinkedIn PDF here, or click to select the file</p>
          </div>
        )}
      </Dropzone>

      {pdfText && (
        <div>
          <h3>PDF Text Extracted:</h3>
          <p>{pdfText}</p>

          <button onClick={generateHtmlResume}>Generate HTML Resume</button>
        </div>
      )}

      {htmlResume && (
        <div>
          <h3>Generated HTML Resume:</h3>
          <div dangerouslySetInnerHTML={{ __html: htmlResume }}></div>
        </div>
      )}
    </div>
  );
}

export default App;
