let gameFileHandle = null;
let board = Array(9).fill("");
let playerTurnCount = 0;
let gameOver = false;

async function openGameFile() {
  [gameFileHandle] = await window.showOpenFilePicker({
    types: [{
      description: "JSON Game State",
      accept: { "application/json": [".json"] }
    }]
  });
}

async function loadGameState() {
  if (!gameFileHandle) return;

  const file = await gameFileHandle.getFile();
  const text = await file.text();
  const state = JSON.parse(text);

  board = state.board;
  playerTurnCount = state.playerTurnCount;
  gameOver = state.gameOver;

  for (let i = 0; i < 9; i++) {
    const id = indexToId(i);
    const btn = document.getElementById(id);
    btn.value = board[i];
    btn.disabled = board[i] !== "";
    btn.style.color = "black";
  }

  const result = checkWinner(board);
  if (result.winner) {
    highlightWin(result.line);
    gameOver = true;
  }
}

async function saveGameState() {
  if (!gameFileHandle) return;

  const state = { board, playerTurnCount, gameOver };
  const writable = await gameFileHandle.createWritable();
  await writable.write(JSON.stringify(state, null, 2));
  await writable.close();
}

function idToIndex(id) {
  return {
    one: 0, two: 1, three: 2,
    four: 3, five: 4, six: 5,
    seven: 6, eight: 7, nine: 8
  }[id];
}

function indexToId(index) {
  return [
    "one", "two", "three",
    "four", "five", "six",
    "seven", "eight", "nine"
  ][index];
}

function checkWinner(b) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (let line of wins) {
    const [a, b1, c] = line;
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { winner: b[a], line };
    }
  }
  return { winner: null, line: null };
}

function highlightWin(line) {
  line.forEach(i => {
    const id = indexToId(i);
    document.getElementById(id).style.color = "red";
  });
}

async function toggleBtn() {
  const btn = document.getElementById("btn");

  if (btn.value === "Clear") {
    board.fill("");
    playerTurnCount = 0;
    gameOver = false;
    btn.value = "Start";

    for (let i = 0; i < 9; i++) {
      const id = indexToId(i);
      const el = document.getElementById(id);
      el.value = "";
      el.disabled = false;
      el.style.color = "black";
    }

    await saveGameState();
  } else {
    if (board.every(cell => cell === "")) {
      btn.value = "Clear";
      await saveGameState();
    }
  }
}

async function makeMove(id) {
  if (gameOver) return;

  const idx = idToIndex(id);
  if (board[idx] !== "") return;

  const toggle = document.getElementById("btn");
  if (toggle.value === "Start") toggle.value = "Clear";

  board[idx] = playerTurnCount % 2 === 0 ? "O" : "X";

  const btn = document.getElementById(id);
  btn.value = board[idx];
  btn.disabled = true;

  const result = checkWinner(board);
  if (result.winner) {
    highlightWin(result.line);
    gameOver = true;
  }

  playerTurnCount++;
  await saveGameState();
}
