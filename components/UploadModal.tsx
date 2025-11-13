"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>(
    { open: false, message: "", severity: "success" }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    } else {
      setFiles([]);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    const endpoint = "https://nxt24philippines2.app.n8n.cloud/webhook-test/upload-files";
    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    try {
      setUploading(true);
      await fetch(endpoint, {
        method: "POST",
        body: form,
      })
        .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Upload failed: ${res.status} ${text}`);
            }
            const uploaded = await res.json(); // expected array of { Location, key }

            // Map uploaded to required model: [{ invoice: { invoiceUrl, invoiceDescription } }, ...]
            const payload = uploaded.map((u: any) => ({
              invoice: {
              invoiceUrl: u.Location,
              invoiceDescription: u.key,
              },
            }));

            const processEndpoint = "https://nxt24philippines2.app.n8n.cloud/webhook-test/invoice-processing";
            const procRes = await fetch(processEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!procRes.ok) {
              const txt = await procRes.text();
              throw new Error(`Processing failed: ${procRes.status} ${txt}`);
            }

            // return uploaded;
          setSnackbar({ open: true, message: "Files uploaded successfully.", severity: "success" });
          setFiles([]);
          onClose();
        });
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message || "Upload failed", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload File(s)</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Upload files to begin reconciliation. Allowed types: PDF, images, Word (.doc/.docx), Excel, CSV.
            You can select multiple files.
          </Typography>

          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 1,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": { borderColor: "#999" },
            }}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.csv"
              style={{ display: "none" }}
              id="file-input"
              multiple
            />
            <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: "action.disabled", mb: 1 }} />
              <Typography variant="body2">
                {files && files.length > 0 ? `${files.length} file(s) selected` : "Click to select files or drag and drop"}
              </Typography>
            </label>
            {files && files.length > 0 && (
              <List dense>
                {files.map((f, idx) => (
                  <ListItem key={idx} sx={{ pl: 0 }}>
                    <ListItemText primary={f.name} secondary={`${(f.size / 1024).toFixed(1)} KB`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
        <Button onClick={handleUpload} variant="contained" disabled={uploading || files.length === 0}>
          {uploading ? <><CircularProgress size={16} sx={{ mr: 1 }} />Uploading...</> : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
   );
}
