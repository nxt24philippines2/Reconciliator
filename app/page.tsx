"use client";

import React, { useState } from "react";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadModal from "../components/UploadModal";
import InvoiceTable from "../components/InvoiceTable";

export default function Home() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Reconciliation Dashboard</h1>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setUploadModalOpen(true)}
        >
          Upload File
        </Button>
      </div>

      <InvoiceTable />

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
