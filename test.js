const args = require('args')

args
  .option('random', 'Random std output and exit status', true)
  .option('interval', 'Set interval of output (ms)', 750)
  .option('max-time', 'End process after time elapsed in ms, 0 equals infinite', 0)
  .option('err-chance', 'Chance for error output (1-100)', 50)
  .option('exit-code', 'Exit with code', 0);

const flags = args.parse(process.argv);

const red = (str) => {
  return `\u001b[91m${str}\u001b[0m`
};

const print = (str) => {
  console.log(str );
};

const printErr = (str) => {
  console.error(red(str));
};

const { random, interval, maxTime, exitCode, errChance } = flags;

print('arguments:');
print("  random: " + random);
print("  interval: " + interval);
print("  max-time: " + maxTime);
print("  exit-code: " + exitCode);
print("  err-chance: " + exitCode);
print("");

let intervalFunc;

const outputStr = () => {
  const err = Math.round(Math.random() * 100) < errChance;

  if(!err || !random) {
    print("stdout print at " + new Date().toLocaleDateString());
  } else {
    printErr("stderr print at " + new Date().toLocaleDateString());
  }

  if(maxTime !== 0 && performance.now() > maxTime) {
    process.exit(err ? 1 : 0);
  }
}

intervalFunc = setInterval(outputStr, interval);