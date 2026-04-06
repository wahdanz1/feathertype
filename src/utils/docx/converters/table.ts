/**
 * Converts table markdown nodes to docx Table objects
 */

import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  VerticalAlign,
  WidthType,
  BorderStyle,
} from 'docx';
import type { Table as MdTable, TableRow as MdTableRow, TableCell as MdTableCell } from 'mdast';
import type { ConverterContext } from './types';
import { convertInlineNodes } from './text';

/**
 * Convert a markdown table to a docx Table
 */
export function convertTable(
  node: MdTable,
  ctx: ConverterContext
): Table {
  const rows: TableRow[] = [];

  // Process each row
  for (let i = 0; i < node.children.length; i++) {
    const rowNode = node.children[i] as MdTableRow;
    const isHeader = i === 0; // First row is header in markdown tables

    rows.push(convertTableRow(rowNode, isHeader, ctx));
  }

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
  });
}

/**
 * Convert a single table row
 */
function convertTableRow(
  rowNode: MdTableRow,
  isHeader: boolean,
  ctx: ConverterContext
): TableRow {
  const cells: TableCell[] = [];

  for (const cellNode of rowNode.children) {
    cells.push(convertTableCell(cellNode as MdTableCell, isHeader, ctx));
  }

  return new TableRow({
    children: cells,
    tableHeader: isHeader,
  });
}

/**
 * Convert a single table cell
 */
function convertTableCell(
  cellNode: MdTableCell,
  isHeader: boolean,
  ctx: ConverterContext
): TableCell {
  const children = convertInlineNodes(cellNode.children, ctx);

  return new TableCell({
    children: [
      new Paragraph({
        children,
        spacing: {
          line: ctx.config.spacing.line,
          before: 0,
          after: 0,
        },
      }),
    ],
    margins: ctx.config.table.cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    shading: isHeader
      ? {
          fill: 'F0F0F0', // Light gray background for headers
          color: 'F0F0F0',
        }
      : undefined,
  });
}
