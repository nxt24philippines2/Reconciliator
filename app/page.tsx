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
        <div className="flex gap-5 items-center">
        <img src="/media/ambrlogo.png" alt="Ambr Logo" className="h-10"/>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
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
