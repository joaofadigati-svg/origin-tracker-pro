import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Plus,
  Search,
  Trash2,
  Tag,
  X,
  Youtube,
  Users,
  Radio,
  Tv2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAGS E ORIGENS — Claw Express" },
      { name: "description", content: "Central interna de tags e origens da Claw Express." },
    ],
  }),
  component: Dashboard,
});

// ---------- Types ----------
type Quality = "ALTA" | "MEDIA" | "BAIXA" | "BANIDO";
type ProductKind = "FGTS" | "CLT" | "CarEquity" | "Geral";
type Toggle = "PENDENTE" | "ADICIONADO";

interface ProductRow {
  id: string;
  kind: ProductKind;
  originIA: string;
  originCorban: string;
  link: string;
  number: string;
  quality: Quality;
  phrase: string;
}

interface PartnerCard {
  id: string;
  name: string;
  code: string;
  statusIA: Toggle;
  statusCorban: Toggle;
  products: ProductRow[];
}

interface YoutubeRow {
  id: string;
  date: string;
  tagIA: string;
  originCorban: string;
  statusIA: Toggle;
  statusCorban: Toggle;
  clawinLink: string;
  videoLink: string;
  number: string;
  quality: Quality;
  phrase: string;
}

type VsType = "DEDICADO" | "SPOT";
interface VsRow {
  id: string;
  type: VsType;
  videoLink: string;
  tagIA: string;
  originCorban: string;
  statusIA: Toggle;
  statusCorban: Toggle;
  bitlyGabe: string;
  bitlyFadigati: string;
  number: string;
  quality: Quality;
  phrase: string;
  configured: boolean;
}
interface VsGroup {
  id: string;
  label: string;
  rows: VsRow[];
}

// ---------- Utils ----------
const uid = () => Math.random().toString(36).slice(2, 10);

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

const QUALITY_META: Record<Quality, { label: string; dot: string; text: string; pill: string }> = {
  ALTA: {
    label: "ALTA",
    dot: "bg-success",
    text: "text-success",
    pill: "border-success/30 bg-success/10 text-success",
  },
  MEDIA: {
    label: "MÉDIA",
    dot: "bg-warning",
    text: "text-warning",
    pill: "border-warning/30 bg-warning/10 text-warning",
  },
  BAIXA: {
    label: "BAIXA",
    dot: "bg-danger",
    text: "text-danger",
    pill: "border-danger/30 bg-danger/10 text-danger",
  },
  BANIDO: {
    label: "BANIDO",
    dot: "bg-banned",
    text: "text-muted-foreground line-through",
    pill: "border-border bg-muted/40 text-muted-foreground line-through",
  },
};

const PRODUCT_META: Record<ProductKind, { label: string; bg: string }> = {
  FGTS: { label: "FGTS", bg: "bg-product-fgts/15 text-product-fgts border-product-fgts/30" },
  CLT: { label: "CLT", bg: "bg-product-clt/15 text-product-clt border-product-clt/30" },
  CarEquity: { label: "CarEquity", bg: "bg-product-carequity/15 text-product-carequity border-product-carequity/30" },
  Geral: { label: "Geral", bg: "bg-product-geral/20 text-muted-foreground border-product-geral/40" },
};

// ---------- Small components ----------
function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={label ?? "Copiar"}
      onClick={(e) => {
        e.stopPropagation();
        if (!value) return;
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-all duration-150",
        done
          ? "border-success/50 bg-success/15 text-success scale-95"
          : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground",
      )}
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function Editable({
  value,
  onChange,
  placeholder,
  className,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "min-w-0 truncate rounded px-1.5 py-0.5 text-left transition-colors hover:bg-accent/50",
          !value && "italic text-muted-foreground/50",
          className,
        )}
        title="Clique para editar"
      >
        {value || placeholder || "—"}
      </button>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        rows={3}
        className={cn(
          "w-full rounded-md border border-primary/50 bg-input/80 px-2 py-1.5 text-sm outline-none ring-1 ring-primary/30 focus:border-primary focus:ring-primary/50",
          className,
        )}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={cn(
        "w-full rounded-md border border-primary/50 bg-input/80 px-2 py-1 text-sm outline-none ring-1 ring-primary/30 focus:border-primary focus:ring-primary/50",
        className,
      )}
    />
  );
}

function QualityBadge({ value, onChange }: { value: Quality; onChange: (q: Quality) => void }) {
  const meta = QUALITY_META[value];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80",
            meta.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {(Object.keys(QUALITY_META) as Quality[]).map((q) => (
          <DropdownMenuItem key={q} onClick={() => onChange(q)} className="text-xs">
            <span className={cn("mr-2 h-2 w-2 rounded-full", QUALITY_META[q].dot)} />
            {QUALITY_META[q].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NumberCell({
  number,
  quality,
  onNumber,
  onQuality,
}: {
  number: string;
  quality: Quality;
  onNumber: (v: string) => void;
  onQuality: (q: Quality) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-xs tabular-nums">
        <Editable value={number} onChange={onNumber} placeholder="5548XXXXXXXX" />
      </span>
      <CopyBtn value={number} />
      <QualityBadge value={quality} onChange={onQuality} />
    </div>
  );
}

function StatusChip({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Toggle;
  onChange: (v: Toggle) => void;
}) {
  const active = value === "ADICIONADO";
  return (
    <button
      type="button"
      onClick={() => onChange(active ? "PENDENTE" : "ADICIONADO")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all",
        active
          ? "border-success/40 bg-success/12 text-success shadow-sm shadow-success/10"
          : "border-border/60 bg-secondary/50 text-muted-foreground hover:border-border hover:bg-secondary",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors",
          active ? "bg-success shadow-sm shadow-success/50" : "bg-muted-foreground/40",
        )}
      />
      {label}
      <span className="font-normal normal-case tracking-normal opacity-80">
        {active ? "✓" : "—"}
      </span>
    </button>
  );
}

function ExpandablePhrase({
  phrase,
  onChange,
}: {
  phrase: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {open ? "ocultar" : "ver frase"}
        </button>
        {phrase && <CopyBtn value={phrase} label="Copiar frase" />}
      </div>
      {open && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-2">
          <Editable
            value={phrase}
            onChange={onChange}
            multiline
            placeholder="Frase do WhatsApp..."
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
}

function LinkCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);
  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (editing) {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          placeholder="https://..."
          className="w-full min-w-0 flex-1 rounded-md border border-primary/50 bg-input/80 px-2 py-1 text-xs text-primary outline-none ring-1 ring-primary/30"
        />
        <CopyBtn value={value} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          title={value}
          className="inline-flex h-6 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:border-primary/50 hover:bg-primary/20"
        >
          <ExternalLink className="h-3 w-3" />
          LINK
        </a>
      ) : (
        <span className="inline-flex h-6 cursor-not-allowed items-center rounded-md border border-dashed border-border/40 bg-muted/20 px-2 text-[10px] font-semibold text-muted-foreground/40">
          sem link
        </span>
      )}
      <CopyBtn value={value} />
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-[10px] text-muted-foreground/60 transition-colors hover:text-primary hover:underline"
      >
        editar
      </button>
    </div>
  );
}

// ---------- Seed data ----------
const seedPartners: PartnerCard[] = [
  {
    id: uid(), name: "Eduarda", code: "I01", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "FGTS", originIA: "[I01]", originCorban: "Indicação 01", link: "https://claw.express/fgtseduarda", number: "554831970749", quality: "ALTA", phrase: "[I01] Olá! Vim pela indicação da Eduarda e gostaria de mais informações sobre o FGTS!" },
      { id: uid(), kind: "CLT", originIA: "[I01]", originCorban: "Indicação 01", link: "https://claw.express/clteduarda", number: "554831970749", quality: "ALTA", phrase: "[I01] Olá! Vim pela indicação da Eduarda e gostaria de mais informações sobre o Consignado CLT!" },
      { id: uid(), kind: "CarEquity", originIA: "[I01]", originCorban: "Indicação 01", link: "https://claw.express/carequityeduarda", number: "554831975734", quality: "ALTA", phrase: "[I01] Olá! Vim pela indicação da Eduarda e gostaria de mais informações sobre o empréstimo com garantia do meu veículo!" },
    ],
  },
  {
    id: uid(), name: "Casal Money", code: "I02", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "Geral", originIA: "[I02]", originCorban: "Indicação 02", link: "https://claw.express/casalmoneyy", number: "554831975795", quality: "ALTA", phrase: "[I02] Olá! Vim pela indicação do Casal money e gostaria de mais informações." },
    ],
  },
  {
    id: uid(), name: "Jhonnatan Santiago", code: "I03", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "FGTS", originIA: "[I03]", originCorban: "Indicação 03", link: "https://claw.express/fgtsjhonnatan", number: "554831975795", quality: "ALTA", phrase: "[I03] Olá! Vim pela indicação do Jhonnatan Santiago e gostaria de mais informações sobre o FGTS!" },
      { id: uid(), kind: "CLT", originIA: "[I03]", originCorban: "Indicação 03", link: "https://claw.express/cltjhonnatan", number: "554831975795", quality: "ALTA", phrase: "[I03] Olá! Vim pela indicação do Jhonnatan Santiago e gostaria de mais informações sobre o Consignado CLT!" },
      { id: uid(), kind: "CarEquity", originIA: "[I03]", originCorban: "Indicação 03", link: "https://claw.express/carequityjhonnatan", number: "554831975734", quality: "ALTA", phrase: "[I03] Olá! Vim pela indicação do Jhonnatan Santiago e gostaria de mais informações sobre o empréstimo com garantia do meu veículo!" },
    ],
  },
  {
    id: uid(), name: "Andréia", code: "I04", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "FGTS", originIA: "[I04]", originCorban: "Indicação 04", link: "https://claw.express/andreia", number: "554831975795", quality: "ALTA", phrase: "[I04] Olá! Vim pela indicação da Andréia e gostaria de mais informações sobre crédito!" },
    ],
  },
  {
    id: uid(), name: "Anderson Costa", code: "I05", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "FGTS", originIA: "[I05]", originCorban: "Indicação 05", link: "https://claw.express/andersonfgts", number: "554831975795", quality: "ALTA", phrase: "[I05] Olá! Vim pela indicação do Anderson Costa e gostaria de mais informações sobre o FGTS!" },
      { id: uid(), kind: "CLT", originIA: "[I05]", originCorban: "Indicação 05", link: "https://claw.express/cltanderson", number: "554831975795", quality: "ALTA", phrase: "[I05] Olá! Vim pela indicação do Anderson Costa e gostaria de mais informações sobre o Consignado CLT!" },
      { id: uid(), kind: "CarEquity", originIA: "[I05]", originCorban: "Indicação 05", link: "https://claw.express/carequityanderson", number: "554831975734", quality: "ALTA", phrase: "[I05] Olá! Vim pela indicação do Anderson Costa e gostaria de mais informações sobre o empréstimo com garantia do meu veículo!" },
    ],
  },
  {
    id: uid(), name: "Figuras Cringe TV (Vini)", code: "I06", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "FGTS", originIA: "[I06]", originCorban: "Indicação 06", link: "https://claw.express/fgts-figurasvini", number: "554831975795", quality: "ALTA", phrase: "" },
      { id: uid(), kind: "CLT", originIA: "[I06]", originCorban: "Indicação 06", link: "https://claw.express/clt-figurasvini", number: "554831975795", quality: "ALTA", phrase: "" },
      { id: uid(), kind: "CarEquity", originIA: "[I06]", originCorban: "Indicação 06", link: "https://claw.express/carequity-figurasvini", number: "554831975734", quality: "ALTA", phrase: "" },
    ],
  },
  {
    id: uid(), name: "Radar Brasil / PC Dicas (Victor)", code: "I07", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "FGTS", originIA: "[I07]", originCorban: "Indicação 07", link: "https://claw.express/fgtspcdicas", number: "554831975795", quality: "ALTA", phrase: "" },
      { id: uid(), kind: "CLT", originIA: "[I07]", originCorban: "Indicação 07", link: "https://claw.express/cltpcdicas", number: "554831975795", quality: "ALTA", phrase: "" },
      { id: uid(), kind: "CarEquity", originIA: "[I07]", originCorban: "Indicação 07", link: "https://claw.express/carequitypcdicas", number: "554831975734", quality: "ALTA", phrase: "" },
    ],
  },
  {
    id: uid(), name: "Will Micael", code: "I08", statusIA: "PENDENTE", statusCorban: "PENDENTE",
    products: [
      { id: uid(), kind: "FGTS", originIA: "[I08]", originCorban: "Indicação 08", link: "https://claw.express/fgts-willmicael", number: "554831975795", quality: "ALTA", phrase: "" },
      { id: uid(), kind: "CLT", originIA: "[I08]", originCorban: "Indicação 08", link: "https://claw.express/clt-willmicael", number: "554831975795", quality: "ALTA", phrase: "" },
      { id: uid(), kind: "CarEquity", originIA: "[I08]", originCorban: "Indicação 08", link: "https://claw.express/carequity-willmicael", number: "554831975734", quality: "ALTA", phrase: "" },
    ],
  },
];

const seedCanais: PartnerCard[] = [
  { id: uid(), name: "Facebook da Claw", code: "FACE", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "Geral", originIA: "[FACE]", originCorban: "Vi isso no Facebook...", link: "https://claw.express/facebook", number: "554831975795", quality: "ALTA", phrase: "[FACE] Olá, vim pelo Facebook da Claw e quero mais informações." },
  ]},
  { id: uid(), name: "CLT Milgrau", code: "CLTMILGRAU", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[CLTMILGRAU]", originCorban: "CLTMILGRAU", link: "https://claw.express/cltmilgrau", number: "554831975795", quality: "ALTA", phrase: "[CLTMILGRAU] Olá! Vim pelo Instagram do CLTMILGRAU e gostaria de mais informações sobre crédito!" },
  ]},
  { id: uid(), name: "Site L1", code: "L1", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[L1]", originCorban: "Anuncio L1", link: "https://claw.express/l1", number: "554831975795", quality: "ALTA", phrase: "[L1] Olá! Vim pela indicação do site da Claw e gostaria de mais informações" },
  ]},
  { id: uid(), name: "Site L2", code: "L2", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[L2]", originCorban: "Anuncio L2", link: "https://claw.express/l2", number: "554831975795", quality: "ALTA", phrase: "[L2] Olá! Vim pela indicação do site da Claw e gostaria de mais informações sobre o FGTS" },
  ]},
  { id: uid(), name: "Blog Claw", code: "BLOG", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[BLOG]", originCorban: "Olá vim pelo Blog da Claw", link: "https://claw.express/blog", number: "554831970745", quality: "ALTA", phrase: "[BLOG] Olá! Vim pela indicação do Blog da Claw e gostaria de mais informações sobre o FGTS" },
  ]},
  { id: uid(), name: "YouTube Claw (Link Bio)", code: "YC", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "Geral", originIA: "[YC]", originCorban: "Olá vim pelo YouTube da Claw", link: "https://claw.express/youtube", number: "554831975795", quality: "ALTA", phrase: "[YC] Olá! Vim pela indicação do YouTube da Claw, e gostaria de mais informações." },
  ]},
  { id: uid(), name: "Instagram Claw (MC)", code: "MC", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "Geral", originIA: "[MC]", originCorban: "MC - Instagram Claw", link: "https://claw.express/mcdaclaw", number: "554831975795", quality: "ALTA", phrase: "[MC] Olá, vim pelo Instagram da Claw, e gostaria de mais informações" },
  ]},
  { id: uid(), name: "TikTok da Claw", code: "TKC", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[TKC]", originCorban: "TikTok Claw", link: "https://claw.express/fgtstktk", number: "554831975795", quality: "ALTA", phrase: "[TKC] Olá, vim pelo TikTok da Claw e gostaria de mais informações sobre o FGTS!" },
    { id: uid(), kind: "CLT", originIA: "[TKC]", originCorban: "TikTok Claw", link: "https://claw.express/clttktk", number: "554831975795", quality: "ALTA", phrase: "[TKC] Olá, vim pelo TikTok da Claw e gostaria de mais informações sobre o Consignado CLT!" },
    { id: uid(), kind: "CarEquity", originIA: "[TKC]", originCorban: "TikTok Claw", link: "https://claw.express/carequitytktk", number: "554831975734", quality: "ALTA", phrase: "[TKC] Olá, vim pelo TikTok da Claw e gostaria de mais informações sobre o empréstimo com garantia do meu veículo!" },
  ]},
  { id: uid(), name: "Instagram da Claw", code: "IGC", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "CLT", originIA: "[IGC]", originCorban: "Instagram Claw", link: "https://claw.express/cltigc", number: "554831970918", quality: "ALTA", phrase: "[IGC] Olá, vim pelo Instagram da Claw e quero saber mais sobre o Consignado CLT." },
    { id: uid(), kind: "FGTS", originIA: "[IGC]", originCorban: "Instagram Claw", link: "https://claw.express/fgtsigc", number: "554831970918", quality: "ALTA", phrase: "[IGC] Olá! Vim pelo Instagram da Claw e gostaria de mais informações sobre o FGTS" },
    { id: uid(), kind: "CarEquity", originIA: "[IGC]", originCorban: "Instagram Claw", link: "https://claw.express/carequityigc", number: "554831972791", quality: "ALTA", phrase: "[IGC] Olá! Vim pelo Instagram da Claw e gostaria de mais informações sobre o CarEquity!" },
  ]},
  { id: uid(), name: "PC Dicas", code: "PC", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[PC]", originCorban: "Olá vim pelo PC Dicas", link: "https://bit.ly/fgts-pcdicas", number: "554831970918", quality: "ALTA", phrase: "[PC] Olá, vim pelo Victor do PC dicas e gostaria de mais informações sobre o FGTS!" },
  ]},
  { id: uid(), name: "Atualizo", code: "ATUALIZO", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[ATUALIZO]", originCorban: "Olá vim pelo Atualizo", link: "https://bit.ly/fgts-clawexpress", number: "554831970918", quality: "ALTA", phrase: "[ATUALIZO] Olá! Vim pelo Atualizo e gostaria de mais informações sobre o FGTS!" },
  ]},
  { id: uid(), name: "Mundo dos Bancos", code: "MDB", statusIA: "PENDENTE", statusCorban: "PENDENTE", products: [
    { id: uid(), kind: "FGTS", originIA: "[MDB]", originCorban: "Olá vim pelo Mundo dos Bancos", link: "https://bit.ly/claw-express-fgts", number: "554831970918", quality: "ALTA", phrase: "[MDB] Olá! Vim pela indicação do Mundo dos Bancos e gostaria de mais informações sobre o FGTS!" },
  ]},
];

const seedYoutube: YoutubeRow[] = [
  ["12/03/25", "Y1", "https://claw.express/yt1", "https://www.youtube.com/watch?v=O9dYOfj5VxU&t=4s"],
  ["12/05/23", "Y2", "https://claw.express/yt2", "https://www.youtube.com/watch?v=me4UjUlcSoY"],
  ["15/05/23", "Y3", "https://claw.express/yt3", "https://www.youtube.com/watch?v=Rin09RbGkEY&t=4s"],
  ["10/07/23", "Y4", "https://claw.express/yt4", "https://www.youtube.com/watch?v=JJcxcM62Oew&t=4s"],
  ["31/07/23", "Y5", "https://claw.express/yt5", "https://www.youtube.com/watch?v=sNSZqFOE2Uc&t=4s"],
  ["05/10/23", "Y6", "https://claw.express/yt6", "https://www.youtube.com/watch?v=4tQBLecrFWw"],
  ["11/10/24", "Y7", "https://claw.express/yt7", "https://www.youtube.com/watch?v=ort_mz3pqLA&t=3s"],
  ["08/11/24", "Y8", "https://claw.express/yt8", "https://www.youtube.com/watch?v=tWUnXc0CED8&t=3s"],
  ["12/12/24", "Y9", "https://claw.express/yt9", "https://www.youtube.com/watch?v=ga7pS0qEFBw&t=4s"],
  ["07/01/25", "Y10", "https://claw.express/yt10", "https://www.youtube.com/watch?v=5RxHlbUE37w&t=5s"],
  ["02/04/25", "Y11", "https://claw.express/yt11", "https://www.youtube.com/watch?v=d3p5FTuo6K8&t=33s"],
  ["02/10/25", "Y12", "https://claw.express/yt12", "https://www.youtube.com/watch?v=fNLEXa5Z83E&t=2s"],
  ["20/05/26", "Y13", "https://claw.express/yt13", "https://www.youtube.com/watch?v=3Zwz6D5mbJY&t=4s"],
].map(([date, code, clawin, video]) => ({
  id: uid(),
  date,
  tagIA: `[${code}]`,
  originCorban: `Anuncio ${code}`,
  statusIA: "PENDENTE" as Toggle,
  statusCorban: "PENDENTE" as Toggle,
  clawinLink: clawin,
  videoLink: video,
  number: "554831970918",
  quality: "ALTA" as Quality,
  phrase: `[${code}] Olá! Quero simular a antecipação do FGTS`,
}));

type VsSeedRow = {
  type: VsType;
  configured?: boolean;
  code?: string;
  gabe?: string;
  fadigati?: string;
  num?: string;
  phrase?: string;
};
type VsSeedGroup = { label: string; rows: VsSeedRow[] };

const vsSeedGroups: VsSeedGroup[] = [
  { label: "VS1", rows: [{ type: "DEDICADO", code: "VS1", fadigati: "https://bit.ly/fgts--vocesabia", num: "554831970918", phrase: "[VS1] Olá! Quero simular a antecipação do FGTS" }] },
  { label: "VS2", rows: [{ type: "SPOT", code: "VS2", fadigati: "https://bit.ly/fgts--vocesabia02", num: "554831970745", phrase: "[VS2] Olá! Quero simular a antecipação do FGTS" }] },
  { label: "VS3", rows: [{ type: "DEDICADO", code: "VS3", fadigati: "https://bit.ly/fgts--vocesabia03", num: "554831970918", phrase: "[VS3] Olá! Quero simular a antecipação do FGTS" }] },
  { label: "VS4", rows: [{ type: "SPOT", code: "VS4", fadigati: "https://bit.ly/fgts--vocesabia04", num: "554831970918", phrase: "[VS4] Olá! Quero simular a antecipação do FGTS" }] },
  { label: "VS5", rows: [{ type: "DEDICADO", code: "VS5", fadigati: "https://bit.ly/fgts--vocesabia05", num: "554831970745", phrase: "[VS5] Olá! Vim pela indicação do Você Sabia e gostaria de mais informações sobre o FGTS!" }] },
  { label: "VS6", rows: [
    { type: "DEDICADO", code: "VS6", fadigati: "https://bit.ly/fgts--vocesabia06", num: "554831970745", phrase: "[VS6] Olá! Vim pela indicação do Você Sabia e gostaria de mais informações sobre o FGTS!" },
    { type: "SPOT", configured: false },
  ] },
  { label: "VS7", rows: [
    { type: "DEDICADO", code: "VS7", fadigati: "https://bit.ly/fgts--vocesabia07", num: "554831970745", phrase: "[VS7] Olá! Quero simular a antecipação do FGTS" },
    { type: "SPOT", configured: false },
  ] },
  { label: "VS8", rows: [
    { type: "DEDICADO", code: "VS8", fadigati: "https://bit.ly/fgts--vocesabia08", num: "554831970745", phrase: "[VS8] Olá! Quero simular a antecipação do FGTS" },
    { type: "SPOT", configured: false },
  ] },
  { label: "VS9", rows: [
    { type: "DEDICADO", code: "VS9", fadigati: "https://bit.ly/fgts--vocesabia09", num: "554831970745", phrase: "[VS9] Olá! Quero simular a antecipação do FGTS" },
    { type: "SPOT", configured: false },
  ] },
  { label: "VS10", rows: [
    { type: "DEDICADO", code: "VS10", fadigati: "https://bit.ly/fgts--vocesabia10", num: "554831970745", phrase: "[VS10] Olá! Quero simular a antecipação do FGTS" },
    { type: "SPOT", configured: false },
  ] },
  { label: "VS11", rows: [
    { type: "SPOT", code: "VS11", gabe: "https://bit.ly/fgts-vocesabia11", num: "554831970918", phrase: "[VS11] Olá! Quero simular a antecipação do FGTS" },
    { type: "DEDICADO", configured: false },
  ] },
  { label: "VS12", rows: [
    { type: "DEDICADO", code: "VS12", gabe: "https://bit.ly/cdt-vocesabia12", num: "554831970918", phrase: "[VS12] Olá! Gostaria de mais informações sobre o crédito do trabalhador" },
    { type: "SPOT", configured: false },
  ] },
  { label: "VS13", rows: [{ type: "SPOT", code: "VS13", gabe: "https://bit.ly/cdt-vocesabia13", num: "554831970918", phrase: "[VS13] Olá! Gostaria de mais informações sobre o crédito do trabalhador" }] },
  { label: "VS14", rows: [{ type: "DEDICADO", code: "VS14", gabe: "https://bit.ly/fgts-vocesabia14", num: "554831970918", phrase: "[VS14] Olá! Quero simular a antecipação do FGTS" }] },
  { label: "VS15", rows: [{ type: "SPOT", code: "VS15", gabe: "https://bit.ly/cdt-vocesabia15", num: "554831970918", phrase: "[VS15] Olá! Gostaria de mais informações sobre o crédito do trabalhador" }] },
  { label: "VS16", rows: [
    { type: "DEDICADO", code: "VS16", gabe: "https://bit.ly/cdt-vocesabia16", num: "554831970918", phrase: "[VS16] Olá! Gostaria de mais informações sobre o crédito do trabalhador" },
    { type: "DEDICADO", code: "VS16", gabe: "https://bit.ly/fgts-vocesabia16", num: "554831970918", phrase: "[VS16] Olá! Quero simular a antecipação do FGTS" },
  ] },
  { label: "VS17+VS18", rows: [
    { type: "SPOT", code: "VS17", gabe: "https://bit.ly/fgts-vocesabia17", num: "554831970918", phrase: "[VS17] Olá! Quero simular a antecipação do FGTS" },
    { type: "DEDICADO", code: "VS18", gabe: "https://bit.ly/fgts-vocesabia18", num: "554831970918", phrase: "[VS18] Olá! Quero simular a antecipação do FGTS" },
  ] },
  { label: "VS19+VS20", rows: [
    { type: "DEDICADO", code: "VS19", gabe: "https://bit.ly/credito-vocesabia19", num: "554831970918", phrase: "[VS19] Olá! Gostaria de mais informações sobre Crédito." },
    { type: "SPOT", code: "VS20", gabe: "https://bit.ly/credito-vocesabia20", num: "554831970918", phrase: "[VS20] Olá! Gostaria de mais informações sobre Crédito." },
  ] },
  { label: "VS21", rows: [
    { type: "DEDICADO", code: "VS21", gabe: "https://bit.ly/fgts-vocesabia21", num: "554831970918", phrase: "[VS21] Olá! Quero simular a antecipação do FGTS" },
    { type: "SPOT", configured: false },
  ] },
];

const seedVsGroups: VsGroup[] = vsSeedGroups.map((g) => ({
  id: uid(),
  label: g.label,
  rows: g.rows.map((r) => ({
    id: uid(),
    type: r.type,
    videoLink: "",
    tagIA: r.code ? `[${r.code}]` : "",
    originCorban: r.code ? `Anuncio ${r.code}` : "",
    statusIA: "PENDENTE" as Toggle,
    statusCorban: "PENDENTE" as Toggle,
    bitlyGabe: r.gabe ?? "",
    bitlyFadigati: r.fadigati ?? "",
    number: r.num ?? "",
    quality: "ALTA" as Quality,
    phrase: r.phrase ?? "",
    configured: r.configured !== false,
  })),
}));

// ---------- Card view (Indicacoes / Canais) ----------
function PartnerCardView({
  card,
  onChange,
  onDelete,
  search,
}: {
  card: PartnerCard;
  onChange: (c: PartnerCard) => void;
  onDelete: () => void;
  search: string;
}) {
  const matches = useMemo(() => {
    if (!search) return true;
    const q = search.toLowerCase();
    const hay = [
      card.name, card.code,
      ...card.products.flatMap((p) => [p.originIA, p.originCorban, p.link, p.number, p.phrase, p.kind]),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }, [card, search]);
  if (!matches) return null;

  const updateProduct = (pid: string, patch: Partial<ProductRow>) =>
    onChange({ ...card, products: card.products.map((p) => (p.id === pid ? { ...p, ...patch } : p)) });

  const addProduct = () =>
    onChange({
      ...card,
      products: [
        ...card.products,
        {
          id: uid(),
          kind: "Geral",
          originIA: `[${card.code}]`,
          originCorban: "",
          link: "",
          number: "",
          quality: "ALTA",
          phrase: "",
        },
      ],
    });

  const removeProduct = (pid: string) =>
    onChange({ ...card, products: card.products.filter((p) => p.id !== pid) });

  const allAdded =
    card.statusIA === "ADICIONADO" && card.statusCorban === "ADICIONADO";

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-primary/5",
        allAdded ? "border-success/25" : "border-border",
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 font-mono text-[11px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/20">
              <Editable
                value={card.code}
                onChange={(v) => onChange({ ...card, code: v })}
                className="text-primary font-black"
              />
            </span>
            <div className="min-w-0 flex-1 truncate font-semibold text-foreground">
              <Editable
                value={card.name}
                onChange={(v) => onChange({ ...card, name: v })}
                placeholder="Nome do parceiro"
                className="text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusChip
              label="IA"
              value={card.statusIA}
              onChange={(v) => onChange({ ...card, statusIA: v })}
            />
            <StatusChip
              label="Corban"
              value={card.statusCorban}
              onChange={(v) => onChange({ ...card, statusCorban: v })}
            />
            <span className="ml-1 text-[10px] text-muted-foreground/60">
              {card.products.length} produto{card.products.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Excluir card"
          className="h-7 w-7 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Products */}
      <div className="space-y-2 p-3">
        {card.products.map((p) => (
          <div key={p.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80",
                      PRODUCT_META[p.kind].bg,
                    )}
                  >
                    {PRODUCT_META[p.kind].label}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(Object.keys(PRODUCT_META) as ProductKind[]).map((k) => (
                    <DropdownMenuItem key={k} onClick={() => updateProduct(p.id, { kind: k })}>
                      <span
                        className={cn(
                          "mr-2 rounded px-1.5 py-0 text-[9px] font-bold uppercase",
                          PRODUCT_META[k].bg,
                        )}
                      >
                        {PRODUCT_META[k].label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground/30 hover:text-destructive"
                onClick={() => removeProduct(p.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1.5 text-xs">
              <FieldRow label="Origem IA">
                <Editable
                  value={p.originIA}
                  onChange={(v) => updateProduct(p.id, { originIA: v })}
                  className="font-mono text-xs text-primary"
                />
                <CopyBtn value={p.originIA} />
              </FieldRow>
              <FieldRow label="Origem Corban">
                <Editable
                  value={p.originCorban}
                  onChange={(v) => updateProduct(p.id, { originCorban: v })}
                  className="text-xs"
                />
                <CopyBtn value={p.originCorban} />
              </FieldRow>
              <FieldRow label="Link" className="sm:col-span-2">
                <LinkCell value={p.link} onChange={(v) => updateProduct(p.id, { link: v })} />
              </FieldRow>
              <FieldRow label="Número">
                <NumberCell
                  number={p.number}
                  quality={p.quality}
                  onNumber={(v) => updateProduct(p.id, { number: v })}
                  onQuality={(q) => updateProduct(p.id, { quality: q })}
                />
              </FieldRow>
              <div className="pt-0.5">
                <ExpandablePhrase
                  phrase={p.phrase}
                  onChange={(v) => updateProduct(p.id, { phrase: v })}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={addProduct}
          className="h-7 w-full border border-dashed border-border/50 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-primary"
        >
          <Plus className="h-3 w-3" /> Produto
        </Button>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="w-[88px] shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </div>
  );
}

// ---------- Cards tab ----------
function CardsTab({
  storageKey,
  initial,
  search,
  addLabel,
  defaultCode,
}: {
  storageKey: string;
  initial: PartnerCard[];
  search: string;
  addLabel: string;
  defaultCode: string;
}) {
  const [cards, setCards] = useLocalStorage<PartnerCard[]>(storageKey, initial);

  const add = () =>
    setCards([
      {
        id: uid(),
        name: "Novo",
        code: defaultCode,
        statusIA: "PENDENTE",
        statusCorban: "PENDENTE",
        products: [
          {
            id: uid(),
            kind: "Geral",
            originIA: `[${defaultCode}]`,
            originCorban: "",
            link: "",
            number: "",
            quality: "ALTA",
            phrase: "",
          },
        ],
      },
      ...cards,
    ]);

  const pendingIA = cards.filter((c) => c.statusIA === "PENDENTE").length;
  const pendingCorban = cards.filter((c) => c.statusCorban === "PENDENTE").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{cards.length}</span> registros
          </span>
          {pendingIA > 0 && (
            <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-warning">
              {pendingIA} pendente{pendingIA > 1 ? "s" : ""} IA
            </span>
          )}
          {pendingCorban > 0 && (
            <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-warning">
              {pendingCorban} pendente{pendingCorban > 1 ? "s" : ""} Corban
            </span>
          )}
        </div>
        <Button onClick={add} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> {addLabel}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <PartnerCardView
            key={c.id}
            card={c}
            search={search}
            onChange={(nc) => setCards(cards.map((x) => (x.id === c.id ? nc : x)))}
            onDelete={() => setCards(cards.filter((x) => x.id !== c.id))}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Youtube tab ----------
function YoutubeTab({ search }: { search: string }) {
  const [rows, setRows] = useLocalStorage<YoutubeRow[]>("tags.youtube.v1", seedYoutube);
  const update = (id: string, patch: Partial<YoutubeRow>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.date, r.tagIA, r.originCorban, r.clawinLink, r.videoLink, r.number, r.phrase]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
  const add = () =>
    setRows([
      {
        id: uid(),
        date: "",
        tagIA: "",
        originCorban: "",
        statusIA: "PENDENTE",
        statusCorban: "PENDENTE",
        clawinLink: "",
        videoLink: "",
        number: "",
        quality: "ALTA",
        phrase: "",
      },
      ...rows,
    ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{rows.length}</span> anúncios
        </span>
        <Button onClick={add} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <Th>Data</Th>
                <Th>Tag IA</Th>
                <Th>Origem Corban</Th>
                <Th>Status</Th>
                <Th>Link Clawin</Th>
                <Th>Link Vídeo</Th>
                <Th>Número</Th>
                <Th>Frase</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  className={cn(
                    "border-b border-border/40 align-top transition-colors last:border-0 hover:bg-accent/15",
                    i % 2 === 1 && "bg-secondary/10",
                  )}
                >
                  <Td>
                    <Editable value={r.date} onChange={(v) => update(r.id, { date: v })} className="font-mono text-muted-foreground" />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Editable value={r.tagIA} onChange={(v) => update(r.id, { tagIA: v })} className="font-mono font-bold text-primary" />
                      <CopyBtn value={r.tagIA} />
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Editable value={r.originCorban} onChange={(v) => update(r.id, { originCorban: v })} />
                      <CopyBtn value={r.originCorban} />
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      <StatusChip label="IA" value={r.statusIA} onChange={(v) => update(r.id, { statusIA: v })} />
                      <StatusChip label="Corban" value={r.statusCorban} onChange={(v) => update(r.id, { statusCorban: v })} />
                    </div>
                  </Td>
                  <Td>
                    <LinkCell value={r.clawinLink} onChange={(v) => update(r.id, { clawinLink: v })} />
                  </Td>
                  <Td>
                    <LinkCell value={r.videoLink} onChange={(v) => update(r.id, { videoLink: v })} />
                  </Td>
                  <Td>
                    <NumberCell
                      number={r.number}
                      quality={r.quality}
                      onNumber={(v) => update(r.id, { number: v })}
                      onQuality={(q) => update(r.id, { quality: q })}
                    />
                  </Td>
                  <Td className="min-w-[200px]">
                    <ExpandablePhrase phrase={r.phrase} onChange={(v) => update(r.id, { phrase: v })} />
                  </Td>
                  <Td>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground/30 hover:text-destructive"
                      onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- VS tab (grouped) ----------
function VsTab({ search }: { search: string }) {
  const [groups, setGroups] = useLocalStorage<VsGroup[]>("tags.vs.v3", seedVsGroups);

  const updateRow = (gid: string, rid: string, patch: Partial<VsRow>) =>
    setGroups(
      groups.map((g) =>
        g.id === gid ? { ...g, rows: g.rows.map((r) => (r.id === rid ? { ...r, ...patch } : r)) } : g,
      ),
    );

  const newRow = (type: VsType = "SPOT"): VsRow => ({
    id: uid(),
    type,
    videoLink: "",
    tagIA: "",
    originCorban: "",
    statusIA: "PENDENTE",
    statusCorban: "PENDENTE",
    bitlyGabe: "",
    bitlyFadigati: "",
    number: "",
    quality: "ALTA",
    phrase: "",
    configured: true,
  });

  const addGroup = () =>
    setGroups([{ id: uid(), label: `VS${groups.length + 1}`, rows: [newRow("DEDICADO")] }, ...groups]);

  const addRowToGroup = (gid: string) =>
    setGroups(
      groups.map((g) =>
        g.id === gid
          ? {
              ...g,
              rows: [
                ...g.rows,
                newRow(g.rows[g.rows.length - 1]?.type === "DEDICADO" ? "SPOT" : "DEDICADO"),
              ],
            }
          : g,
      ),
    );

  const removeRow = (gid: string, rid: string) =>
    setGroups(
      groups
        .map((g) => (g.id === gid ? { ...g, rows: g.rows.filter((r) => r.id !== rid) } : g))
        .filter((g) => g.rows.length > 0),
    );

  const removeGroup = (gid: string) => setGroups(groups.filter((g) => g.id !== gid));

  const filtered = groups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const hay = [
      g.label,
      ...g.rows.flatMap((r) => [
        r.type,
        r.videoLink,
        r.tagIA,
        r.originCorban,
        r.bitlyGabe,
        r.bitlyFadigati,
        r.number,
        r.phrase,
      ]),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{groups.length}</span> vídeos ·{" "}
          <span className="font-semibold text-foreground">
            {groups.reduce((n, g) => n + g.rows.length, 0)}
          </span>{" "}
          placements
        </span>
        <Button onClick={addGroup} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Adicionar grupo
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <Th>Link do Vídeo</Th>
                <Th>Tipo</Th>
                <Th>Tag IA</Th>
                <Th>Origem Corban</Th>
                <Th>Status</Th>
                <Th>Bitly Gabe</Th>
                <Th>Bitly Fadigati</Th>
                <Th>Número</Th>
                <Th>Frase</Th>
                <Th></Th>
              </tr>
            </thead>
            {filtered.map((g, gIdx) => (
              <tbody key={g.id} className={cn(gIdx > 0 && "border-t-4 border-t-background")}>
                {g.rows.map((r, rIdx) => {
                  const isFirst = rIdx === 0;
                  const isLast = rIdx === g.rows.length - 1;
                  const sameTypeAsPrev = !isFirst && g.rows[rIdx - 1].type === r.type;
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "group/row align-top transition-colors hover:bg-accent/15",
                        "border-l-2 border-l-primary/40",
                        !isFirst && "border-t border-t-border/30",
                        !r.configured && "opacity-50",
                      )}
                    >
                      <Td className="min-w-[180px] align-middle">
                        <div className="space-y-1">
                          {isFirst ? (
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/15">
                                {g.label}
                              </span>
                              {g.rows.length > 1 && (
                                <span className="text-[10px] text-muted-foreground/60">
                                  {g.rows.length} linhas
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="ml-1 text-[10px] text-muted-foreground/40">↳ {g.label}</span>
                          )}
                          <LinkCell
                            value={r.videoLink}
                            onChange={(v) => updateRow(g.id, r.id, { videoLink: v })}
                          />
                        </div>
                      </Td>
                      <Td>
                        {sameTypeAsPrev ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground/40">
                            ↳
                          </span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80",
                                  r.type === "DEDICADO"
                                    ? "border-primary/30 bg-primary/15 text-primary"
                                    : "border-pink-400/30 bg-pink-400/10 text-pink-300",
                                )}
                              >
                                {r.type}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => updateRow(g.id, r.id, { type: "DEDICADO" })}
                              >
                                DEDICADO
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateRow(g.id, r.id, { type: "SPOT" })}
                              >
                                SPOT
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {!r.configured && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => updateRow(g.id, r.id, { configured: true })}
                              className="text-[10px] italic text-primary/70 hover:underline"
                            >
                              configurar
                            </button>
                          </div>
                        )}
                      </Td>
                      <Td>
                        {r.configured ? (
                          <div className="flex items-center gap-1">
                            <Editable
                              value={r.tagIA}
                              onChange={(v) => updateRow(g.id, r.id, { tagIA: v })}
                              className="font-mono font-bold text-primary"
                            />
                            <CopyBtn value={r.tagIA} />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </Td>
                      <Td>
                        {r.configured ? (
                          <div className="flex items-center gap-1">
                            <Editable
                              value={r.originCorban}
                              onChange={(v) => updateRow(g.id, r.id, { originCorban: v })}
                            />
                            <CopyBtn value={r.originCorban} />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </Td>
                      <Td>
                        {r.configured ? (
                          <div className="flex flex-col gap-1">
                            <StatusChip
                              label="IA"
                              value={r.statusIA}
                              onChange={(v) => updateRow(g.id, r.id, { statusIA: v })}
                            />
                            <StatusChip
                              label="Corban"
                              value={r.statusCorban}
                              onChange={(v) => updateRow(g.id, r.id, { statusCorban: v })}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </Td>
                      <Td>
                        {r.configured ? (
                          <LinkCell
                            value={r.bitlyGabe}
                            onChange={(v) => updateRow(g.id, r.id, { bitlyGabe: v })}
                          />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </Td>
                      <Td>
                        {r.configured ? (
                          <LinkCell
                            value={r.bitlyFadigati}
                            onChange={(v) => updateRow(g.id, r.id, { bitlyFadigati: v })}
                          />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </Td>
                      <Td>
                        {r.configured ? (
                          <NumberCell
                            number={r.number}
                            quality={r.quality}
                            onNumber={(v) => updateRow(g.id, r.id, { number: v })}
                            onQuality={(q) => updateRow(g.id, r.id, { quality: q })}
                          />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </Td>
                      <Td className="min-w-[200px]">
                        {r.configured ? (
                          <ExpandablePhrase
                            phrase={r.phrase}
                            onChange={(v) => updateRow(g.id, r.id, { phrase: v })}
                          />
                        ) : (
                          <span className="italic text-muted-foreground/30">não configurado</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground/20 opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-destructive"
                            onClick={() => removeRow(g.id, r.id)}
                            title="Remover linha"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          {isLast && (
                            <>
                              <button
                                className="text-[10px] text-muted-foreground/50 opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-primary"
                                onClick={() => addRowToGroup(g.id)}
                                title="Adicionar linha ao grupo"
                              >
                                + linha
                              </button>
                              <button
                                className="text-[10px] text-destructive/40 opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-destructive"
                                onClick={() => removeGroup(g.id)}
                                title="Excluir grupo"
                              >
                                − grupo
                              </button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </th>
  );
}
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2", className)}>{children}</td>;
}

const TAB_META = [
  { value: "indicacoes", label: "Indicações", icon: Users },
  { value: "canais", label: "Canais Claw", icon: Radio },
  { value: "youtube", label: "YouTube Ads", icon: Youtube },
  { value: "vs", label: "Você Sabia", icon: Tv2 },
];

// ---------- Main ----------
function Dashboard() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("indicacoes");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-5 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <Tag className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                Tags & Origens
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">
                Claw Express
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="ml-auto w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tag, nome, link, número..."
                className="h-9 bg-secondary/50 pl-9 pr-8 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1600px] px-5 py-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-5">
          <TabsList className="h-auto gap-0.5 rounded-xl bg-secondary/50 p-1">
            {TAB_META.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="indicacoes">
            <CardsTab
              storageKey="tags.indicacoes.v1"
              initial={seedPartners}
              search={search}
              addLabel="Indicação"
              defaultCode="I00"
            />
          </TabsContent>
          <TabsContent value="canais">
            <CardsTab
              storageKey="tags.canais.v1"
              initial={seedCanais}
              search={search}
              addLabel="Canal"
              defaultCode="NEW"
            />
          </TabsContent>
          <TabsContent value="youtube">
            <YoutubeTab search={search} />
          </TabsContent>
          <TabsContent value="vs">
            <VsTab search={search} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
