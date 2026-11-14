// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import type { EditorView } from '@codemirror/view';
import { createView, pressEnter, printSpec } from './editorSpec';

// jsdom has no layout; CodeMirror's measure pass needs these to exist.
Range.prototype.getClientRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
Range.prototype.getBoundingClientRect = () => new DOMRect();

let view: EditorView | undefined;
afterEach(() => view?.destroy());

const fence = '```';
const EMPTY_ROW = '|        |        |';

describe('Enter', () => {
  it.each([
    // Lists
    ['empty bullet item ends the list without joining the next line', '- a\n- ‸\nnext', '- a\n‸\nnext'],
    ['empty nested bullet keeps its indent', '- a\n  - ‸', '- a\n  ‸'],
    ['empty numbered item ends the list', '1. a\n2. ‸', '1. a\n‸'],
    ['non-empty item continues the list', '- a‸', '- a\n- ‸'],
    ['a setext underline is not a list item', 'Title\n-‸', 'Title\n-\n‸'],
    ['a dash inside a code fence is left alone', `${fence}\n- ‸\n${fence}`, `${fence}\n- \n‸\n${fence}`],
    // Tables
    ['header row adds a row below the separator', '| a | b |‸\n|---|---|\n| 1 | 2 |', `| a | b |\n|---|---|\n| ‸${EMPTY_ROW.slice(2)}\n| 1 | 2 |`],
    ['body row adds a row below itself', '| a | b |\n|---|---|\n| 1 | 2 |‸', `| a | b |\n|---|---|\n| 1 | 2 |\n| ‸${EMPTY_ROW.slice(2)}`],
    ['a table row inside a code fence is left alone', `${fence}\n| a | b |‸\n${fence}`, `${fence}\n| a | b |\n‸\n${fence}`],
  ])('%s', (_name, before, after) => {
    view = createView(before);
    pressEnter(view);
    expect(printSpec(view.state)).toBe(after);
  });
});
