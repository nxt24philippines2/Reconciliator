"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Alert,
  Button,
  CircularProgress,
  Stack,
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
    logs: `Invoice matched successfully
Checked vendor: Acme Corp
Amount verified: $1,500.00
Reconciled on 2025-11-06 by user: auditor1`,
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    vendor: "Tech Solutions",
    amount: 2500.0,
    date: new Date("2025-11-02") as any,
    status: "with discrepancy",
    discrepancyReasons: [
      {
        discrepancyField: "amount",
        discrepancyType: "value_mismatch",
        discrepancyReason: "Expected 2500.00, found 2450.00",
      },
    ],
    logs: `Amount mismatch detected during reconciliation
Expected: $2,500.00
Found: $2,450.00
Action: Sent ticket #TS-342 to finance for investigation
Last updated: 2025-11-07 09:12 UTC`,
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    vendor: "Global Supplies",
    amount: 750.5,
    date: new Date("2025-11-03") as any,
    status: "with discrepancy",
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
    logs: `Awaiting supporting documentation
Requested missing line items from vendor on 2025-11-04
Follow-up email sent on 2025-11-10
Next action: auto-remind in 3 days`,
  },
  {
    id: "4",
    invoiceNumber: "INV-004",
    vendor: "Office Depot",
    amount: 320.0,
    date: new Date("2025-11-04") as any,
    status: "reconciled",
    discrepancyReasons: [],
    logs: `Reconciliation completed
PO matched, tax calculated and verified
Processed by: reconciler-bot v2.1
Reference: batch-2025-11-05-04`,
  },
  {
    id: "5",
    invoiceNumber: "INV-005",
    vendor: "Energy Inc",
    amount: 3200.75,
    date: new Date("2025-11-05") as any,
    status: "with discrepancy",
    discrepancyReasons: [
      {
        discrepancyField: "taxAmount",
        discrepancyType: "calculation_error",
        discrepancyReason: "Tax calculation differs from PO",
      },
    ],
    logs: `Manual review required - escalated to finance
Issue: Tax calculation differs from purchase order
Assigned to: finance-team@company.com
Notes:
- Check tax rate applied in system
- Verify PO tax line
Escalation created: FIN-879`,
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// Status color mapper
const getStatusColor = (status: string) => {
  switch (status) {
    case "matched":
      return "success";
    case "with discrepancy":
      return "error";
    case "reconciled":
      return "info";
    default:
      return "default";
  }
};

export default function InvoiceTable() {
  const [openDiscrepancies, setOpenDiscrepancies] = useState<string | null>(null);
  const [openLogs, setOpenLogs] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // local fetch state (moved inside component)
  const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {

      const controller = signal ? undefined : new AbortController();
      const usedSignal = signal ?? controller?.signal;

      let timeoutId: any;
      if (!signal && controller) {
        timeoutId = setTimeout(() => controller.abort(), 10000);
      }

      const res = await fetch(API_URL, { method: "GET" });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if(!res.body) throw new Error("No response body");
      debugger
      const payload = await res.json();
      if (!payload || (Array.isArray(payload) && payload.length === 0)) {
        throw new Error("Empty response body");
      }

      let items: any[] = [];
      if (Array.isArray(payload)) items = payload;
      else if (Array.isArray(payload.data)) items = payload.data;
      else if (Array.isArray(payload.invoices)) items = payload.invoices;
      else if (payload && typeof payload === "object") items = [payload];

      const mapped: Invoice[] = items.map((it: any, idx: number) => ({
        id: String(it.id ?? it._id ?? it.invoiceNumber ?? idx),
        invoiceNumber: it.invoiceNumber ?? it.number ?? `INV-${idx + 1}`,
        vendor: it.vendor ?? it.supplier ?? "Unknown",
        amount: Number(it.amount ?? 0),
        date: it.date ? (new Date(it.date) as any) : (new Date() as any),
        status: it.status ?? "pending",
        discrepancyReasons: Array.isArray(it.discrepancyReasons)
          ? it.discrepancyReasons
          : Array.isArray(it.discrepancies)
          ? it.discrepancies
          : [],
        logs: it.logs ?? it.notes ?? "",
      }));

      setInvoices(mapped);
      setError(null);
      if (timeoutId) clearTimeout(timeoutId);
    } catch (err: any) {
      console.error("Failed to fetch invoices:", err);
      if (err?.name === "AbortError") {
        setError("Request aborted or timed out");
      } else {
        setError(err?.message ?? "Failed to fetch invoices");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchInvoices(controller.signal);
    return () => controller.abort();
  }, [fetchInvoices]);

  const refetch = () => fetchInvoices();

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
      <Stack spacing={2} sx={{ mt: 2 }}>
        {false && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load invoices: {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={invoices}
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
        )}
      </Stack>

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
