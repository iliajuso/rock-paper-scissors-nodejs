const readline = require("readline-sync");
const crypto = require("crypto-js");

function generateKey() {
  const randomNumber = Math.random().toString();
  return crypto.SHA256(randomNumber).toString();
}

function generateHMAC(move, key) {
  return crypto.HmacSHA256(move, key).toString();
}

function generateRulesTable(moves) {
  const rules = [];
  for (let i = 0; i < moves.length; i++) {
    rules.push(generateRule(moves, i));
  }

  const table = [];
  for (let i = 0; i < rules.length + 1; i++) {
    table[i] = [];
  }
  table[0][0] = "v PC\User >";
  for (let i = 0; i < rules.length; i++) {
    table[0][i + 1] = table[i + 1][0] = rules[i].move ;
  }
  for (let i = 1; i < table.length; i++) {
    for (let j = 1; j < table.length; j++) {
      if (rules[i - 1].strongerMoves.includes(table[0][j])) {
        table[i][j] = " lose";
      } else if (rules[i - 1].weakerMoves.includes(table[0][j])) {
        table[i][j] = "win";
      } else {
        table[i][j] = "draw";
        
      }
    }
  }
  return table;
}

function generateRule(moves, index) {
  const move = moves[index];
  const weakerMoves = generateWeakerMoves(moves, index, 1);
  const strongerMoves = generateStrongerMoves(
    moves,
    index,
    (moves.length - 1) / 2 + 1
  );
  return { move, weakerMoves, strongerMoves };
}

function generateWeakerMoves(moves, index, count) {
  const weakerMoves = [];
  while (count <= (moves.length - 1) / 2) {
    weakerMoves.push(moves[(index + count) % moves.length]);
    count++;
  }
  return weakerMoves;
}

function generateStrongerMoves(moves, index, count) {
  const strongerMoves = [];
  while (count <= moves.length - 1) {
    strongerMoves.push(moves[(index + count) % moves.length]);
    count++;
  }
  return strongerMoves;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function unique(arr) {
  return new Set(arr).size === arr.length;
}

function playGame(moves) {
  const movesLength = moves.length;
  let fit = true;

  if (movesLength === 0) {
    console.log("No moves entered");
    fit = false;
  } else if (movesLength < 3) {
    console.log("Minimum number of moves is 3");
    fit = false;
  } else if (movesLength % 2 === 0) {
    console.log("Entered an even number of moves");
    fit = false;
  }

  if (fit) {
    let active = moves[2] ? true : false;

    if (active && !unique(moves)) {
      active = false;
      console.log("Moves must be unique");
    }

    const compMoveChoose = moves[getRandomInt(moves.length)];

    let userMoveChoose = null;

    const key = generateKey();
    const hmac = generateHMAC(compMoveChoose, key);
    const table = generateRulesTable(moves);

    let perform = false;

    while (active) {
      console.log("HMAC:\n" + hmac);
      console.log("Available moves:");
      moves.forEach((move, index) => {
        console.log(index + 1 + " - " + move);
      });
      console.log("0 - exit");
      console.log("? - help");
      const choose = readline.question("Enter your move: ");

      if (choose === "?") {
        printTable(table);
      } else if (choose == 0) {
        active = false;
        console.log("Exit");
      } else {
        userMoveChoose = moves[+choose - 1];
      }

      if (active && !userMoveChoose) {
        console.log("Try again");
      } else if (userMoveChoose) {
        console.log("Your move: " + userMoveChoose);
        active = false;
        perform = true;
      }
    }

    if (perform) {
      console.log("Computer move: " + compMoveChoose);
      fight(table, userMoveChoose, compMoveChoose);
      console.log("HMAC key:\n" + key);
    }
  }
}

function printTable(table) {
  for (let i = 0; i < table.length; i++) {
    let print = "";
    for (let j = 0; j < table.length; j++) {
      print += table[i][j] + "  |";
    }
    console.log(print);
  }
  console.log();
}

function fight(table, userMove, compMove) {
  for (let i = 1; i < table.length; i++) {
    if (table[i][0] == compMove) {
      for (let j = 1; j < table.length; j++) {
        if (table[0][j] == userMove) {
          switch (table[i][j]) {
            case "<":
              console.log("You win!");
              break;
            case ">":
              console.log("You lost!");
              break;
            default:
              console.log("Draw!");
          }
        }
      }
    }
  }
}

const args = process.argv.slice(2);

if (args.length < 3 || args.length % 2 === 0 || !unique(args)) {
  console.log(
    "Error. Please provide an odd number of unique moves (>=3) as command line arguments"
  );
  console.log("Example: node script.js rock paper scissors");
} else {
  playGame(args);
}
