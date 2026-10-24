import { FileText, UploadCloud, X } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useResume } from "../hooks/useResume";

export function ResumeUpload({ disabled = false }: { disabled?: boolean }) {
  const { file, setFile } = useResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  function accept(next?: File) {
    if (!next) return;
    const ext = next.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "docx"].includes(ext)) { setError("Choose a PDF or DOCX file."); return; }
    if (next.size > 15 * 1024 * 1024) { setError("Choose a file smaller than 15 MB."); return; }
    setError(""); setFile(next);
  }
  function handleChange(event: ChangeEvent<HTMLInputElement>) { accept(event.target.files?.[0]); event.target.value = ""; }
  function handleDrop(event: DragEvent<HTMLButtonElement>) { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files[0]); }
  return <div>
    {file ? <div className="file-selected"><span className="file-icon"><FileText size={19} /></span><span className="file-meta"><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB · kept in this tab only</small></span><button type="button" className="icon-button" aria-label="Remove selected resume" disabled={disabled} onClick={() => setFile(null)}><X size={17} /></button></div> :
      <button type="button" className={`upload-zone ${dragging ? "upload-drag" : ""}`} disabled={disabled} onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
        <span className="upload-glyph"><UploadCloud size={22} /></span><strong>Drop your resume here or browse</strong><small>PDF or DOCX · Maximum 15 MB</small>
      </button>}
    <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={handleChange} />
    {error && <p className="field-error" role="alert">{error}</p>}
  </div>;
}
