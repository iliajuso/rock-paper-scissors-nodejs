const crypto = require("crypto");
const readline = require("readline");

const moves = ["Rock", "Paper", "Scissors"]; 

if (
  moves.length % 2 === 0 ||
  moves.length < 3 ||
  new Set(moves).size !== moves.length
) {
  console.log("Invalid input. Please provide an odd number of unique moves.");
  process.exit(1);
}

const key = crypto.randomBytes(32).toString("hex");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`HMAC key: ${key}`);

function generateHMAC(key, data) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(data);
  return hmac.digest("hex");
}

console.log("Available moves:");
moves.forEach((move, index) => {
  console.log(`${index + 1} - ${move}`);
});
console.log("0 - exit");
console.log("? - help");

const computerMove = moves[Math.floor(Math.random() * moves.length)];

const results = moves.map((_, i) => Array(moves.length));

for (let i = 0; i < moves.length; i++) {
  for (let j = 0; j < moves.length; j++) {
    if (i === j) {
      results[i][j] = "Draw";
    } else if ((i + 1) % moves.length === j) {
      results[i][j] = "Win";
    } else {
      results[i][j] = "Lose";
    }
  }
}

function displayWinningTable() {
  const moves = ["Rock", "Paper", "Scissors"];
  const results = [
    [() => "Draw", () => "Win", () => "Lose"],
    [() => "Lose", () => "Draw", () => "Win"],
    [() => "Win", () => "Lose", () => "Draw"],
  ];

  console.log("+---------------+------+-------+----------+");
  console.log("|  PC\\User >    | Rock | Paper | Scissors |");
  console.log("+---------------+------+-------+----------+");

  moves.forEach((row, i) => {
    const resultsRow = results[i].map((result) => {
      const resultString = result().toString();
      return " ".repeat(5 - resultString.length) + resultString;
    });

    console.log(`|  ${row.padEnd(12)} | ${resultsRow.join("|  ")}   |`);
    console.log("+---------------+------+-------+----------+");
  });

}

rl.question("Enter your move: ", (userInput) => {
  if (userInput === "?") {
    displayWinningTable();
  } else {
    const userMoveIndex = parseInt(userInput);

    if (userMoveIndex === 0) {
      console.log("Exiting the game.");
    } else if (userMoveIndex >= 1 && userMoveIndex <= moves.length) {
      const userMove = moves[userMoveIndex - 1];
      console.log(`Your move: ${userMove}`);
      console.log(`Computer move: ${computerMove}`);
      const middleIndex = Math.floor(moves.length / 2);
      const userWinningMoves = moves.slice(middleIndex + 1);
      if (userMove === computerMove) {
        console.log("It's a draw!");
      } else if (userWinningMoves.includes(userMove)) {
        console.log("You win!");
      } else {
        console.log("Computer wins!");
      }
      const hmac = generateHMAC(key, userMove);
      console.log(`HMAC: ${hmac}`);
    } else {
      console.log(
        "Invalid input. Please enter a valid move number or '0' to exit."
      );
    }
  }

  rl.close();
});
