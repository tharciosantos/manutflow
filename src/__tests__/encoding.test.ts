import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

/**
 * Guarda de encoding do repositório.
 *
 * O AGENTS.md já foi commitado com double-encoding (UTF-8 lido como cp1252),
 * o que trocou toda a acentuação por sequências como "DescriÃ§Ã£o" e destruiu
 * as árvores ASCII. Vários arquivos também tinham BOM. Estes testes impedem
 * a regressão.
 */

const MOJIBAKE = /[ÃÂ][\u0080-\u00bf]|â€|â”|â•|â–/;
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|pdf|zip|woff2?|ttf|otf|mp4)$/i;

function trackedFiles(): string[] {
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });

  return out
    .split('\0')
    .filter(Boolean)
    .filter((file) => !BINARY_EXT.test(file));
}

function readRaw(file: string): Buffer {
  return readFileSync(resolve(process.cwd(), file));
}

describe('encoding dos arquivos versionados', () => {
  const files = trackedFiles();

  it('encontra arquivos versionados para verificar', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('não contém sequências de double-encoding', () => {
    const corrompidos = files.filter((file) => MOJIBAKE.test(readRaw(file).toString('utf8')));

    expect(corrompidos).toEqual([]);
  });

  it('não começa com BOM', () => {
    const comBom = files.filter((file) => readRaw(file).subarray(0, 3).equals(BOM));

    expect(comBom).toEqual([]);
  });

  it('não contém caractere de substituição U+FFFD', () => {
    const comFffd = files.filter((file) => readRaw(file).toString('utf8').includes('\uFFFD'));

    expect(comFffd).toEqual([]);
  });

  it('AGENTS.md é UTF-8 válido', () => {
    const decoder = new TextDecoder('utf-8', { fatal: true });

    expect(() => decoder.decode(readRaw('AGENTS.md'))).not.toThrow();
  });
});