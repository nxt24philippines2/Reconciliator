/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { InvoiceData } from "./models";

// Sample invoice data (in a real app, this would come from a database or API)
const invoiceDatabase: Record<string, any> = {
  "INV-001": {
    invoiceNumber: "INV-001",
    vendor: "Acme Corp",
    amount: 1500.0,
    date: "2025-11-01",
    status: "matched",
    discrepancyReasons: [],
    logs: "Invoice matched successfully",
    description: "Office supplies and equipment",
    poNumber: "PO-2025-001",
    dueDate: "2025-11-15",
  },
  "INV-002": {
    invoiceNumber: "INV-002",
    vendor: "Tech Solutions",
    amount: 2500.0,
    date: "2025-11-02",
    status: "mismatch",
    discrepancyReasons: [
      {
        discrepancyField: "amount",
        discrepancyType: "value_mismatch",
        discrepancyReason: "Expected 2500.00, found 2450.00",
      },
    ],
    logs: "Amount mismatch detected during reconciliation",
    description: "Software licenses and IT services",
    poNumber: "PO-2025-002",
    dueDate: "2025-11-20",
  },
  "INV-003": {
    invoiceNumber: "INV-003",
    vendor: "Global Supplies",
    amount: 750.5,
    date: "2025-11-03",
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
    description: "Shipping and logistics services",
    poNumber: "PO-2025-003",
    dueDate: "2025-11-25",
  },
  "INV-004": {
    invoiceNumber: "INV-004",
    vendor: "Office Depot",
    amount: 320.0,
    date: "2025-11-04",
    status: "matched",
    discrepancyReasons: [],
    logs: "Reconciliation completed",
    description: "Office furniture and supplies",
    poNumber: "PO-2025-004",
    dueDate: "2025-11-18",
  },
  "INV-005": {
    invoiceNumber: "INV-005",
    vendor: "Energy Inc",
    amount: 3200.75,
    date: "2025-11-05",
    status: "exception",
    discrepancyReasons: [
      {
        discrepancyField: "taxAmount",
        discrepancyType: "calculation_error",
        discrepancyReason: "Tax calculation differs from PO",
      },
    ],
    logs: "Manual review required - escalated to finance",
    description: "Utility services and maintenance",
    poNumber: "PO-2025-005",
    dueDate: "2025-11-30",
  },
};

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

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceNumber = params.invoiceNumber as string;
  // const invoice = invoiceDatabase[invoiceNumber];
  const [invoiceData, setInvoiceData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://nxt24philippines2.app.n8n.cloud/webhook-test/invoice?q=${invoiceNumber}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setInvoiceData(new InvoiceData(data[0]));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch invoice"
        );
      } finally {
        setLoading(false);
      }
    };

    if (invoiceNumber) {
      fetchInvoice();
    }
  }, [invoiceNumber]);

  // Use fetched data instead of static database
  const invoice = invoiceData || invoiceDatabase[invoiceNumber];

  if (loading) {
    return (
      <Box sx={{ maxWidth: "900px", mx: "auto", py: 4, textAlign: "center" }}>
        <Typography>Loading invoice...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: "900px", mx: "auto", py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5" color="error">
          Error loading invoice: {error}
        </Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ maxWidth: "900px", mx: "auto", py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5" color="error">
          Invoice not found: {invoiceNumber}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "900px", mx: "auto", py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 4 }}
      >
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            Invoice Details
          </Typography>
          <Chip
            label={invoice.status}
            color={getStatusColor(invoice.status) as any}
            variant="outlined"
            sx={{ fontSize: "1rem", py: 3 }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 3,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Invoice Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
              {invoice.invoiceNumber}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary">
              Vendor
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
              {invoice.vendor}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary">
              PO Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
              {invoice.poNumber}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Amount
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
              ${invoice.amount?.toFixed(2)}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary">
              Invoice Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
              {invoice.date}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary">
              Due Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
              {invoice.dueDate}
            </Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
          Description
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 4, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}
        >
          {invoice.description}
        </Typography>

        {invoice.discrepancyReasons &&
          invoice.discrepancyReasons.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                Discrepancies
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell>Field</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.discrepancyReasons.map((d: any, idx: number) => (
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
            </>
          )}

        <Typography variant="h6" sx={{ mb: 2 }}>
          Logs
        </Typography>
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
          {invoice.logs}
        </Box>
      </Paper>
    </Box>
  );
}
