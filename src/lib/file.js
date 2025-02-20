import { readFile as fsReadFile} from 'node:fs/promises';

//Fall fengið úr sýnilausn Óla á verkefni 1

/**
 * Read a file and return its content.
 * @param {string} file File to read
 * @param {object} options.encoding asdf
 * @returns {Promise<string | null>} Content of file or `null` if unable to read.
 */
export async function readFileMy(file, { encoding = 'utf8' } = {}) {
  try {
    const content = await fsReadFile(file, { encoding });

    return content.toString(encoding);
  } catch (e) {
    console.error('unable to read file', file, e.message);
    return null;
  }
}