const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const app = express();

// 정적 파일 제공
app.use(express.static('public'));
app.set('view engine', 'ejs');

// 메인 페이지
app.get('/', (req, res) => {
  res.render('index');
});

// md 파일 목록 조회
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir('./markdown');
    const mdFiles = files.filter(file => path.extname(file) === '.md');
    res.json(mdFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read directory' });
  }
});

// md 파일 내용 조회
app.get('/api/files/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join('./markdown', filename);
    console.log('Attempting to read file:', filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Mermaid를 처리하기 위한 renderer 설정
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
      if (language === 'mermaid') {
        return `<div class="mermaid">${code}</div>`;
      }
      return `<pre><code>${code}</code></pre>`;
    };

    const htmlContent = marked(content, { renderer });
    res.json({ content: htmlContent });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ 
      error: `Failed to read file: ${error.message}`,
      details: error.stack 
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});