import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

/**
 * Guarda de encoding do repositório.
 *
 * O AGENTS.md já foi commitado com double-encoding (UTF-8 lido como cp1252),
 * o que trocou toda a acentuação e destruiu as árvores ASCII. Vários arquivos
 * também tinham BOM. Estes testes impedem a regressão.
 *
 * O padrão de mojibake é montado a partir de code points, nunca escrito
 * literalmente aqui: se os caracteres estivessem no código-fonte, este arquivo
 * acusaria a si mesmo.
 */

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|pdf|zip|woff2?|ttf|otf|mp4)$/i;
const SELF = 'src/__tests__/encoding.test.ts';

const MOJIBAKE = new RegExp(
  [
    `[${String.fromCharCode(0xc3)}${String.fromCharCode(0xc2)}][${String.fromCharCode(
      0x80,
    )}-${String.fromCharCode(0xbf)}]`,
    `${String.fromCharCode(0xe2)}${String.fromCharCode(0x20ac)}`,
    `${String.fromCharCode(0xe2)}${String.fromCharCode(0x201d)}`,
    `${String.fromCharCode(0xe2)}${String.fromCharCode(0x2022)}`,
    `${String.fromCharCode(0xe2)}${String.fromCharCode(0x2013)}`,
  ].join('|')
);

function trackedFiles(): string[] {
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });

  return out
    .split('\0')
    .filter(Boolean)
    .filter((file) => !BINARY_EXT.test(file))
    .filter((file) => file !== SELF);
}

function readRaw(file: string): Buffer {
  return readFileSync(resolve(process.cwd(), file));
}

describe('encoding dos arquivos versionados', () => {
  const files = trackedFiles();

  it('encontra arquivos versionados para verificar', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('detecta mojibake em texto corrompido', () => {
    const corrompido = String.fromCharCode(0xc3, 0xa7);

    expect(MOJIBAKE.test(corrompido)).toBe(true);
  });

  it('não acusa texto acentuado correto', () => {
    const correto = `Descri${String.fromCharCode(0xe7, 0xe3)}o`;

    expect(MOJIBAKE.test(correto)).toBe(false);
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
