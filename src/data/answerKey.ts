
type AnswerKeySet = { [questionNumber: number]: string };
type AnswerKeyType = { [setNumber: number]: AnswerKeySet };
type AnswerKeys = {
  single: AnswerKeyType;
  multi: AnswerKeyType;
};

const options = ['A', 'B', 'C', 'D'];

const generateKeySet = (questionCount: number): AnswerKeySet => {
  const keySet: AnswerKeySet = {};
  for (let i = 1; i <= questionCount; i++) {
    keySet[i] = options[Math.floor(Math.random() * options.length)];
  }
  return keySet;
};

const generateKeysForType = (questionCount: number, numberOfSets: number): AnswerKeyType => {
  const keyType: AnswerKeyType = {};
  for (let set = 1; set <= numberOfSets; set++) {
    keyType[set] = generateKeySet(questionCount);
  }
  return keyType;
};

// Pre-generate keys for a max of 200 questions and 5 sets for simplicity.
// In a real-world scenario, these might be fetched from a secure backend.
export const answerKeys: AnswerKeys = {
  single: generateKeysForType(200, 5),
  multi: generateKeysForType(200, 5),
};
