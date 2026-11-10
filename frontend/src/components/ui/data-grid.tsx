"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridOptions, GridReadyEvent, RowClickedEvent } from "ag-grid-community";
import { useTheme } from "next-themes";
import { Download } from "lucide-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";

export interface GridApiRef {
  exportDataAsCsv: (params?: any) => void;
  [key: string]: any;
}

export function useGridApiRef<T = any>() {
  return useRef<GridApiRef>({
    exportDataAsCsv: () => {},
  });
}

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
  // Master / Detail View
  masterDetail?: boolean;
  detailCellRenderer?: any;
  detailRowHeight?: number;
  detailCellRendererParams?: any;
  // Row Grouping Drop Panel
  rowGroupPanelShow?: "always" | "onlyWhenGrouping" | "never";
  // Toolbar & CSV Export
  showToolbar?: boolean;
  showDownloadCsv?: boolean;
  csvFileName?: string;
  title?: string;
  onGridReady?: (params: GridReadyEvent<T>) => void;
  apiRef?: React.MutableRefObject<any>;
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
  masterDetail = false,
  detailCellRenderer,
  detailRowHeight = 280,
  detailCellRendererParams,
  rowGroupPanelShow,
  showToolbar = false,
  showDownloadCsv = true,
  csvFileName,
  title,
  onGridReady,
  apiRef: externalGridApi,
}: DataGridProps<T>) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const internalGridRef = useRef<AgGridReact<T>>(null);
  const fallbackGridApi = useGridApiRef<T>();
  const gridApi = externalGridApi || fallbackGridApi;

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

  const handleGridReady = (params: GridReadyEvent<T>) => {
    gridApi.current = params.api;
    if (onGridReady) {
      onGridReady(params);
    }
  };

  const handleDownloadCsv = () => {
    const fileName =
      csvFileName ||
      `${title ? title.toLowerCase().replace(/\s+/g, "_") : "export"}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    if (gridApi.current && typeof gridApi.current.exportDataAsCsv === "function") {
      gridApi.current.exportDataAsCsv({ fileName });
    } else if (internalGridRef.current?.api) {
      internalGridRef.current.api.exportDataAsCsv({ fileName });
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] shadow-xs">
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {title && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
                {title}
              </span>
            )}
            <span className="text-[11px] font-mono text-[#6C7378] dark:text-white/50">
              {rowData ? `${rowData.length} records` : "0 records"}
            </span>
          </div>

          {showDownloadCsv && (
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-[#002991] dark:text-[#60CDFF] bg-[#002991]/5 dark:bg-[#60CDFF]/10 hover:bg-[#002991]/10 dark:hover:bg-[#60CDFF]/20 border border-[#002991]/20 dark:border-[#60CDFF]/30 transition-all shadow-xs active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          )}
        </div>
      )}

      <div
        className={`passport-ag-grid w-full ${
          isDark ? "ag-theme-quartz-dark" : "ag-theme-quartz"
        } ${className}`}
      >
        <AgGridReact<T>
          ref={internalGridRef}
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
          onGridReady={handleGridReady}
          overlayNoRowsTemplate={overlayNoRowsTemplate}
          overlayLoadingTemplate={overlayLoadingTemplate}
          loading={loading}
          masterDetail={masterDetail}
          detailCellRenderer={detailCellRenderer}
          detailRowHeight={detailRowHeight}
          detailCellRendererParams={detailCellRendererParams}
          rowGroupPanelShow={rowGroupPanelShow}
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

        /* Group Cell Renderer & Expand Chevron */
        .passport-ag-grid .ag-cell-wrapper {
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          gap: 8px !important;
        }

        .passport-ag-grid .ag-group-value {
          display: inline-block !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.02em !important;
          font-size: 12px !important;
          color: inherit !important;
        }

        .passport-ag-grid .ag-group-expanded,
        .passport-ag-grid .ag-group-contracted {
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #002991 !important;
        }
        .passport-ag-grid.ag-theme-quartz-dark .ag-group-expanded,
        .passport-ag-grid.ag-theme-quartz-dark .ag-group-contracted {
          color: #60CDFF !important;
        }

        /* Hide AG Grid watermark */
        .passport-ag-grid .ag-watermark,
        .ag-watermark {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* Master Detail Row Styling */
        .passport-ag-grid .ag-details-row,
        .passport-ag-grid .ag-details-row-fixed-height {
          display: block !important;
          height: auto !important;
          padding: 0 !important;
          border-bottom: 1px solid var(--ag-border-color) !important;
        }
        .passport-ag-grid .ag-details-row .ag-cell,
        .passport-ag-grid .ag-details-row-fixed-height .ag-cell {
          display: block !important;
          padding: 0 !important;
          height: 100% !important;
        }

        /* Row Grouping Drop Panel */
        .passport-ag-grid .ag-column-drop-wrapper {
          border-bottom: 1px solid var(--ag-border-color);
          background-color: var(--ag-header-background-color);
          padding: 8px 16px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
        }
        .passport-ag-grid .ag-column-drop-cell {
          border-radius: 9999px;
          background: rgba(96, 205, 255, 0.15);
          border: 1px solid rgba(96, 205, 255, 0.3);
          color: #002991;
          padding: 2px 10px;
        }
        .passport-ag-grid.ag-theme-quartz-dark .ag-column-drop-cell {
          color: #60CDFF;
          background: rgba(96, 205, 255, 0.12);
          border-color: rgba(96, 205, 255, 0.25);
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

