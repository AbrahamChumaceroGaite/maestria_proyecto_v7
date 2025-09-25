import crypto from 'crypto';
import { CHARACTER_SETS } from '../utils/constants';
import type { GeneratePasswordOptions } from '../types';

export function generatePassword(options: GeneratePasswordOptions): string {
  let charset = '';
  
  if (options.includeUppercase) charset += CHARACTER_SETS.UPPERCASE;
  if (options.includeLowercase) charset += CHARACTER_SETS.LOWERCASE;
  if (options.includeNumbers) charset += CHARACTER_SETS.NUMBERS;
  if (options.includeSymbols) charset += CHARACTER_SETS.SYMBOLS;
  
  if (options.excludeSimilar) {
    charset = charset.split('').filter(char => 
      !CHARACTER_SETS.SIMILAR.includes(char)
    ).join('');
  }
  
  if (charset === '') {
    throw new Error('Al menos un tipo de carácter debe estar seleccionado');
  }
  
  let password = '';
  const charsetLength = charset.length;
  
  for (let i = 0; i < options.length; i++) {
    const randomIndex = crypto.randomInt(0, charsetLength);
    password += charset[randomIndex];
  }
  
  return ensurePasswordCompliance(password, options, charset);
}

function ensurePasswordCompliance(
  password: string, 
  options: GeneratePasswordOptions,
  charset: string
): string {
  let result = password;
  
  if (options.includeUppercase && !/[A-Z]/.test(result)) {
    const upperChars = CHARACTER_SETS.UPPERCASE
      .split('')
      .filter(char => !options.excludeSimilar || !CHARACTER_SETS.SIMILAR.includes(char));
    if (upperChars.length > 0) {
      const randomIndex = crypto.randomInt(0, result.length);
      const randomChar = upperChars[crypto.randomInt(0, upperChars.length)];
      result = result.substring(0, randomIndex) + randomChar + result.substring(randomIndex + 1);
    }
  }
  
  if (options.includeLowercase && !/[a-z]/.test(result)) {
    const lowerChars = CHARACTER_SETS.LOWERCASE
      .split('')
      .filter(char => !options.excludeSimilar || !CHARACTER_SETS.SIMILAR.includes(char));
    if (lowerChars.length > 0) {
      const randomIndex = crypto.randomInt(0, result.length);
      const randomChar = lowerChars[crypto.randomInt(0, lowerChars.length)];
      result = result.substring(0, randomIndex) + randomChar + result.substring(randomIndex + 1);
    }
  }
  
  if (options.includeNumbers && !/\d/.test(result)) {
    const numberChars = CHARACTER_SETS.NUMBERS
      .split('')
      .filter(char => !options.excludeSimilar || !CHARACTER_SETS.SIMILAR.includes(char));
    if (numberChars.length > 0) {
      const randomIndex = crypto.randomInt(0, result.length);
      const randomChar = numberChars[crypto.randomInt(0, numberChars.length)];
      result = result.substring(0, randomIndex) + randomChar + result.substring(randomIndex + 1);
    }
  }
  
  if (options.includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(result)) {
    const symbolChars = CHARACTER_SETS.SYMBOLS.split('');
    const randomIndex = crypto.randomInt(0, result.length);
    const randomChar = symbolChars[crypto.randomInt(0, symbolChars.length)];
    result = result.substring(0, randomIndex) + randomChar + result.substring(randomIndex + 1);
  }
  
  return result;
}

export function generateSecurePhrase(wordCount: number = 4): string {
  const words = [
    'apple', 'brave', 'chair', 'dance', 'eagle', 'flame', 'grape', 'happy',
    'image', 'jolly', 'kitty', 'light', 'magic', 'night', 'ocean', 'peace',
    'quiet', 'river', 'storm', 'tiger', 'unity', 'voice', 'water', 'xenon',
    'youth', 'zebra', 'black', 'cloud', 'dream', 'earth', 'frost', 'green'
  ];
  
  const selectedWords: string[] = [];
  const usedIndices = new Set<number>();
  
  while (selectedWords.length < wordCount) {
    const randomIndex = crypto.randomInt(0, words.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedWords.push(words[randomIndex]);
    }
  }
  
  return selectedWords.join('-');
}