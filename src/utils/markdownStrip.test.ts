import { describe, expect, it } from 'vitest';
import { countPlainTextCharacters, stripMarkdown } from './markdownStrip';

describe('stripMarkdown', () => {
  it('removes inline formatting and keeps the text', () => {
    expect(stripMarkdown('**bold** _italic_ ~~gone~~ `code`')).toBe('bold italic gone code');
  });

  it('keeps link text and drops images', () => {
    expect(stripMarkdown('[FeatherType](https://example.com) ![logo](logo.png)')).toBe('FeatherType ');
  });

  it('strips block markers', () => {
    expect(stripMarkdown('# Title\n- item\n1. step\n> quote\n---')).toBe('Title\nitem\nstep\nquote\n');
  });

  it('drops fenced code blocks entirely', () => {
    expect(stripMarkdown('before\n```ts\nconst x = 1;\n```\nafter')).toBe('before\n\nafter');
  });
});

describe('countPlainTextCharacters', () => {
  it('counts only visible characters', () => {
    expect(countPlainTextCharacters('**hi**')).toBe(2);
  });
});
