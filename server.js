const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir('./markdown');
    const mdFiles = files.filter(file => path.extname(file) === '.md');
    res.json(mdFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read directory' });
  }
});

app.get('/api/files/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join('./markdown', filename);
    const content = await fs.readFile(filePath, 'utf-8');

    // Markdown 렌더링 및 Mermaid 코드 처리
    const renderedHTML = md.render(content).replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      (match, mermaidCode) => `<div class="mermaid">${mermaidCode.trim()}</div>`
    );

    res.json({ content: renderedHTML });
  } catch (error) {
    res.status(500).json({ 
      error: `Failed to read file: ${error.message}`,
      details: error.stack 
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});