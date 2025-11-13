"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridExpandMoreIcon,
} from "@mui/x-data-grid";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Discrepancy {
  discrepancyField: string;
  discrepancyType: string;
  discrepancyReason: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  date: string;
  status: string;
  discrepancyReasons: Discrepancy[];
  logs: string;
}

// Sample data
const sampleInvoices: Invoice[] = [
    {
        id: "1",
        invoiceNumber: "INV-001",
        vendor: "Acme Corp",
        amount: 1500.0,
        date: new Date("2025-11-01") as any,
        status: "matched",
        discrepancyReasons: [],
        logs: "Invoice matched successfully",
    },
    {
        id: "2",
        invoiceNumber: "INV-002",
        vendor: "Tech Solutions",
        amount: 2500.0,
        date: new Date("2025-11-02") as any,
        status: "mismatch",
        discrepancyReasons: [
            {
                discrepancyField: "amount",
                discrepancyType: "value_mismatch",
                discrepancyReason: "Expected 2500.00, found 2450.00",
            },
        ],
        logs: "Amount mismatch detected during reconciliation",
    },
    {
        id: "3",
        invoiceNumber: "INV-003",
        vendor: "Global Supplies",
        amount: 750.5,
        date: new Date("2025-11-03") as any,
        status: "pending",
        discrepancyReasons: [
            {
                discrepancyField: "date",
                discrepancyType: "date_mismatch",
                discrepancyReason: "Invoice date not yet received",
            },
            {
                discrepancyField: "lineItems",
                discrepancyType: "missing_data",
                discrepancyReason: "Line item details missing",
            },
        ],
        logs: "Awaiting supporting documentation",
    },
    {
        id: "4",
        invoiceNumber: "INV-004",
        vendor: "Office Depot",
        amount: 320.0,
        date: new Date("2025-11-04") as any,
        status: "matched",
        discrepancyReasons: [],
        logs: "Reconciliation completed",
    },
    {
        id: "5",
        invoiceNumber: "INV-005",
        vendor: "Energy Inc",
        amount: 3200.75,
        date: new Date("2025-11-05") as any,
        status: "exception",
        discrepancyReasons: [
            {
                discrepancyField: "taxAmount",
                discrepancyType: "calculation_error",
                discrepancyReason: "Tax calculation differs from PO",
            },
        ],
        logs: "Manual review required - escalated to finance",
    },
];

// Status color mapper
const getStatusColor = (status: string) => {
  switch (status) {
    case "matched":
      return "success";
    case "mismatch":
      return "warning";
    case "pending":
      return "info";
    case "exception":
      return "error";
    default:
      return "default";
  }
};

export default function InvoiceTable() {
  const [openDiscrepancies, setOpenDiscrepancies] = useState<string | null>(null);
  const [openLogs, setOpenLogs] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleOpenDiscrepancies = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenDiscrepancies(invoice.id);
  };

  const handleOpenLogs = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenLogs(invoice.id);
  };

  const handleClose = () => {
    setOpenDiscrepancies(null);
    setOpenLogs(null);
    setSelectedInvoice(null);
  };

  const columns: GridColDef[] = [
    {
      field: "invoiceNumber",
      headerName: "Invoice #",
      width: 120,
      renderCell: (params: GridRenderCellParams<Invoice>) => (
        <Link
          href={`/${params.row.invoiceNumber}`}
          style={{
            color: "#1976d2",
            textDecoration: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          {params.row.invoiceNumber}
        </Link>
      ),
    },
    { field: "vendor", headerName: "Vendor", width: 180 },
    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      type: "number",
      renderCell: (params) => `$${params.value.toFixed(2)}`,
    },
    { field: "date", headerName: "Date", width: 120, type: "date" },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams<Invoice>) => (
        <Chip
          label={params.row.status}
          color={getStatusColor(params.row.status) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "discrepancyReasons",
      headerName: "Discrepancies",
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Invoice>) =>
        params.row.discrepancyReasons && params.row.discrepancyReasons.length > 0 ? (
          <IconButton
            size="small"
            onClick={() => handleOpenDiscrepancies(params.row)}
          >
            <ExpandMoreIcon /> ({params.row.discrepancyReasons.length})
          </IconButton>
        ) : (
          <span>-</span>
        ),
    },
    {
      field: "logs",
      headerName: "Logs",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Invoice>) => (
        <IconButton size="small" onClick={() => handleOpenLogs(params.row)}>
          View
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ height: 600, width: "100%", mt: 2 }}>
        <DataGrid
          rows={sampleInvoices}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          sx={{
            bgcolor: "background.paper",
            "& .MuiDataGrid-root": {
              border: "1px solid #e0e0e0",
            },
          }}
        />
      </Box>

      {/* Discrepancies Modal */}
      <Dialog
        open={!!openDiscrepancies}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Discrepancies - {selectedInvoice?.invoiceNumber}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice?.discrepancyReasons &&
          selectedInvoice.discrepancyReasons.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Field</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedInvoice.discrepancyReasons.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{d.discrepancyField}</TableCell>
                      <TableCell>
                        <Chip label={d.discrepancyType} size="small" />
                      </TableCell>
                      <TableCell>{d.discrepancyReason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>No discrepancies found.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Logs Modal */}
      <Dialog open={!!openLogs} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Logs - {selectedInvoice?.invoiceNumber}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {selectedInvoice?.logs}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
