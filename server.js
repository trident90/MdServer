const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${str}</div>`;  // Mermaid를 먼저 처리
    }
    if (lang === 'yaml' || lang === 'yml') {
      return `<pre><code class="hljs language-yaml">${hljs.highlight(str, { language: 'yaml' }).value}</code></pre>`;
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs">${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (__) {}
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
  }
});
//const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir('./markdown');
    const validFiles = files.filter(file => ['.md', '.yaml', '.yml'].includes(path.extname(file)));
    res.json(validFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read directory' });
  }
});

app.get('/api/files/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join('./markdown', filename);
    const content = await fs.readFile(filePath, 'utf-8');

    let renderedHTML;
    if (filename.endsWith('.md')) {
      // 🔹 Markdown 파일 렌더링
      renderedHTML = md.render(content);
    } else if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
      // 🔹 YAML 파일은 코드 블록으로 감싸서 표시
      renderedHTML = `<pre><code class="hljs language-yaml">${hljs.highlight(content, { language: 'yaml' }).value}</code></pre>`;
    } else {
      throw new Error("Unsupported file format");
    }

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