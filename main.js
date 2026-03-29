/**
 * Modern Omok & Baduk Logic - Dual Mode
 */

class GameEngine {
  constructor() {
    this.mode = 'omok'; // 'omok' or 'baduk'
    this.gridSize = 19;
    this.board = [];
    this.currentPlayer = 1; // 1: Black, 2: White
    this.isGameOver = false;
    this.moves = [];
    this.showNumbers = false;
    
    // Baduk specific
    this.captures = { 1: 0, 2: 0 }; // Captured by Black, Captured by White
    this.koPosition = null;

    // DOM Elements
    this.boardElement = document.getElementById('game-board');
    this.statusElement = document.getElementById('turn-indicator');
    this.captureStatus = document.getElementById('capture-status');
    this.historyList = document.getElementById('history-list');
    this.gameDesc = document.getElementById('game-desc');
    
    // Controls
    this.modeSelect = document.getElementById('mode-select');
    this.sizeSelect = document.getElementById('size-select');
    this.restartBtn = document.getElementById('restart-btn');
    this.toggleNumbersBtn = document.getElementById('toggle-numbers-btn');
    this.openFormBtn = document.getElementById('open-form-btn');
    
    // Modal
    this.modal = document.getElementById('form-modal');
    this.closeBtn = document.querySelector('.close-btn');

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.reset();
  }

  setupEventListeners() {
    this.modeSelect.addEventListener('change', (e) => {
      this.mode = e.target.value;
      this.updateGameSettings();
      this.reset();
    });
    
    this.sizeSelect.addEventListener('change', (e) => {
      this.gridSize = parseInt(e.target.value);
      document.documentElement.style.setProperty('--grid-size', this.gridSize);
      this.reset();
    });

    this.restartBtn.addEventListener('click', () => this.reset());
    this.toggleNumbersBtn.addEventListener('click', () => this.toggleMoveNumbers());
    
    // Modal events
    this.openFormBtn.addEventListener('click', () => this.modal.style.display = 'block');
    this.closeBtn.addEventListener('click', () => this.modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === this.modal) this.modal.style.display = 'none'; });
  }

  updateGameSettings() {
    if (this.mode === 'baduk') {
      this.captureStatus.classList.remove('hidden');
      this.gameDesc.textContent = '돌을 둘러싸서 따내세요. 집이 더 많은 쪽이 승리합니다.';
    } else {
      this.captureStatus.classList.add('hidden');
      this.gameDesc.textContent = '다섯 개의 바둑알을 먼저 나란히 놓으면 승리합니다.';
    }
  }

  reset() {
    this.board = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
    this.currentPlayer = 1;
    this.isGameOver = false;
    this.moves = [];
    this.captures = { 1: 0, 2: 0 };
    this.koPosition = null;
    this.updateStatus();
    this.createBoardUI();
    this.historyList.innerHTML = '';
  }

  createBoardUI() {
    this.boardElement.innerHTML = '';
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => this.handleMove(r, c));
        this.boardElement.appendChild(cell);
      }
    }
  }

  handleMove(r, c) {
    if (this.isGameOver || this.board[r][c] !== 0) return;

    if (this.mode === 'omok') {
      this.executeOmokMove(r, c);
    } else {
      this.executeBadukMove(r, c);
    }
  }

  executeOmokMove(r, c) {
    this.board[r][c] = this.currentPlayer;
    const moveData = { r, c, player: this.currentPlayer, num: this.moves.length + 1 };
    this.moves.push(moveData);
    this.renderStone(moveData);
    this.updateHistoryUI(moveData);

    if (this.checkOmokWin(r, c)) {
      this.endGame(`${this.currentPlayer === 1 ? '흑' : '백'} 승리!`);
    } else {
      this.switchPlayer();
    }
  }

  executeBadukMove(r, c) {
    // Ko Rule Check
    if (this.koPosition && this.koPosition.r === r && this.koPosition.c === c) {
      alert('패(Ko) 상태입니다. 다른 곳에 먼저 두어야 합니다.');
      return;
    }

    // Temporary move to check validity
    this.board[r][c] = this.currentPlayer;
    const opponent = this.currentPlayer === 1 ? 2 : 1;
    let capturedStones = [];

    // Check if move captures opponent stones
    const neighbors = this.getNeighbors(r, c);
    neighbors.forEach(([nr, nc]) => {
      if (this.board[nr][nc] === opponent) {
        const group = this.getGroup(nr, nc);
        if (this.getLiberties(group) === 0) {
          capturedStones.push(...group);
        }
      }
    });

    // Check suicide rule
    const myGroup = this.getGroup(r, c);
    if (capturedStones.length === 0 && this.getLiberties(myGroup) === 0) {
      this.board[r][c] = 0; // Revert
      alert('착수 금지 지점(Suicide Move)입니다.');
      return;
    }

    // Execute capture
    capturedStones.forEach(([cr, cc]) => {
      this.board[cr][cc] = 0;
      this.removeStoneUI(cr, cc);
    });

    this.captures[this.currentPlayer] += capturedStones.length;
    this.updateCaptureUI();

    // Update Ko position
    if (capturedStones.length === 1 && myGroup.length === 1) {
      this.koPosition = { r: capturedStones[0][0], c: capturedStones[0][1] };
    } else {
      this.koPosition = null;
    }

    const moveData = { r, c, player: this.currentPlayer, num: this.moves.length + 1 };
    this.moves.push(moveData);
    this.renderStone(moveData);
    this.updateHistoryUI(moveData);
    this.switchPlayer();
  }

  renderStone(move) {
    const cell = this.boardElement.children[move.r * this.gridSize + move.c];
    const stone = document.createElement('div');
    stone.classList.add('stone', move.player === 1 ? 'black' : 'white', 'place-anim');
    stone.dataset.num = move.num;
    if (this.showNumbers) stone.textContent = move.num;
    cell.appendChild(stone);
  }

  removeStoneUI(r, c) {
    const cell = this.boardElement.children[r * this.gridSize + c];
    cell.innerHTML = '';
  }

  updateCaptureUI() {
    document.getElementById('black-captures').textContent = `따낸 백돌: ${this.captures[1]}`;
    document.getElementById('white-captures').textContent = `따낸 흑돌: ${this.captures[2]}`;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateStatus();
  }

  updateStatus() {
    const name = this.currentPlayer === 1 ? '흑(Black)' : '백(White)';
    this.statusElement.textContent = `${name}의 차례입니다`;
    this.statusElement.className = this.currentPlayer === 1 ? 'black-turn' : 'white-turn';
  }

  getNeighbors(r, c) {
    const res = [];
    if (r > 0) res.push([r - 1, c]);
    if (r < this.gridSize - 1) res.push([r + 1, c]);
    if (c > 0) res.push([r, c - 1]);
    if (c < this.gridSize - 1) res.push([r, c + 1]);
    return res;
  }

  getGroup(r, c) {
    const color = this.board[r][c];
    const group = [];
    const queue = [[r, c]];
    const visited = new Set([`${r},${c}`]);

    while (queue.length > 0) {
      const [currR, currC] = queue.shift();
      group.push([currR, currC]);

      this.getNeighbors(currR, currC).forEach(([nr, nc]) => {
        const key = `${nr},${nc}`;
        if (this.board[nr][nc] === color && !visited.has(key)) {
          visited.add(key);
          queue.push([nr, nc]);
        }
      });
    }
    return group;
  }

  getLiberties(group) {
    const liberties = new Set();
    group.forEach(([r, c]) => {
      this.getNeighbors(r, c).forEach(([nr, nc]) => {
        if (this.board[nr][nc] === 0) {
          liberties.add(`${nr},${nc}`);
        }
      });
    });
    return liberties.size;
  }

  checkOmokWin(r, c) {
    const directions = [[[0,1],[0,-1]], [[1,0],[-1,0]], [[1,1],[-1,-1]], [[1,-1],[-1,1]]];
    return directions.some(dir => {
      let count = 1;
      dir.forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize && this.board[nr][nc] === this.currentPlayer) {
          count++; nr += dr; nc += dc;
        }
      });
      return count >= 5;
    });
  }

  updateHistoryUI(move) {
    const item = document.createElement('div');
    item.classList.add('history-item');
    const color = move.player === 1 ? '흑' : '백';
    const col = String.fromCharCode(65 + move.c);
    const row = this.gridSize - move.r;
    item.innerHTML = `<span>#${move.num}</span><span>${color} (${col}, ${row})</span>`;
    this.historyList.appendChild(item);
    this.historyList.scrollTop = this.historyList.scrollHeight;
  }

  toggleMoveNumbers() {
    this.showNumbers = !this.showNumbers;
    this.toggleNumbersBtn.textContent = this.showNumbers ? '수순 숨기기' : '수순 표시';
    this.boardElement.querySelectorAll('.stone').forEach(s => s.textContent = this.showNumbers ? s.dataset.num : '');
  }

  endGame(msg) {
    this.isGameOver = true;
    this.statusElement.textContent = msg;
    this.statusElement.className = 'winner';
  }
}

// Tab Switching Logic
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
          content.classList.add('active');
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
  initTabs();
});
