function CellsPosition(row, column) {
  this.row = row;
  this.column = column;
}

function Field() {
  this.mode = "wait";
  this.available = [];
  this.chosen = [];
  this.ships = new Array(4).fill(0);
}

function Cell(row, column) {
  this.row = row;
  this.column = column;
  this.busy = false;
  this.shot = false;
  this.available = false;
}

const playerCell = [];
for (let i = 0; i < 10; ++i) {
  playerCell.push(new Array(10));
  for (let j = 0; j < 10; ++j) playerCell[i][j] = new Cell(i, j);
}

const computerCell = [];
for (let i = 0; i < 10; ++i) {
  computerCell.push(new Array(10));
  for (let j = 0; j < 10; ++j) computerCell[i][j] = new Cell(i, j);
}

const playerHandler = document.querySelector(".player");

for (let i = 0; i < 10; ++i) {
  for (let j = 0; j < 10; ++j) {
    let cell = document.createElement("div");
    cell.classList.add("player__cell");
    cell.dataset.row = i;
    cell.dataset.column = j;
    playerHandler.append(cell);
  }
}

const computerHandler = document.querySelector(".computer");
for (let i = 0; i < 10; ++i) {
  for (let j = 0; j < 10; ++j) {
    let cell = document.createElement("div");
    cell.classList.add("computer__cell");
    cell.dataset.row = i;
    cell.dataset.column = j;
    computerHandler.append(cell);
  }
}

const playerField = new Field();

const playerGrid = document.querySelectorAll(".player__cell");
const computerGrid = document.querySelectorAll(".computer__cell");

const setShipButton = document.querySelector(".menu__setShip");
const delShipButton = document.querySelector(".menu__delShip");
const newGameButton = document.querySelector(".menu__newGame");
const autoAlignment = document.querySelector(".menu__autoAlignment");

autoAlignment.addEventListener("click", () => {
  let row = Math.floor(Math.random() * computerCell.length);
  let column = Math.floor(Math.random() * computerCell.length);
});

newGameButton.addEventListener("click", () => {
  location.reload();
});

setShipButton.addEventListener("click", () => {
  if (!playerField.chosen.length) return;
  if (
    playerField.ships[playerField.chosen.length - 1] >=
    [4, 3, 2, 1][playerField.chosen.length - 1]
  )
    return;
  let chosen;
  playerField.ships[playerField.chosen.length - 1]++;
  while ((chosen = playerField.chosen.pop())) {
    chosen.busy = true;
    playerGrid[chosen.row * 10 + chosen.column].style.backgroundColor = "black";
    removeAvailableCells(playerField);
    playerField.mode = "wait";
  }
});

delShipButton.addEventListener("click", () => {
  if (!playerField.chosen.length) return;
  let chosen;
  while ((chosen = playerField.chosen.pop())) {
    playerGrid[chosen.row * 10 + chosen.column].style.backgroundColor = "white";
    removeAvailableCells(playerField);
    playerField.mode = "wait";
  }
});

playerHandler.addEventListener("click", (event) => {
  if (!event.target.classList.contains("player__cell")) return;
  if (array_compare(playerField.ships, [4, 3, 2, 1])) return;
  let row = +event.target.dataset.row;
  let column = +event.target.dataset.column;
  if (!checkAvailability(row, column, playerField)) return;

  event.target.style.backgroundColor = "red";
  playerField.chosen.push(playerCell[row][column]);
  setAvailableCell(row, column, playerField);
  playerField.mode = "arrangement";
});

function setAvailableCell(row, column, field) {
  removeAvailableCells(field);
  if (field.chosen.length > 3) return;
  else if (field.chosen.length === 3 && field.ships[3] > 0) return;
  else if (
    field.chosen.length === 2 &&
    field.ships[3] > 0 &&
    field.ships[2] > 1
  )
    return;
  else if (
    field.chosen.length === 1 &&
    field.ships[3] > 0 &&
    field.ships[2] > 1 &&
    field.ships[1] > 2
  )
    return;
  if (field.mode === "wait") {
    column--;
    let neighbours = [
      [1, 0],
      [1, 0],
      [-1, -1],
    ];
    if (column >= 0 && checkNeighbour(row, column, neighbours)) {
      field.available.push(playerCell[row][column]);
      playerGrid[row * 10 + column].style.backgroundColor = "green";
    }
    column += 2;
    neighbours = [
      [1, 0],
      [1, 0],
      [-1, 1],
    ];
    if (column < playerCell.length && checkNeighbour(row, column, neighbours)) {
      field.available.push(playerCell[row][column]);
      playerGrid[row * 10 + column].style.backgroundColor = "green";
    }
    column--;
    row--;
    neighbours = [
      [0, 1],
      [0, 1],
      [-1, -1],
    ];
    if (row >= 0 && checkNeighbour(row, column, neighbours)) {
      field.available.push(playerCell[row][column]);
      playerGrid[row * 10 + column].style.backgroundColor = "green";
    }
    row += 2;
    neighbours = [
      [0, 1],
      [0, 1],
      [1, -1],
    ];
    if (row < playerCell.length && checkNeighbour(row, column, neighbours)) {
      field.available.push(playerCell[row][column]);
      playerGrid[row * 10 + column].style.backgroundColor = "green";
    }
  } else if (field.mode === "arrangement") {
    if (field.chosen[0].row === row) {
      let columns = field.chosen.map((item) => item.column);
      let column = Math.min(...columns) - 1;
      let neighbours = [
        [1, 0],
        [1, 0],
        [-1, -1],
      ];
      if (column >= 0 && checkNeighbour(row, column, neighbours)) {
        field.available.push(playerCell[row][column]);
        playerGrid[row * 10 + column].style.backgroundColor = "green";
      }
      column = Math.max(...columns) + 1;
      neighbours = [
        [1, 0],
        [1, 0],
        [-1, 1],
      ];
      if (
        column < playerCell.length &&
        checkNeighbour(row, column, neighbours)
      ) {
        field.available.push(playerCell[row][column]);
        playerGrid[row * 10 + column].style.backgroundColor = "green";
      }
    } else if (field.chosen[0].column === column) {
      let rows = field.chosen.map((item) => item.row);
      let row = Math.min(...rows) - 1;
      let neighbours = [
        [0, 1],
        [0, 1],
        [-1, -1],
      ];
      if (row >= 0 && checkNeighbour(row, column, neighbours)) {
        field.available.push(playerCell[row][column]);
        playerGrid[row * 10 + column].style.backgroundColor = "green";
      }
      row = Math.max(...rows) + 1;
      neighbours = [
        [0, 1],
        [0, 1],
        [1, -1],
      ];
      if (row < playerCell.length && checkNeighbour(row, column, neighbours)) {
        field.available.push(playerCell[row][column]);
        playerGrid[row * 10 + column].style.backgroundColor = "green";
      }
    }
  }
}

function checkAvailability(row, column, field) {
  if (field.mode === "wait") {
    if (playerCell[row][column].busy) return false;
    const neighbours = [
      [0, -1],
      [0, -1],
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];
    if (checkNeighbour(row, column, neighbours)) return true;

    return false;
  }
  if (field.mode === "arrangement") {
    if (field.available.includes(playerCell[row][column])) return true;
    return false;
  }
  if (field.mode === "battle") return false;
}

function checkNeighbour(row, column, neighbours) {
  let change;
  while ((change = neighbours.pop())) {
    row += change[0];
    column += change[1];
    if (
      row < 0 ||
      column < 0 ||
      row >= playerCell.length ||
      column >= playerCell.length
    )
      continue;
    if (playerCell[row][column].busy) return false;
  }
  return true;
}

function removeAvailableCells(field) {
  let availableCell;
  while ((availableCell = field.available.pop())) {
    if (
      playerGrid[availableCell.row * 10 + availableCell.column].style
        .backgroundColor === "green"
    )
      playerGrid[
        availableCell.row * 10 + availableCell.column
      ].style.backgroundColor = "white";
  }
}

function array_compare(a, b) {
  if (a.length != b.length) return false;

  for (i = 0; i < a.length; i++) if (a[i] != b[i]) return false;

  return true;
}

for (let cell of playerGrid) {
  console.log(cell.dataset.row);
}
