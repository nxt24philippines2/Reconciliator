import React from "react";

export default function ReconcilePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Reconcile</h1>

      <div className="bg-white p-6 rounded-md shadow-sm dark:bg-[#0b0b0b]">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Start a reconciliation job, view matches and exceptions.
        </p>

        <button className="rounded-full bg-foreground px-4 py-2 text-background">Start Reconcile</button>
      </div>
    </div>
  );
}
