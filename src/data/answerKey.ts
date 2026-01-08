export const answerKey: { [key: number]: string } = {};

const options = ['A', 'B', 'C', 'D'];

for (let i = 1; i <= 100; i++) {
  answerKey[i] = options[Math.floor(Math.random() * options.length)];
}
