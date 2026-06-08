import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Search,
  CheckCheck,
  RefreshCw,
  FileText,
  Send,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notificaciones · Gestor de Folios 3.0" },
      {
        name: "description",
        content:
          "Centro de notificaciones del Gestor de Folios 3.0: alertas críticas, advertencias y eventos de folios y rangos primarios.",
      },
    ],
  }),
  component: NotificacionesPage,
});

type Severity = "critico" | "advertencia" | "informativo" | "exito";

type Notification = {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  docType: string; // e.g. "Factura afecta (33)"
  timestamp: string;
  read?: boolean;
  action?: { label: string; variant?: "primary" | "outline"; icon?: React.ReactNode };
};

const SEVERITY_META: Record<
  Severity,
  { label: string; Icon: typeof Info; ring: string; iconBg: string; iconColor: string; pill: string }
> = {
  critico: {
    label: "Crítico",
    Icon: XCircle,
    ring: "border-l-critical",
    iconBg: "bg-critical-soft",
    iconColor: "text-critical",
    pill: "bg-critical-soft text-critical border border-critical/20",
  },
  advertencia: {
    label: "Advertencia",
    Icon: AlertTriangle,
    ring: "border-l-warning",
    iconBg: "bg-warning-soft",
    iconColor: "text-warning",
    pill: "bg-warning-soft text-warning-foreground border border-warning/30",
  },
  informativo: {
    label: "Informativo",
    Icon: Info,
    ring: "border-l-info",
    iconBg: "bg-info-soft",
    iconColor: "text-info",
    pill: "bg-info-soft text-info border border-info/20",
  },
  exito: {
    label: "Éxito",
    Icon: CheckCircle2,
    ring: "border-l-success",
    iconBg: "bg-success-soft",
    iconColor: "text-success",
    pill: "bg-success-soft text-success border border-success/20",
  },
};

const MOCK: Notification[] = [
  {
    id: "1",
    severity: "critico",
    title: "Facturador sin rango primario asignado",
    description:
      'Facturador "Comercial Andes SpA" no tiene un rango primario asignado. No podrá emitir documentos hasta resolverlo.',
    docType: "Facturador",
    timestamp: "Hace 10 min",
    action: { label: "Asignar Rango", variant: "primary", icon: <Plus className="h-4 w-4" /> },
  },
  {
    id: "2",
    severity: "critico",
    title: "Rango primario VENCIDO",
    description:
      "El rango primario para Factura afecta (33) venció el 30-11-2023. Solicita un nuevo rango al SII para continuar operando.",
    docType: "Factura afecta (33)",
    timestamp: "Hace 35 min",
    action: { label: "Solicitar al SII", variant: "outline", icon: <Send className="h-4 w-4" /> },
  },
  {
    id: "3",
    severity: "critico",
    title: "Descarga automática FALLIDA",
    description:
      "La descarga automática para Boleta afecta (39) falló. Error de conexión con SII. Verifica el estado del servicio.",
    docType: "Boleta afecta (39)",
    timestamp: "Hoy, 09:12",
    action: { label: "Reintentar", variant: "primary", icon: <RefreshCw className="h-4 w-4" /> },
  },
  {
    id: "4",
    severity: "advertencia",
    title: "Rango primario por vencer",
    description:
      "El rango primario para Factura afecta (33) vence el 15-07-2026. Planifica la solicitud de un nuevo rango.",
    docType: "Factura afecta (33)",
    timestamp: "Hoy, 08:40",
  },
  {
    id: "5",
    severity: "advertencia",
    title: "Rango primario por completarse",
    description:
      "Se ha consumido el 90% del rango primario para Factura electrónica. Folio disponible hasta: 19500.",
    docType: "Factura electrónica (33)",
    timestamp: "Ayer, 18:22",
  },
  {
    id: "6",
    severity: "exito",
    title: "Descarga automática EXITOSA",
    description:
      "Se descargaron correctamente los folios para Factura afecta (33) desde el SII.",
    docType: "Factura afecta (33)",
    timestamp: "Ayer, 14:30",
    read: true,
  },
  {
    id: "7",
    severity: "exito",
    title: "Carga manual exitosa",
    description:
      "Se cargó manualmente el rango primario para Tipo de Documento (33) sin incidencias.",
    docType: "Factura afecta (33)",
    timestamp: "Ayer, 11:05",
    read: true,
  },
  {
    id: "8",
    severity: "informativo",
    title: "Subrango devuelto al GF3.0",
    description:
      "Subrango devuelto al GF3.0 para Boleta (39). Folios: Desde 19502 Hasta 20000.",
    docType: "Boleta afecta (39)",
    timestamp: "Lun, 16:48",
    read: true,
  },
];

const DOC_TYPES = [
  "Todos",
  "Facturador",
  "Factura afecta (33)",
  "Factura electrónica (33)",
  "Boleta afecta (39)",
];

const TABS = ["Facturadores", "Rangos Primarios", "Umbrales para Recarga", "Notificaciones"];

function NotificacionesPage() {
  const [items, setItems] = useState<Notification[]>(MOCK);
  const [doc, setDoc] = useState("Todos");
  const [sev, setSev] = useState<"todos" | Severity>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (doc !== "Todos" && n.docType !== doc) return false;
      if (sev !== "todos" && n.severity !== sev) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [items, doc, sev, query]);

  const unread = items.filter((i) => !i.read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-6">
        {/* Tabs */}
        <nav
          aria-label="Secciones"
          className="flex items-center gap-8 border-b border-border bg-panel/60 rounded-t-lg px-4"
        >
          {TABS.map((t) => {
            const active = t === "Notificaciones";
            return (
              <button
                key={t}
                className={cn(
                  "relative py-4 text-sm font-semibold transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Notificaciones
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unread > 0
                ? `Tienes ${unread} notificación${unread === 1 ? "" : "es"} sin leer.`
                : "Estás al día con tus notificaciones."}
            </p>
          </div>
        </header>

        {/* Filter bar */}
        <section className="bg-panel border border-border rounded-xl p-4 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Tipo de Documento
              </label>
              <Select value={doc} onValueChange={setDoc}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Severidad
              </label>
              <Select value={sev} onValueChange={(v) => setSev(v as typeof sev)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="advertencia">Advertencia</SelectItem>
                  <SelectItem value="informativo">Informativo</SelectItem>
                  <SelectItem value="exito">Éxito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-[1.4] min-w-[240px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título o descripción…"
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            <div className="self-end">
              <Button
                onClick={markAllRead}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como leídas
              </Button>
            </div>
          </div>
        </section>

        {/* Notification list */}
        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-panel border border-border rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No hay notificaciones que coincidan con los filtros.
              </p>
            </div>
          ) : (
            filtered.map((n) => <NotificationCard key={n.id} n={n} />)
          )}
        </section>
      </div>
    </main>
  );
}

function NotificationCard({ n }: { n: Notification }) {
  const meta = SEVERITY_META[n.severity];
  const Icon = meta.Icon;

  return (
    <article
      className={cn(
        "bg-panel border border-border rounded-xl shadow-sm border-l-4 p-4 sm:p-5 transition-all hover:shadow-md",
        meta.ring,
        !n.read && "ring-1 ring-primary/5",
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
            meta.iconBg,
          )}
        >
          <Icon className={cn("h-5 w-5", meta.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                {n.title}
              </h3>
              <Badge
                variant="outline"
                className={cn("rounded-full text-[11px] font-medium px-2 py-0.5", meta.pill)}
              >
                {meta.label}
              </Badge>
              {!n.read && (
                <span className="h-2 w-2 rounded-full bg-primary" aria-label="No leído" />
              )}
            </div>
            <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {n.timestamp}
            </time>
          </div>

          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {n.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>{n.docType}</span>
            </div>

            {n.action && (
              <Button
                size="sm"
                variant={n.action.variant === "outline" ? "outline" : "default"}
                className={cn(
                  "gap-2",
                  n.action.variant === "outline" &&
                    "border-primary/40 text-primary hover:bg-primary/5 hover:text-primary",
                )}
              >
                {n.action.icon}
                {n.action.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
