"use client";

import React, { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridOptions, RowClickedEvent } from "ag-grid-community";
import { useTheme } from "next-themes";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export interface DataGridProps<T = any> {
  rowData: T[] | null | undefined;
  columnDefs: ColDef<T>[];
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[] | boolean;
  domLayout?: "autoHeight" | "normal" | "print";
  rowHeight?: number;
  headerHeight?: number;
  onRowClicked?: (event: RowClickedEvent<T>) => void;
  className?: string;
  defaultColDef?: ColDef<T>;
  gridOptions?: GridOptions<T>;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataGrid<T = any>({
  rowData,
  columnDefs,
  pagination = true,
  paginationPageSize = 10,
  paginationPageSizeSelector = [10, 20, 50],
  domLayout = "autoHeight",
  rowHeight = 64,
  headerHeight = 48,
  onRowClicked,
  className = "",
  defaultColDef,
  gridOptions,
  loading = false,
  emptyMessage = "No matching records found.",
}: DataGridProps<T>) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  const mergedDefaultColDef = useMemo<ColDef<T>>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
      ...defaultColDef,
    };
  }, [defaultColDef]);

  const overlayNoRowsTemplate = useMemo(() => {
    return `<div class="p-8 text-center text-xs font-mono text-[#6C7378] dark:text-white/40">${emptyMessage}</div>`;
  }, [emptyMessage]);

  const overlayLoadingTemplate = useMemo(() => {
    return `<div class="p-8 text-center text-xs font-mono text-[#0070BA] dark:text-[#60CDFF] animate-pulse">Loading cryptographic records...</div>`;
  }, []);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] shadow-xs">
      <div
        className={`passport-ag-grid w-full ${
          isDark ? "ag-theme-quartz-dark" : "ag-theme-quartz"
        } ${className}`}
      >
        <AgGridReact<T>
          rowData={rowData ?? []}
          columnDefs={columnDefs}
          defaultColDef={mergedDefaultColDef}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          domLayout={domLayout}
          rowSelection="single"
          suppressCellFocus={true}
          animateRows={true}
          onRowClicked={onRowClicked}
          overlayNoRowsTemplate={overlayNoRowsTemplate}
          overlayLoadingTemplate={overlayLoadingTemplate}
          loading={loading}
          {...gridOptions}
        />
      </div>

      <style jsx global>{`
        /* AG Grid Design System Theme Overrides */
        .passport-ag-grid {
          --ag-font-family: inherit;
          --ag-font-size: 12px;
          --ag-header-height: 48px;
          --ag-row-height: 64px;
          --ag-borders: none;
          --ag-cell-horizontal-padding: 16px;
        }

        /* Prevent grid rows from overlapping or covering the table headers */
        .passport-ag-grid .ag-header {
          position: relative !important;
          z-index: 2 !important;
          border-bottom: 1px solid var(--ag-border-color) !important;
        }

        .passport-ag-grid .ag-header-row {
          z-index: 2 !important;
        }

        .passport-ag-grid .ag-body-viewport {
          position: relative;
          z-index: 1;
        }

        .passport-ag-grid .ag-row {
          z-index: 1;
          display: flex;
          align-items: center;
          transition: background-color 150ms ease;
        }

        .passport-ag-grid .ag-cell {
          display: flex;
          align-items: center;
          line-height: normal;
        }

        /* Light Theme */
        .passport-ag-grid.ag-theme-quartz {
          --ag-background-color: #ffffff;
          --ag-header-background-color: #f8fafc;
          --ag-header-foreground-color: #0a2540;
          --ag-data-color: #1d1e20;
          --ag-border-color: #e1e7eb;
          --ag-row-border-color: #f1f5f9;
          --ag-row-hover-color: rgba(96, 205, 255, 0.14);
          --ag-selected-row-background-color: rgba(96, 205, 255, 0.22);
          --ag-odd-row-background-color: #ffffff;
        }

        /* Dark Theme */
        .passport-ag-grid.ag-theme-quartz-dark {
          --ag-background-color: #111114;
          --ag-header-background-color: #0d0d10;
          --ag-header-foreground-color: #a1a1aa;
          --ag-data-color: #fafafa;
          --ag-border-color: rgba(255, 255, 255, 0.08);
          --ag-row-border-color: rgba(255, 255, 255, 0.05);
          --ag-row-hover-color: rgba(96, 205, 255, 0.12);
          --ag-selected-row-background-color: rgba(96, 205, 255, 0.20);
          --ag-odd-row-background-color: #111114;
        }

        /* Header Labels */
        .passport-ag-grid .ag-header-cell-label {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Pagination Panel */
        .passport-ag-grid .ag-paging-panel {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          border-top: 1px solid var(--ag-border-color);
          padding: 8px 16px;
        }

        /* Smooth Row Transitions */
        .passport-ag-grid .ag-row {
          transition: background-color 150ms ease;
        }
      `}</style>
    </div>
  );
}

