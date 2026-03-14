/**
 * Omok (Gomoku) Game Logic - Pro Edition
 */

class OmokGame {
  constructor(gridSize = 15) {
    this.gridSize = gridSize;
    this.board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    this.currentPlayer = 1; // 1: Black, 2: White
    this.isGameOver = false;
    this.moves = []; // History of moves: [{r, c, player}]
    this.showNumbers = false;

    this.boardElement = document.getElementById('game-board');
    this.statusElement = document.getElementById('turn-indicator');
    this.historyListElement = document.getElementById('history-list');
    
    // Buttons
    this.restartBtn = document.getElementById('restart-btn');
    this.toggleNumbersBtn = document.getElementById('toggle-numbers-btn');
    this.openFormBtn = document.getElementById('open-form-btn');
    
    // Modal
    this.modal = document.getElementById('form-modal');
    this.closeBtn = document.querySelector('.close-btn');

    this.init();
  }

  init() {
    this.createBoard();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.restartBtn.addEventListener('click', () => this.reset());
    this.toggleNumbersBtn.addEventListener('click', () => this.toggleMoveNumbers());
    
    // Modal events
    this.openFormBtn.addEventListener('click', () => {
      this.modal.style.display = 'block';
    });
    this.closeBtn.addEventListener('click', () => {
      this.modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) this.modal.style.display = 'none';
    });
  }

  createBoard() {
    this.boardElement.innerHTML = '';
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => this.handleMove(r, c));
        this.boardElement.appendChild(cell);
      }
    }
  }

  handleMove(r, c) {
    if (this.isGameOver || this.board[r][c] !== 0) return;

    const moveData = { r, c, player: this.currentPlayer, num: this.moves.length + 1 };
    this.board[r][c] = this.currentPlayer;
    this.moves.push(moveData);
    
    this.renderStone(moveData);
    this.updateHistoryUI(moveData);

    if (this.checkWin(r, c)) {
      this.endGame(`${this.currentPlayer === 1 ? '흑(Black)' : '백(White)'} 승리!`);
    } else if (this.moves.length === this.gridSize * this.gridSize) {
      this.endGame('무승부입니다!');
    } else {
      this.switchPlayer();
    }
  }

  renderStone(move) {
    const cell = this.boardElement.children[move.r * this.gridSize + move.c];
    const stone = document.createElement('div');
    stone.classList.add('stone', move.player === 1 ? 'black' : 'white', 'place-anim');
    stone.dataset.num = move.num;
    
    if (this.showNumbers) {
      stone.textContent = move.num;
    }
    
    cell.appendChild(stone);
  }

  updateHistoryUI(move) {
    const item = document.createElement('div');
    item.classList.add('history-item');
    const colorName = move.player === 1 ? '흑' : '백';
    // Convert to 1-based coordinates for human readability (A-O, 1-15)
    const colName = String.fromCharCode(65 + move.c); // A, B, C...
    const rowName = this.gridSize - move.r;
    
    item.innerHTML = `
      <span>#${move.num}</span>
      <span>${colorName} (${colName}, ${rowName})</span>
    `;
    this.historyListElement.appendChild(item);
    this.historyListElement.scrollTop = this.historyListElement.scrollHeight;
  }

  toggleMoveNumbers() {
    this.showNumbers = !this.showNumbers;
    this.toggleNumbersBtn.textContent = this.showNumbers ? '수순 숨기기 (Hide Numbers)' : '수순 표시 (Show Numbers)';
    
    const stones = this.boardElement.querySelectorAll('.stone');
    stones.forEach(stone => {
      stone.textContent = this.showNumbers ? stone.dataset.num : '';
    });
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.statusElement.textContent = `${this.currentPlayer === 1 ? '흑(Black)' : '백(White)'}의 차례입니다`;
    this.statusElement.className = this.currentPlayer === 1 ? 'black-turn' : 'white-turn';
  }

  checkWin(r, c) {
    const directions = [
      [[0, 1], [0, -1]], // Horizontal
      [[1, 0], [-1, 0]], // Vertical
      [[1, 1], [-1, -1]], // Diagonal \
      [[1, -1], [-1, 1]]  // Diagonal /
    ];

    return directions.some(dir => {
      let count = 1;
      dir.forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (
          nr >= 0 && nr < this.gridSize &&
          nc >= 0 && nc < this.gridSize &&
          this.board[nr][nc] === this.currentPlayer
        ) {
          count++;
          nr += dr;
          nc += dc;
        }
      });
      return count >= 5;
    });
  }

  endGame(message) {
    this.isGameOver = true;
    this.statusElement.textContent = message;
    this.statusElement.className = 'winner';
  }

  reset() {
    this.board = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
    this.currentPlayer = 1;
    this.isGameOver = false;
    this.moves = [];
    this.statusElement.textContent = '흑(Black)의 차례입니다';
    this.statusElement.className = 'black-turn';
    this.historyListElement.innerHTML = '';
    this.createBoard();
  }
}

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
  new OmokGame();
});
