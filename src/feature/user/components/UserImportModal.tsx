import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { FileDropzone } from "@ui/file-dropzone";
import { FormField } from "@ui/form-field";
import { Input } from "@ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import type { UserStoreFormInput } from "../schemas/user";

const FIXED_COLUMNS = [
  "fullname",
  "email",
  "phone",
  "number_id",
  "birth_date",
  "gender",
  "role",
] as const;

const REQUIRED_COLUMNS: readonly string[] = ["fullname", "email", "role"];

export const COLUMN_TO_FIELD: Record<string, string> = {
  fullname: "name",
  email: "email",
  phone: "phone_number",
  number_id: "number",
  birth_date: "birth_date",
  gender: "gender",
  role: "role",
};

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

interface UserImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (rows: UserStoreFormInput[]) => void;
}

interface ParsedRow {
  [key: string]: string | number | boolean | null;
}

export function UserImportModal({ open, onClose, onImport: _onImport }: UserImportModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const parsedDataRef = useRef<ParsedRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [fromRow, setFromRow] = useState(1);
  const [toRow, setToRow] = useState(100);
  const [rangeError, setRangeError] = useState<string | undefined>();

  const validateRange = useCallback((from: number, to: number): string | undefined => {
    if (from < 1 || to < from || to - from + 1 > 100) {
      return "userImport.invalidRange";
    }
    return undefined;
  }, []);

  const resetState = useCallback(() => {
    setStep(1);
    setFile(null);
    setFileError(undefined);
    parsedDataRef.current = [];
    setRowCount(0);
    setFromRow(1);
    setToRow(100);
    setRangeError(undefined);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleFileChange = useCallback(
    (selected: File | null) => {
      if (!selected) {
        setFile(null);
        setFileError(undefined);
        return;
      }

      const ext = `.${selected.name.split(".").pop()?.toLowerCase()}`;
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(t("userImport.invalidExtension"));
        return;
      }

      setFileError(undefined);
      setFile(selected);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            setFileError(t("userImport.parseError"));
            return;
          }
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: null });
          if (json.length === 0) {
            setFileError(t("userImport.parseError"));
            return;
          }
          parsedDataRef.current = json;
          setRowCount(json.length);
          setFromRow(1);
          setToRow(Math.min(json.length, 100));
          setRangeError(undefined);
          setStep(2);
        } catch {
          setFileError(t("userImport.parseError"));
        }
      };
      reader.onerror = () => {
        setFileError(t("userImport.parseError"));
      };
      reader.readAsArrayBuffer(selected);
    },
    [t],
  );

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("userImport.title")}</DialogTitle>
          <DialogDescription>{t("userImport.description")}</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <FileDropzone
              file={file}
              onChange={handleFileChange}
              accept={ALLOWED_EXTENSIONS.join(",")}
              icon={Upload}
              emptyLabel={t("userImport.supportedFormats")}
              hint={t("fileDropzone.dragDrop")}
              error={fileError}
            />

            <div>
              <p className="mb-2 text-sm font-medium text-navy">
                {t("userImport.exampleTable.title")}
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {FIXED_COLUMNS.map((col) => (
                        <TableHead key={col} className="whitespace-nowrap">
                          {t(`userImport.column.${col}`)}
                          {REQUIRED_COLUMNS.includes(col) && (
                            <span className="ml-0.5 text-error">*</span>
                          )}
                        </TableHead>
                      ))}
                      <TableHead className="whitespace-nowrap">department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {EXAMPLE_ROWS.map((row, idx) => (
                      <TableRow key={idx}>
                        {FIXED_COLUMNS.map((col) => (
                          <TableCell key={col} className="text-sm text-gray-600">
                            {row[col] ?? ""}
                          </TableCell>
                        ))}
                        <TableCell className="text-sm text-gray-600">
                          {row.department ?? ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-2 text-xs text-gray-400">{t("userImport.metaHint")}</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-navy">
              {t("userImport.rowsFound", { count: rowCount })}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={t("userImport.fromRow")} error={rangeError}>
                <Input
                  type="number"
                  min={1}
                  value={fromRow}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFromRow(val);
                    setRangeError(validateRange(val, toRow));
                  }}
                />
              </FormField>

              <FormField label={t("userImport.toRow")}>
                <Input
                  type="number"
                  min={1}
                  value={toRow}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setToRow(val);
                    setRangeError(validateRange(fromRow, val));
                  }}
                />
              </FormField>
            </div>

            <p className="text-xs text-gray-400">{t("userImport.maxRows")}</p>

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setRangeError(undefined);
                }}
              >
                {t("userImport.back")}
              </Button>
              <Button
                variant="primary"
                disabled={!!rangeError}
                onClick={() => setStep(3)}
              >
                {t("userImport.continue")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const EXAMPLE_ROWS: readonly Record<string, string>[] = [
  {
    fullname: "Alice Johnson",
    email: "alice@example.com",
    phone: "+6281234567890",
    number_id: "EMP-001",
    birth_date: "1995-03-15",
    gender: "female",
    role: "holder",
    department: "Engineering",
  },
  {
    fullname: "Bob Smith",
    email: "bob@example.com",
    phone: "+6289876543210",
    number_id: "EMP-002",
    birth_date: "1990-07-22",
    gender: "male",
    role: "issuer",
    department: "Finance",
  },
] as const;
