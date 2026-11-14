import { beforeAll, describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';

// Browsers and the Tauri webview have no Node Buffer; docx's bundled JSZip
// detects that when it loads, so the stub must precede the dynamic import.
vi.stubGlobal('Buffer', undefined);

const MARKDOWN = [
  '# Release notes',
  '',
  'Plain **bold** *italic* ~~struck~~ ***bold italic*** text.',
  '',
  '| Name | Value |',
  '| ---- | ----- |',
  '| a    | 1     |',
].join('\n');

let documentXml: string;
let bytes: Uint8Array;

beforeAll(async () => {
  const { markdownToDocxBuffer } = await import('./builder');
  const buffer = await markdownToDocxBuffer(MARKDOWN);
  expect(buffer).toBeInstanceOf(ArrayBuffer);
  vi.unstubAllGlobals();
  bytes = new Uint8Array(buffer);
  const zip = await JSZip.loadAsync(bytes);
  documentXml = await zip.file('word/document.xml')!.async('string');
});

function runContaining(text: string): string {
  const runs = documentXml.match(/<w:r>.*?<\/w:r>/gs) ?? [];
  const run = runs.find((r) => r.includes(`>${text}</w:t>`));
  expect(run, `no run for "${text}"`).toBeDefined();
  return run!;
}

describe('markdownToDocxBuffer without Node Buffer', () => {
  it('produces a zip package', () => {
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('PK');
  });

  it('writes a heading', () => {
    expect(documentXml).toMatch(/<w:pStyle w:val="Heading1"\/>/);
    expect(documentXml).toContain('>Release notes</w:t>');
  });

  it('writes a table', () => {
    expect(documentXml).toContain('<w:tbl>');
    expect(documentXml).toContain('>Value</w:t>');
  });

  it('keeps inline formatting on the right runs', () => {
    expect(runContaining('bold')).toMatch(/<w:b\/>/);
    expect(runContaining('italic')).toMatch(/<w:i\/>/);
    expect(runContaining('struck')).toMatch(/<w:strike\/>/);
    const both = runContaining('bold italic');
    expect(both).toMatch(/<w:b\/>/);
    expect(both).toMatch(/<w:i\/>/);
    expect(runContaining('Plain ')).not.toMatch(/<w:[bi]\/>/);
  });
});
