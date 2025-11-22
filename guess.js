const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const rand = () => Math.floor(Math.random() * 100) + 1;

function play() {
  const secret = rand();
  let tries = 0;
  const ask = () =>
    rl.question('Guess (1-100): ', (ans) => {
      const n = parseInt(ans, 10);
      if (Number.isNaN(n)) return ask();
      tries++;
      if (n > secret) return console.log('Too high'), ask();
      if (n < secret) return console.log('Too low'), ask();
      console.log(`Correct! Attempts: ${tries}`);
      rl.question('Play again? (y/n): ', (r) => {
        if (r.trim().toLowerCase().startsWith('y')) return play();
        rl.close();
      });
    });
  ask();
}

play();
