/* eslint-disable no-continue */
/* eslint-disable no-cond-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
function Field() {
  this.mode = "wait";
  this.available = [];
  this.chosen = [];
  this.shoted = [];
  this.ships = new Array(4).fill(0);
}

function Cell(row, column) {
  this.row = row;
  this.column = column;
  this.busy = false;
  this.shot = false;
}

const playerCells = [];
for (let i = 0; i < 10; ++i) {
  playerCells.push(new Array(10));
  for (let j = 0; j < 10; ++j) playerCells[i][j] = new Cell(i, j);
}

const computerCells = [];
for (let i = 0; i < 10; ++i) {
  computerCells.push(new Array(10));
  for (let j = 0; j < 10; ++j) computerCells[i][j] = new Cell(i, j);
}

const playerHandler = document.querySelector(".player");
for (let i = 0; i < 10; ++i) {
  for (let j = 0; j < 10; ++j) {
    const cell = document.createElement("div");
    cell.classList.add("player__cell");
    cell.dataset.row = i;
    cell.dataset.column = j;
    playerHandler.append(cell);
  }
}

const computerHandler = document.querySelector(".computer");
for (let i = 0; i < 10; ++i) {
  for (let j = 0; j < 10; ++j) {
    const cell = document.createElement("div");
    cell.classList.add("computer__cell");
    cell.dataset.row = i;
    cell.dataset.column = j;
    computerHandler.append(cell);
  }
}

const NumberOfShips = [4, 3, 2, 1];

const playerField = new Field();
const computerField = new Field();

const playerGrid = document.querySelectorAll(".player__cell");
const computerGrid = document.querySelectorAll(".computer__cell");
const playerStat = document.querySelector(".informationAboutPlayer");
const computerStat = document.querySelector(".informationAboutComputer");

const setShipButton = document.querySelector(".menu__setShip");
const delShipButton = document.querySelector(".menu__delShip");
const newGameButton = document.querySelector(".menu__newGame");
const autoAlignmentPlayer = document.querySelector(".menu__autoAlignment");
const startBattleButton = document.querySelector(".menu__startBattle");

autoAlignmentPlayer.addEventListener("click", () => {
  playerGrid[autoAlignment(playerField, playerCells, playerGrid)].dispatchEvent(
    new Event("click", { bubbles: true }),
  );
  while (!arrayCompare(playerField.ships, NumberOfShips)) {
    autoAlignmentPlayer.dispatchEvent(new Event("click"));
  }
  startBattleButton.hidden = false;
});

newGameButton.addEventListener("click", () => {
  window.location.reload();
});

startBattleButton.addEventListener("click", () => {
  autoAlignmentOfComputer(computerField, computerCells, computerGrid);
  playerField.mode = "battle";
  computerField.mode = "battle";
  countShips();
});

setShipButton.addEventListener("click", () => {
  setShip(playerField, playerGrid);
  if (arrayCompare(playerField.ships, NumberOfShips)) {
    startBattleButton.hidden = false;
  }
});

delShipButton.addEventListener("click", () => {
  delShip(playerField, playerGrid);
});

computerHandler.addEventListener("click", (event) => {
  if (!event.target.classList.contains("computer__cell")) return;

  if (computerField.mode === "battle") {
    const row = +event.target.dataset.row;
    const column = +event.target.dataset.column;

    if (computerCells[row][column].shot) return;

    const resultOfShot = shot(
      row,
      column,
      computerField,
      computerCells,
      computerGrid,
    );
    if (resultOfShot !== "miss") return;
    turnOfComputer(playerField, playerCells, playerGrid);

    return;
  }

  if (arrayCompare(computerField.ships, NumberOfShips)) return;
  const row = +event.target.dataset.row;
  const column = +event.target.dataset.column;
  if (!checkAvailability(row, column, computerField, computerCells)) return;

  const { target } = event;
  target.style.backgroundColor = "red";
  computerField.chosen.push(computerCells[row][column]);
  setAvailableCell(row, column, computerField, computerGrid, computerCells);
  computerField.mode = "arrangement";
});

playerHandler.addEventListener("click", (event) => {
  if (playerField.mode === "battle") {
    const row = +event.target.dataset.row;
    const column = +event.target.dataset.column;
    shot(row, column, playerField, playerCells, playerGrid);
    return;
  }
  if (!event.target.classList.contains("player__cell")) return;
  if (arrayCompare(playerField.ships, NumberOfShips)) return;
  const row = +event.target.dataset.row;
  const column = +event.target.dataset.column;
  if (!checkAvailability(row, column, playerField, playerCells)) return;

  const { target } = event;
  target.style.backgroundColor = "red";
  playerField.chosen.push(playerCells[row][column]);
  setAvailableCell(row, column, playerField, playerGrid, playerCells);
  playerField.mode = "arrangement";
});

const areThereMoreThanSingleDeck = (field) => (
  field.chosen.length === 1
    && field.ships[3] > 0
    && field.ships[2] > 1
    && field.ships[1] > 2
);

const areThereMoreThanDoubleDeck = function (field) {
  return field.chosen.length === 2 && field.ships[3] > 0 && field.ships[2] > 1;
};
const areThereMoreThanTripleDeck = function (field) {
  return field.chosen.length === 3 && field.ships[3] > 0;
};

function setAvailableCell(row, column, field, grid, cells) {
  removeAvailableCells(field, grid);
  if (field.chosen.length > 3) return;
  if (areThereMoreThanTripleDeck(field)) return;
  if (areThereMoreThanDoubleDeck(field)) return;
  if (areThereMoreThanSingleDeck(field)) return;
  if (field.mode === "wait") {
    column--;
    let neighbours = [
      [1, 0],
      [1, 0],
      [-1, -1],
    ];
    if (column >= 0 && checkNeighbour(row, column, cells, neighbours)) {
      field.available.push(cells[row][column]);
      grid[row * 10 + column].style.backgroundColor = "green";
    }
    column += 2;
    neighbours = [
      [1, 0],
      [1, 0],
      [-1, 1],
    ];
    if (
      column < cells.length
      && checkNeighbour(row, column, cells, neighbours)
    ) {
      field.available.push(cells[row][column]);
      grid[row * 10 + column].style.backgroundColor = "green";
    }
    column--;
    row--;
    neighbours = [
      [0, 1],
      [0, 1],
      [-1, -1],
    ];
    if (row >= 0 && checkNeighbour(row, column, cells, neighbours)) {
      field.available.push(cells[row][column]);
      grid[row * 10 + column].style.backgroundColor = "green";
    }
    row += 2;
    neighbours = [
      [0, 1],
      [0, 1],
      [1, -1],
    ];
    if (row < cells.length && checkNeighbour(row, column, cells, neighbours)) {
      field.available.push(cells[row][column]);
      grid[row * 10 + column].style.backgroundColor = "green";
    }
  } else if (field.mode === "arrangement") {
    if (field.chosen[0].row === row) {
      const columns = field.chosen.map((item) => item.column);
      column = Math.min(...columns) - 1;
      let neighbours = [
        [1, 0],
        [1, 0],
        [-1, -1],
      ];
      if (column >= 0 && checkNeighbour(row, column, cells, neighbours)) {
        field.available.push(cells[row][column]);
        grid[row * 10 + column].style.backgroundColor = "green";
      }
      column = Math.max(...columns) + 1;
      neighbours = [
        [1, 0],
        [1, 0],
        [-1, 1],
      ];
      if (
        column < cells.length
        && checkNeighbour(row, column, cells, neighbours)
      ) {
        field.available.push(cells[row][column]);
        grid[row * 10 + column].style.backgroundColor = "green";
      }
    } else if (field.chosen[0].column === column) {
      const rows = field.chosen.map((item) => item.row);
      row = Math.min(...rows) - 1;
      let neighbours = [
        [0, 1],
        [0, 1],
        [-1, -1],
      ];
      if (row >= 0 && checkNeighbour(row, column, cells, neighbours)) {
        field.available.push(cells[row][column]);
        grid[row * 10 + column].style.backgroundColor = "green";
      }
      row = Math.max(...rows) + 1;
      neighbours = [
        [0, 1],
        [0, 1],
        [1, -1],
      ];
      if (
        row < cells.length
        && checkNeighbour(row, column, cells, neighbours)
      ) {
        field.available.push(cells[row][column]);
        grid[row * 10 + column].style.backgroundColor = "green";
      }
    }
  }
}

function checkAvailability(row, column, field, cells) {
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
  if (field.mode === "wait") {
    if (cells[row][column].busy) return false;

    if (checkNeighbour(row, column, cells, neighbours)) return true;

    return false;
  }
  if (field.mode === "arrangement") {
    if (field.available.includes(cells[row][column])) return true;
    return false;
  }
  return false;
}

function checkNeighbour(row, column, cells, neighbours) {
  let change;
  while ((change = neighbours.pop())) {
    row += change[0];
    column += change[1];
    if (row < 0 || column < 0 || row >= cells.length || column >= cells.length) {
      continue;
    }
    if (cells[row][column].busy) return false;
  }
  return true;
}

function removeAvailableCells(field, grid) {
  let availableCell;
  while ((availableCell = field.available.pop())) {
    if (
      grid[availableCell.row * 10 + availableCell.column].style
        .backgroundColor === "green"
    ) {
      grid[
        availableCell.row * 10 + availableCell.column
      ].style.backgroundColor = "white";
    }
  }
}

function arrayCompare(a, b) {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;

  return true;
}

function autoAlignmentOfComputer(field, cells, grid) {
  grid[autoAlignment(field, cells, grid)].dispatchEvent(
    new Event("click", { bubbles: true }),
  );

  while (!arrayCompare(field.ships, NumberOfShips)) {
    autoAlignmentOfComputer(field, cells, grid);
  }
}

function autoAlignment(field, cells, grid) {
  let row;
  let column;
  let choiceFromAvailable;
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
  if (!field.available.length) {
    if (field.chosen.length) setShip(field, grid);
    do {
      row = Math.floor(Math.random() * cells.length);
      column = Math.floor(Math.random() * cells.length);
    } while (
      cells[row][column].busy
      || !checkNeighbour(row, column, cells, neighbours)
    );
  } else {
    choiceFromAvailable = Math.floor(Math.random() * field.available.length);
    row = field.available[choiceFromAvailable].row;
    column = field.available[choiceFromAvailable].column;
  }
  return row * 10 + column;
}

function setShip(field, grid) {
  if (!field.chosen.length) return;
  if (
    field.ships[field.chosen.length - 1]
    >= NumberOfShips[field.chosen.length - 1]
  ) {
    delShipButton.dispatchEvent(new Event("click"));
    return;
  }
  let chosen;
  field.ships[field.chosen.length - 1]++;
  while ((chosen = field.chosen.pop())) {
    chosen.busy = true;
    grid[chosen.row * 10 + chosen.column].style.backgroundColor = "black";
    if (
      grid[chosen.row * 10 + chosen.column].classList.contains("computer__cell")
    ) grid[chosen.row * 10 + chosen.column].style.backgroundColor = "white";
    removeAvailableCells(field, grid);
    field.mode = "wait";
  }
}

function delShip(field, grid) {
  if (!field.chosen.length) return;
  let chosen;
  while ((chosen = field.chosen.pop())) {
    grid[chosen.row * 10 + chosen.column].style.backgroundColor = "white";
    removeAvailableCells(field, grid);
    field.mode = "wait";
  }
}

function shot(row, column, field, cells, grid) {
  if (cells[row][column].shot) return null;

  cells[row][column].shot = true;

  if (cells[row][column].busy) {
    grid[row * 10 + column].classList.add("explosion");
    const shipCondition = checkShip(row, column, field, cells);
    if (!shipCondition.isAlive) {
      countShips();
      if (shipCondition.stern !== shipCondition.bow) {
        shotNeighborhood(
          shipCondition.stern.row,
          shipCondition.stern.column,
          field,
          cells,
          grid,
        );
        shotNeighborhood(
          shipCondition.bow.row,
          shipCondition.bow.column,
          field,
          cells,
          grid,
        );
        return "killed";
      }
      shotNeighborhood(row, column, field, cells, grid);
      return "killed";
    }
    return "injured";
  }
  const point = document.createElement("div");
  point.classList.add("point");
  grid[row * 10 + column].append(point);
  return "miss";
}

function checkShip(row, column, field, cells) {
  let count = 0;
  let minColumn = column;
  let maxColumn = column;
  while (--minColumn >= 0 && cells[row][minColumn].busy) {
    count++;
    if (!cells[row][minColumn].shot) return { isAlive: true };
  }
  while (++maxColumn < cells.length && cells[row][maxColumn].busy) {
    count++;
    if (!cells[row][maxColumn].shot) return { isAlive: true };
  }
  if (count > 0) {
    field.ships[count]--;
    return {
      isAlive: false,
      bow: cells[row][++minColumn],
      stern: cells[row][--maxColumn],
    };
  }

  let maxRow = row;
  let minRow = row;
  while (--minRow >= 0 && cells[minRow][column].busy) {
    count++;
    if (!cells[minRow][column].shot) return { isAlive: true };
  }
  while (++maxRow < cells.length && cells[maxRow][column].busy) {
    count++;
    if (!cells[maxRow][column].shot) return { isAlive: true };
  }
  field.ships[count]--;
  return {
    isAlive: false,
    bow: cells[++minRow][column],
    stern: cells[--maxRow][column],
  };
}

function shotNeighborhood(row, column, field, cells, grid) {
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
  let change;
  while ((change = neighbours.pop())) {
    row += change[0];
    column += change[1];
    if (row < 0 || row >= cells.length || column < 0 || column >= cells.length) {
      continue;
    }
    shot(row, column, field, cells, grid);
  }
}

function turnOfComputer(field, cells, grid) {
  let row;
  let column;
  do {
    if (field.available.length) {
      const numOfAvailable = Math.floor(Math.random() * field.available.length);
      row = field.available[numOfAvailable].row;
      column = field.available[numOfAvailable].column;
    } else {
      row = Math.floor(Math.random() * cells.length);
      column = Math.floor(Math.random() * cells.length);
    }
  } while (cells[row][column].shot);
  const resultOfShot = shot(row, column, field, cells, grid);
  if (resultOfShot === "killed") {
    field.shoted = [];
    field.available = [];
  }
  if (!(resultOfShot === "injured")) return;
  chooseNextCell(row, column, field, cells, grid);
  if (resultOfShot !== "miss") {
    setTimeout(() => {
      turnOfComputer(field, cells, grid);
    }, 500);
  }
}

function chooseNextCell(row, column, field, cells) {
  if (field.shoted.length === 0) {
    field.shoted.push(cells[row][column]);
    if (--row >= 0) field.available.push(cells[row][column]);
    ++row;
    if (--column >= 0) field.available.push(cells[row][column]);
    ++column;
    if (++row < cells.length) field.available.push(cells[row][column]);
    --row;
    if (++column < cells.length) field.available.push(cells[row][column]);
    --column;
  } else {
    field.available = [];
    if (field.shoted[0].row === row) {
      if (field.shoted[0].column > column) {
        field.shoted.unshift(cells[row][column]);
      } else field.shoted.push(cells[row][column]);
      if (field.shoted[0].column - 1 >= 0) {
        field.available.push(cells[row][field.shoted[0].column - 1]);
      }
      if (field.shoted[field.shoted.length - 1].column + 1 < cells.length) {
        field.available.push(
          cells[row][field.shoted[field.shoted.length - 1].column + 1],
        );
      }
    } else {
      if (field.shoted[0].row > row) field.shoted.unshift(cells[row][column]);
      else field.shoted.push(cells[row][column]);
      if (field.shoted[0].row - 1 >= 0) {
        field.available.push(cells[field.shoted[0].row - 1][column]);
      }
      if (field.shoted[field.shoted.length - 1].row + 1 < cells.length) {
        field.available.push(
          cells[field.shoted[field.shoted.length - 1].row + 1][column],
        );
      }
    }
  }
}

function countShips() {
  let countOfPlayerShip = 0;
  let countOfComputerShip = 0;
  for (let i = 0; i < playerField.ships.length; ++i) {
    countOfPlayerShip += playerField.ships[i];
  }
  for (let i = 0; i < computerField.ships.length; ++i) {
    countOfComputerShip += computerField.ships[i];
  }
  playerStat.innerHTML = `У вас осталось ${countOfPlayerShip} кораблей:
    ${playerField.ships[3]} 4палубных
    ${playerField.ships[2]} 3палубных
    ${playerField.ships[1]} 2палубных
    ${playerField.ships[0]} 1палубных`;

  computerStat.innerHTML = `У противника осталось ${countOfComputerShip} кораблей:
    ${computerField.ships[3]} 4палубных
    ${computerField.ships[2]} 3палубных
    ${computerField.ships[1]} 2палубных
    ${computerField.ships[0]} 1палубных`;

  if (countOfPlayerShip === 0) {
    alert("победа компьютера");
    window.location.reload();
  }
  if (countOfComputerShip === 0) {
    alert("Вы выиграли!");
    window.location.reload();
  }
}
