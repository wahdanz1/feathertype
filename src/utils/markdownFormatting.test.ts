// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import type { EditorView } from '@codemirror/view';
import { formats, hasFormat } from './markdownFormatting';
import { createView, printSpec } from './editorSpec';

// jsdom has no layout; CodeMirror's measure pass needs these to exist.
Range.prototype.getClientRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
Range.prototype.getBoundingClientRect = () => new DOMRect();

let view: EditorView | undefined;
afterEach(() => view?.destroy());

function apply(command: (v: EditorView) => void, spec: string): string {
  view = createView(spec);
  command(view);
  return printSpec(view.state);
}

type Case = [name: string, command: keyof typeof formats, before: string, after: string];

const inlineCases: Case[] = [
  // Toggle reads the span that actually encloses the cursor
  ['bold between bold spans wraps only the word', 'bold', '**a** b‸ **c**', '**a** **b‸** **c**'],
  ['bold selection between bold spans', 'bold', '**a** «b» **c**', '**a** **«b»** **c**'],
  ['bold inside a span removes it', 'bold', '**ab‸c**', 'ab‸c'],
  ['bold right after a span removes it', 'bold', '**abc**‸ x', 'abc‸ x'],
  ['bold on a selected span removes it', 'bold', '«**word**»', '«word»'],
  ['bold inside part of a span removes it', 'bold', '**w«or»d**', 'w«or»d'],
  ['bold inside bold-italic keeps the italic', 'bold', '***a‸***', '*a‸*'],
  ['bold over part of a span merges it', 'bold', '«a **b»** c', '**«a b»** c'],
  ['code between code spans wraps only the word', 'inlineCode', '`a` an‸d `b`', '`a` `an‸d` `b`'],
  ['code inside a span removes it', 'inlineCode', '`co‸de`', 'co‸de'],
  ['strikethrough wraps the word', 'strikethrough', 'ab‸c', '~~ab‸c~~'],
  ['strikethrough inside a span removes it', 'strikethrough', '~~ab‸c~~', 'ab‸c'],
  // Intra-word underscores are not emphasis
  ['italic in snake_case wraps the whole word', 'italic', 'my_va‸r_name', '_my_va‸r_name_'],
  ['italic inside a span removes it', 'italic', '_wo‸rd_', 'wo‸rd'],
  ['italic on part of a word uses *', 'italic', 'foo«bar»', 'foo*«bar»*'],
  // Unicode words
  ['bold inside a non-ASCII word', 'bold', 'smö‸rgås', '**smö‸rgås**'],
  ['bold right after a non-ASCII letter', 'bold', 'café‸ x', '**café‸** x'],
  ['bold right before a word', 'bold', 'x ‸word', 'x **‸word**'],
  // Selections
  ['selected markers are wrapped, never deleted', 'bold', 'a «***» b', 'a **«***»** b'],
  ['surrounding whitespace stays outside', 'bold', '«word »next', '**«word»** next'],
  ['multi-line selection wraps each line', 'bold', '«one\n\ntwo»', '**«one**\n\n**two»**'],
  ['multi-line selection skips list markers', 'bold', '«- one\n- two»', '- **«one**\n- **two»**'],
  ['multi-line selection of bold lines unwraps', 'bold', '«**one**\n**two**»', '«one\ntwo»'],
  // Nothing to wrap
  ['empty line inserts a selected placeholder', 'bold', '‸', '**«bold text»**'],
  ['cursor between spaces inserts a placeholder', 'bold', 'a ‸ b', 'a **«bold text»** b'],
  ['link wraps the selection', 'link', '«site»', '[«site»](url)'],
];

const blockCases: Case[] = [
  ['heading keeps the cursor', 'heading1', 'Tit‸le', '# Tit‸le'],
  ['heading toggles off', 'heading1', '# Tit‸le', 'Tit‸le'],
  ['heading switches level', 'heading2', '# Tit‸le', '## Tit‸le'],
  ['bullet keeps the cursor', 'bulletList', 'ite‸m', '- ite‸m'],
  ['bullet on an empty line', 'bulletList', '‸', '- ‸'],
  ['bullet skips blank lines', 'bulletList', '«a\n\nb»', '- «a\n\n- b»'],
  ['bullet keeps a tab indent', 'bulletList', '\tite‸m', '\t- ite‸m'],
  ['bullet toggles off every line', 'bulletList', '«- a\n- b»', '«a\nb»'],
  ['selection ending at a line start skips that line', 'bulletList', '«one\n»two', '- «one\n»two'],
  ['numbered counts per indent level', 'numberedList', '«one\n  two\nthree»', '1. «one\n  1. two\n2. three»'],
  ['numbered toggles off and keeps indents', 'numberedList', '«1. a\n\t2. b»', '«a\n\tb»'],
  ['numbered replaces a bullet', 'numberedList', '- ite‸m', '1. ite‸m'],
  ['blockquote keeps the cursor', 'blockquote', 'quo‸te', '> quo‸te'],
];

describe.each([['inline', inlineCases], ['block', blockCases]])('%s formatting', (_, cases) => {
  it.each(cases)('%s', (_name, command, before, after) => {
    expect(apply(formats[command] as (v: EditorView) => void, before)).toBe(after);
  });
});

describe('hasFormat', () => {
  it.each([
    ['**a** b‸ **c**', '**', false],
    ['**a‸**', '**', true],
    ['my_va‸r_name', '_', false],
    ['_a‸_', '_', true],
    ['`a` an‸d `b`', '`', false],
    ['~~a‸~~', '~~', true],
  ] as const)('%s with %s is %s', (spec, marker, expected) => {
    view = createView(spec);
    expect(hasFormat(view, marker)).toBe(expected);
  });
});
