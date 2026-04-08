const { CATEGORY_RULES } = require('../utils/categoryRules');

const tokenize = (text) => {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
};

const buildCorpusDocuments = (userExamplesByCategory = {}) => {
  return CATEGORY_RULES.map((rule) => {
    const seedText = rule.keywords.join(' ');
    const learnedText = (userExamplesByCategory[rule.name] || []).join(' ');
    return {
      category: rule.name,
      tokens: tokenize(`${rule.name} ${seedText} ${learnedText}`)
    };
  });
};

const computeIdf = (documents) => {
  const documentCount = documents.length || 1;
  const frequencies = new Map();

  documents.forEach((doc) => {
    const uniqueTokens = new Set(doc.tokens);
    uniqueTokens.forEach((token) => {
      frequencies.set(token, (frequencies.get(token) || 0) + 1);
    });
  });

  const idf = new Map();
  frequencies.forEach((count, token) => {
    idf.set(token, Math.log((documentCount + 1) / (count + 1)) + 1);
  });

  return idf;
};

const buildVector = (tokens, idf) => {
  const counts = new Map();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
  });

  const totalTokens = tokens.length || 1;
  const vector = new Map();

  counts.forEach((count, token) => {
    const tf = count / totalTokens;
    vector.set(token, tf * (idf.get(token) || 0));
  });

  return vector;
};

const cosineSimilarity = (vectorA, vectorB) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  vectorA.forEach((value, token) => {
    dot += value * (vectorB.get(token) || 0);
    normA += value * value;
  });

  vectorB.forEach((value) => {
    normB += value * value;
  });

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const scoreTextAgainstCategories = (text, userExamplesByCategory = {}) => {
  const documents = buildCorpusDocuments(userExamplesByCategory);
  const idf = computeIdf(documents);
  const inputVector = buildVector(tokenize(text), idf);

  return documents
    .map((doc) => ({
      category: doc.category,
      score: cosineSimilarity(inputVector, buildVector(doc.tokens, idf))
    }))
    .sort((left, right) => right.score - left.score);
};

module.exports = {
  tokenize,
  scoreTextAgainstCategories
};
