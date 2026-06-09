import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronUp, Mail, X, Plus } from "lucide-react";

const TABS = ["Facturadores", "Rangos Primarios", "Umbrales para Recarga", "Notificaciones", "Configuraciones"];
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración de Notificaciones · Gestor de Folios 3.0" },
      {
        name: "description",
        content:
          "Configura los umbrales de alertas y los destinatarios de notificaciones xPOS del Gestor de Folios 3.0.",
      },
    ],
  }),
  component: ConfiguracionPage,
});

type DocRow = {
  id: string;
  doc: string;
  days: number;
  pct: number;
};

const DEFAULT_ROWS: DocRow[] = [
  { id: "33", doc: "Factura afecta (33)", days: 15, pct: 90 },
  { id: "39", doc: "Boleta afecta (39)", days: 10, pct: 85 },
];

function ConfiguracionPage() {
  const [rows, setRows] = useState<DocRow[]>(DEFAULT_ROWS);
  const [emails, setEmails] = useState<string[]>([
    "admin@empresa.com",
    "soporte@gosocket.net",
    "contabilidad@gosocket.net",
  ]);
  const [collapsed, setCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const updateRow = (id: string, field: "days" | "pct", value: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Configuración de Notificaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define los umbrales de alertas y los destinatarios de las
            comunicaciones xPOS.
          </p>
        </header>

        {/* TOP CARD: Umbrales */}
        <section className="bg-panel border border-border rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              Umbrales y Reglas de Alertas por Tipo de Documento
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configura los disparadores de alertas de forma independiente para
              cada tipo de documento.
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[34%] font-semibold text-foreground">
                    Tipo de Documento
                  </TableHead>
                  <TableHead className="w-[33%] font-semibold text-foreground">
                    Días de Anticipación (Vencimiento)
                  </TableHead>
                  <TableHead className="w-[33%] font-semibold text-foreground">
                    Porcentaje de Consumo (Folios por Completarse)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="align-top py-5">
                      <span className="text-sm font-medium text-foreground">
                        {r.doc}
                      </span>
                    </TableCell>
                    <TableCell className="align-top py-5">
                      <Input
                        type="number"
                        min={0}
                        value={r.days}
                        onChange={(e) =>
                          updateRow(r.id, "days", Number(e.target.value))
                        }
                        className="max-w-[180px] bg-background"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Días antes de expirar
                      </p>
                    </TableCell>
                    <TableCell className="align-top py-5">
                      <div className="relative max-w-[180px]">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={r.pct}
                          onChange={(e) =>
                            updateRow(r.id, "pct", Number(e.target.value))
                          }
                          className="bg-background pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Umbral de consumo crítico
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end px-6 py-4 border-t border-border">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar Umbrales
            </Button>
          </div>
        </section>

        {/* BOTTOM CARD: Comunicaciones */}
        <section className="bg-panel border border-border rounded-xl shadow-sm">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-between px-6 py-4 border-b border-border"
          >
            <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
              Comunicaciones
            </span>
            <ChevronUp
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </button>

          {!collapsed && (
            <div className="px-6 py-5 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-foreground max-w-2xl">
                  Ingresar los correos electrónicos de las personas que serán
                  informadas con noticias xPOS.
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#F59000] hover:bg-[#D97D00] text-white gap-2 shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  Correos electrónicos
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {emails.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center gap-2 bg-muted text-foreground text-sm rounded-full pl-3 pr-1.5 py-1 border border-border"
                  >
                    {e}
                    <button
                      type="button"
                      onClick={() =>
                        setEmails((prev) => prev.filter((x) => x !== e))
                      }
                      className="h-5 w-5 rounded-full grid place-content-center text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                      aria-label={`Quitar ${e}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <EmailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        emails={emails}
        setEmails={setEmails}
      />
    </main>
  );
}

function EmailsModal({
  open,
  onOpenChange,
  emails,
  setEmails,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  emails: string[];
  setEmails: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(emails);
  const [input, setInput] = useState("");

  // sync draft when reopened
  const handleOpenChange = (v: boolean) => {
    if (v) setDraft(emails);
    onOpenChange(v);
  };

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return;
    if (draft.includes(v)) return;
    setDraft((prev) => [...prev, v]);
    setInput("");
  };

  const save = () => {
    setEmails(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Destinatarios de Notificaciones xPOS</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="correo@empresa.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <Button
              type="button"
              onClick={add}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {draft.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay destinatarios.
              </p>
            ) : (
              draft.map((e) => (
                <span
                  key={e}
                  className="inline-flex items-center gap-2 bg-muted text-foreground text-sm rounded-full pl-3 pr-1.5 py-1 border border-border"
                >
                  {e}
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => prev.filter((x) => x !== e))
                    }
                    className="h-5 w-5 rounded-full grid place-content-center text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                    aria-label={`Quitar ${e}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button
            onClick={save}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
