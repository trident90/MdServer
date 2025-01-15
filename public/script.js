// public/script.js
async function loadFiles() {
  const response = await fetch('/api/files');
  const files = await response.json();
  
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = ''; // 기존 목록 초기화

  files.forEach(file => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = file;
    link.onclick = () => loadContent(file);
    li.appendChild(link);
    fileList.appendChild(li);
  });
}

async function loadContent(filename) {
  const response = await fetch(`/api/files/${encodeURIComponent(filename)}`);
  const data = await response.json();
  
  const contentDiv = document.getElementById('markdownContent');
  if (data.error) {
    contentDiv.innerHTML = `<div class="error">${data.error}</div>`;
  } else {
    contentDiv.innerHTML = data.content;

    // Mermaid 초기화
    mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  }
}

window.onload = loadFiles;