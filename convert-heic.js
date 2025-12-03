import { readFile, writeFile } from 'fs/promises';
import heicConvert from 'heic-convert';

const [,, inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node convert-heic.js <input.heic> <output.jpg>');
  process.exit(1);
}

try {
  const inputBuffer = await readFile(inputPath);
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 0.9
  });
  
  await writeFile(outputPath, outputBuffer);
  console.log(`Converted ${inputPath} to ${outputPath}`);
} catch (error) {
  console.error('Error converting HEIC:', error);
  process.exit(1);
}
