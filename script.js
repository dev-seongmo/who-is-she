const beforeFileInput = document.getElementById('beforeFile');
const afterFileInput = document.getElementById('afterFile');
const beforeFileName = document.getElementById('beforeFileName');
const afterFileName = document.getElementById('afterFileName');
const compareBtn = document.getElementById('compareBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');
const resultList = document.getElementById('resultList');
const resultCount = document.getElementById('resultCount');

function updateFileName(input, node) {
  const file = input.files?.[0];
  node.textContent = file ? file.name : '선택된 파일 없음';
}

function setStatus(message, type = '') {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`.trim();
}

function parseUsernames(text) {
  const lines = text.split(/\r?\n/);
  const cleaned = lines
    .map((line) => line.trim().replace(/^@/, '').toLowerCase())
    .filter((line) => line.length > 0);

  return new Set(cleaned);
}

function renderResults(items) {
  resultList.innerHTML = '';

  if (items.length === 0) {
    const li = document.createElement('li');
    li.textContent = '새로 추가된 계정을 찾지 못했습니다.';
    li.className = 'empty';
    resultList.appendChild(li);
    resultCount.textContent = '0개 추가됨';
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `@${item}`;
    resultList.appendChild(li);
  });

  resultCount.textContent = `${items.length}개 추가됨`;
}

async function readFileText(file) {
  return file.text();
}

async function compareSnapshots() {
  const beforeFile = beforeFileInput.files?.[0];
  const afterFile = afterFileInput.files?.[0];

  if (!beforeFile || !afterFile) {
    setStatus('Before/After 파일을 모두 업로드해 주세요.', 'error');
    return;
  }

  try {
    setStatus('파일을 분석하는 중입니다...');

    const [beforeText, afterText] = await Promise.all([
      readFileText(beforeFile),
      readFileText(afterFile),
    ]);

    const beforeSet = parseUsernames(beforeText);
    const afterSet = parseUsernames(afterText);

    const added = [...afterSet].filter((username) => !beforeSet.has(username)).sort();

    renderResults(added);
    setStatus(`분석 완료: 새로 추가된 계정 ${added.length}개`, 'success');
  } catch (error) {
    setStatus('파일을 읽는 중 오류가 발생했습니다. 텍스트 파일인지 확인해 주세요.', 'error');
    console.error(error);
  }
}

function resetAll() {
  beforeFileInput.value = '';
  afterFileInput.value = '';
  beforeFileName.textContent = '선택된 파일 없음';
  afterFileName.textContent = '선택된 파일 없음';
  resultList.innerHTML = '';
  resultCount.textContent = '0개 추가됨';
  setStatus('초기화되었습니다. 새 파일을 업로드해 주세요.');
}

beforeFileInput.addEventListener('change', () => updateFileName(beforeFileInput, beforeFileName));
afterFileInput.addEventListener('change', () => updateFileName(afterFileInput, afterFileName));
compareBtn.addEventListener('click', compareSnapshots);
resetBtn.addEventListener('click', resetAll);

renderResults([]);
