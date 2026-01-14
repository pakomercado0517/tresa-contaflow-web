/**
 * Type definitions for jspdf-autotable
 */

declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  export interface UserOptions {
    head?: string[][];
    body?: string[][];
    foot?: string[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: "auto" | "avoid" | "always";
    rowPageBreak?: "auto" | "avoid";
    tableWidth?: "auto" | "wrap" | number;
    showHead?: "everyPage" | "firstPage" | "never";
    showFoot?: "everyPage" | "lastPage" | "never";
    theme?: "striped" | "grid" | "plain";
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;
    columnStyles?: { [key: string]: Partial<Styles> };
    didParseCell?: (data: CellHookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: HookData) => void;
  }

  export interface Styles {
    font?: string;
    fontStyle?: string;
    overflow?: "linebreak" | "ellipsize" | "visible" | "hidden";
    fillColor?: string | number | [number, number, number];
    textColor?: string | number | [number, number, number];
    cellWidth?: "auto" | "wrap" | number;
    minCellHeight?: number;
    minCellWidth?: number;
    halign?: "left" | "center" | "right";
    valign?: "top" | "middle" | "bottom";
    fontSize?: number;
    cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    lineColor?: string | number | [number, number, number];
    lineWidth?: number;
  }

  export interface CellHookData {
    cell: Cell;
    row: Row;
    column: Column;
    section: "head" | "body" | "foot";
  }

  export interface HookData {
    pageNumber: number;
    pageCount: number;
    settings: UserOptions;
    table: Table;
    cursor: { x: number; y: number };
  }

  export interface Cell {
    raw: string | number;
    text: string[];
    styles: Styles;
    section: "head" | "body" | "foot";
    x: number;
    y: number;
    width: number;
    height: number;
    contentWidth: number;
    contentHeight: number;
    colSpan: number;
    rowSpan: number;
  }

  export interface Row {
    raw: any;
    index: number;
    section: "head" | "body" | "foot";
    cells: { [key: string]: Cell };
    height: number;
    y: number;
  }

  export interface Column {
    dataKey: string | number;
    index: number;
    width: number;
  }

  export interface Table {
    columns: Column[];
    head: Row[];
    body: Row[];
    foot: Row[];
    settings: UserOptions;
    finalY: number;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}

// Extend jsPDF to include lastAutoTable
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}
