// src/components/CreateMultipleChoiceTestButton.jsx
import React, { useState } from "react";
import CreateMultipleChoiceTestModal from "./CreateMultipleChoiceTestModal"; // đường dẫn bạn đang dùng

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default function CreateMultipleChoiceTestButton({ label = "Tạo Multiple Choice" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        type="button"
      >
        <PlusIcon />
        {label}
      </button>

      <CreateMultipleChoiceTestModal show={open} onClose={() => setOpen(false)} />
    </>
  );
}
