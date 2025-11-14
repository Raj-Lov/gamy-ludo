"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import {
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  Wallet,
  Wand2
} from "lucide-react";

import { GlassCard } from "@/components/primitives/glass-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { MotionDiv, useFeedback } from "@/components/providers";
import { cn } from "@/components/lib/utils";
import { useCoinCodes } from "@/hooks/use-coin-codes";
import { useRazorpayPricing } from "@/hooks/use-razorpay-pricing";
import { firebaseFirestore } from "@/lib/firebase/client";
import {
  createEmptyCoinCode,
  defaultRazorpayPricing,
  type CoinCode,
  type CoinCodeStatus,
  type RazorpayPricingConfig
} from "@/lib/admin";
import { RewardConfigManager } from "@/components/rewards/reward-config-manager";

const statusFilters: Array<{ label: string; value: CoinCodeStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Redeemed", value: "redeemed" },
  { label: "Expired", value: "expired" },
  { label: "Disabled", value: "disabled" }
];

const statusBadgeStyles: Record<CoinCodeStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
  redeemed: "bg-sky-500/15 text-sky-200 border-sky-500/20",
  expired: "bg-amber-500/15 text-amber-200 border-amber-500/20",
  disabled: "bg-rose-500/15 text-rose-200 border-rose-500/20"
};

const toDateInputValue = (value: Date | undefined | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

interface CodeFormState {
  id?: string;
  code: string;
  amount: number;
  priceInr: number;
  status: CoinCodeStatus;
  usageCount: number;
  maxUses: number;
  planId: string;
  notes: string;
  expiresAt: string;
}

const createFormState = (code: CoinCode | null): CodeFormState => ({
  id: code?.id,
  code: code?.code ?? "",
  amount: code?.amount ?? 0,
  priceInr: code?.priceInr ?? 0,
  status: code?.status ?? "active",
  usageCount: code?.usageCount ?? 0,
  maxUses: code?.maxUses ?? 1,
  planId: code?.planId ?? "",
  notes: code?.notes ?? "",
  expiresAt: toDateInputValue(code?.expiresAt instanceof Date ? code.expiresAt : undefined)
});

interface CodeModalProps {
  open: boolean;
  initialCode: CoinCode | null;
  onClose: () => void;
  onSave: (form: CodeFormState) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  saving: boolean;
  deleting: boolean;
}

const CodeModal = ({ open, initialCode, onClose, onSave, onDelete, saving, deleting }: CodeModalProps) => {
  const [form, setForm] = useState<CodeFormState>(() => createFormState(initialCode));

  useEffect(() => {
    setForm(createFormState(initialCode));
  }, [initialCode, open]);

  const handleChange = <K extends keyof CodeFormState>(key: K, value: CodeFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  if (!open) return null;

  const isEditing = Boolean(initialCode?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">{isEditing ? "Edit coin code" : "Create coin code"}</h3>
            <p className="text-sm text-white/60">Configure redemption allowances, Razorpay mapping, and expiry rules.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 hover:border-white/30 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Code</span>
            <input
              value={form.code}
              onChange={(event) => handleChange("code", event.target.value.toUpperCase())}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              placeholder="e.g. LUDO-BOOST-2024"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Plan ID</span>
            <input
              value={form.planId}
              onChange={(event) => handleChange("planId", event.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              placeholder="Optional Razorpay plan reference"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Coin amount</span>
            <input
              type="number"
              value={form.amount}
              onChange={(event) => handleChange("amount", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              min={0}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Price (₹)</span>
            <input
              type="number"
              value={form.priceInr}
              onChange={(event) => handleChange("priceInr", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              min={0}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Max uses</span>
            <input
              type="number"
              value={form.maxUses}
              onChange={(event) => handleChange("maxUses", Number(event.target.value) || 1)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              min={1}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Usage count</span>
            <input
              type="number"
              value={form.usageCount}
              onChange={(event) => handleChange("usageCount", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              min={0}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Status</span>
            <select
              value={form.status}
              onChange={(event) => handleChange("status", event.target.value as CoinCodeStatus)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            >
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Expires at</span>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => handleChange("expiresAt", event.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm text-white/70">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Internal notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => handleChange("notes", event.target.value)}
            className="min-h-[100px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {isEditing ? (
            <button
              type="button"
              onClick={() => initialCode?.id && onDelete(initialCode.id)}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-red-200 transition hover:border-red-300/60 hover:text-red-100 disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete code
            </button>
          ) : (
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Use CSV upload for bulk runs.</div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white/30 hover:text-white"
            >
              Cancel
            </button>
            <GradientButton type="button" onClick={() => onSave(form)} disabled={saving || !form.code.trim()}>
              {saving ? "Saving" : "Save changes"}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const parseCsv = (csv: string) => {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return rows
    .map((line) => {
      const [code, amount, priceInr, maxUses, planId] = line.split(",").map((cell) => cell.trim());
      if (!code) return null;
      return {
        code,
        amount: Number(amount) || 0,
        priceInr: Number(priceInr) || 0,
        maxUses: Number(maxUses) || 1,
        planId: planId ?? ""
      };
    })
    .filter(Boolean) as Array<{ code: string; amount: number; priceInr: number; maxUses: number; planId: string }>;
};

export default function CoinCodesPage() {
  const { codes, loading } = useCoinCodes();
  const { notify } = useFeedback();
  const { pricing } = useRazorpayPricing();

  const [statusFilter, setStatusFilter] = useState<CoinCodeStatus | "all">("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CoinCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pricingDraft, setPricingDraft] = useState<RazorpayPricingConfig>(defaultRazorpayPricing);
  const [pricingDirty, setPricingDirty] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);

  useEffect(() => {
    setPricingDraft({ ...pricing, plans: pricing.plans.map((plan) => ({ ...plan })) });
    setPricingDirty(false);
  }, [pricing]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, planFilter]);

  const filteredCodes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return codes.filter((code) => {
      const matchesStatus = statusFilter === "all" || code.status === statusFilter;
      const matchesPlan = planFilter === "all" || (code.planId ?? "") === planFilter;
      const matchesSearch =
        !normalizedSearch ||
        code.code.toLowerCase().includes(normalizedSearch) ||
        (code.planId ?? "").toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesPlan && matchesSearch;
    });
  }, [codes, planFilter, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCodes.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCodes.slice(start, start + pageSize);
  }, [filteredCodes, page, pageSize]);

  const coinSupply = useMemo(
    () => codes.reduce((total, code) => total + (code.status === "active" ? code.amount : 0), 0),
    [codes]
  );

  const redeemedCoins = useMemo(
    () => codes.reduce((total, code) => total + (code.status === "redeemed" ? code.amount : 0), 0),
    [codes]
  );

  const handleOpenModal = (code: CoinCode | null) => {
    setEditingCode(code);
    setModalOpen(true);
  };

  const handleSaveCode = useCallback(
    async (form: CodeFormState) => {
      setSaving(true);
      try {
        const payload = {
          code: form.code.trim().toUpperCase(),
          amount: Math.max(0, form.amount),
          priceInr: Math.max(0, form.priceInr),
          status: form.status,
          usageCount: Math.max(0, form.usageCount),
          maxUses: Math.max(1, form.maxUses),
          planId: form.planId.trim(),
          notes: form.notes.trim(),
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
          updatedAt: serverTimestamp()
        } as const;

        if (form.id) {
          const ref = doc(firebaseFirestore, "coinCodes", form.id);
          await updateDoc(ref, payload);
          notify({ title: "Code updated", description: `${payload.code} is live.`, variant: "success" });
        } else {
          const ref = doc(collection(firebaseFirestore, "coinCodes"));
          await setDoc(ref, {
            ...payload,
            createdAt: serverTimestamp(),
            usageCount: 0
          });
          notify({ title: "Code created", description: `${payload.code} is ready for distribution.`, variant: "success" });
        }
        setModalOpen(false);
      } catch (error) {
        console.error("Failed to persist coin code", error);
        notify({
          title: "Unable to save",
          description: error instanceof Error ? error.message : "Check your connection and try again.",
          variant: "error"
        });
      } finally {
        setSaving(false);
      }
    },
    [notify]
  );

  const handleDeleteCode = useCallback(
    async (id: string) => {
      setDeleting(true);
      try {
        await deleteDoc(doc(firebaseFirestore, "coinCodes", id));
        notify({ title: "Code removed", description: "The code and remaining supply were deleted.", variant: "success" });
        setModalOpen(false);
      } catch (error) {
        console.error("Failed to delete coin code", error);
        notify({
          title: "Unable to delete",
          description: error instanceof Error ? error.message : "Please retry after reloading.",
          variant: "error"
        });
      } finally {
        setDeleting(false);
      }
    },
    [notify]
  );

  const handleCsvUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const text = await file.text();
        const rows = parseCsv(text);
        if (!rows.length) {
          notify({ title: "No rows detected", description: "Ensure your CSV has data rows.", variant: "warning" });
          return;
        }
        const batch = writeBatch(firebaseFirestore);
        const now = serverTimestamp();
        rows.forEach((row) => {
          const ref = doc(collection(firebaseFirestore, "coinCodes"));
          batch.set(ref, {
            code: row.code.toUpperCase(),
            amount: row.amount,
            priceInr: row.priceInr,
            status: "active" as const,
            usageCount: 0,
            maxUses: row.maxUses,
            planId: row.planId,
            createdAt: now,
            updatedAt: now,
            notes: "Imported via CSV",
            expiresAt: null
          });
        });
        await batch.commit();
        notify({ title: "Bulk import complete", description: `${rows.length} codes synced.`, variant: "success" });
      } catch (error) {
        console.error("Failed to import CSV", error);
        notify({
          title: "CSV upload failed",
          description: error instanceof Error ? error.message : "The file could not be processed.",
          variant: "error"
        });
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    },
    [notify]
  );

  const updatePricingField = <K extends keyof RazorpayPricingConfig>(key: K, value: RazorpayPricingConfig[K]) => {
    setPricingDraft((current) => ({ ...current, [key]: value }));
    setPricingDirty(true);
  };

  const updatePricingPlan = (index: number, field: "label" | "coins" | "amountInr" | "active" | "id", value: string | number | boolean) => {
    setPricingDraft((current) => {
      const plans = [...current.plans];
      const target = { ...plans[index] };
      if (field === "coins" || field === "amountInr") {
        target[field] = Number(value) || 0;
      } else if (field === "active") {
        target.active = Boolean(value);
      } else {
        target[field] = String(value);
      }
      plans[index] = target;
      return { ...current, plans };
    });
    setPricingDirty(true);
  };

  const handlePricingSave = useCallback(async () => {
    setPricingSaving(true);
    try {
      await setDoc(
        doc(firebaseFirestore, "config", "razorpayPricing"),
        {
          ...pricingDraft,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      notify({ title: "Pricing synced", description: "Razorpay plans updated across checkout.", variant: "success" });
      setPricingDirty(false);
    } catch (error) {
      console.error("Failed to persist Razorpay pricing", error);
      notify({
        title: "Unable to save pricing",
        description: error instanceof Error ? error.message : "Check your credentials and retry.",
        variant: "error"
      });
    } finally {
      setPricingSaving(false);
    }
  }, [notify, pricingDraft]);

  return (
    <div className="flex flex-col gap-12">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <GlassCard className="border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Active supply</p>
              <p className="text-3xl font-semibold text-white">{coinSupply.toLocaleString()} coins</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 p-3 text-emerald-200">
              <Wallet className="h-6 w-6" />
            </span>
          </div>
          <p className="mt-3 text-xs text-white/60">Coins ready for redemption across active, non-expired codes.</p>
        </GlassCard>
        <GlassCard className="border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Redeemed coins</p>
              <p className="text-3xl font-semibold text-white">{redeemedCoins.toLocaleString()}</p>
            </div>
            <span className="rounded-full bg-sky-500/20 p-3 text-sky-200">
              <Wand2 className="h-6 w-6" />
            </span>
          </div>
          <p className="mt-3 text-xs text-white/60">Total volume claimed via codes for streak boosts and vault refills.</p>
        </GlassCard>
        <GlassCard className="border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Codes tracked</p>
              <p className="text-3xl font-semibold text-white">{codes.length}</p>
            </div>
            <span className="rounded-full bg-purple-500/20 p-3 text-purple-200">
              <Filter className="h-6 w-6" />
            </span>
          </div>
          <p className="mt-3 text-xs text-white/60">Realtime updates from Firestore keep the ledger accurate.</p>
        </GlassCard>
      </MotionDiv>

      <GlassCard className="space-y-6 border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search code or plan"
                className="w-full rounded-full border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white outline-none transition focus:border-sky-400/60"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as CoinCodeStatus | "all")}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            >
              {statusFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value)}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            >
              <option value="all">All plans</option>
              {[...new Set(codes.map((code) => code.planId).filter(Boolean))].map((planId) => (
                <option key={planId} value={planId ?? ""}>
                  {planId}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/70 transition hover:border-sky-400/40 hover:text-white">
              <Upload className={cn("h-4 w-4", uploading && "animate-bounce")} />
              <span>{uploading ? "Uploading" : "CSV upload"}</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={uploading} />
            </label>
            <GradientButton type="button" onClick={() => handleOpenModal(createEmptyCoinCode())}>
              <Plus className="mr-2 h-4 w-4" /> New code
            </GradientButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-white/70">
            <thead>
              <tr className="text-xs uppercase tracking-[0.3em] text-white/50">
                <th className="pb-2 pr-4 font-medium">Code</th>
                <th className="pb-2 pr-4 font-medium">Plan</th>
                <th className="pb-2 pr-4 font-medium">Coins</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Usage</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageSlice.map((code) => (
                <tr key={code.id} className="transition hover:bg-white/5">
                  <td className="py-3 pr-4 text-white">
                    <div className="font-semibold">{code.code}</div>
                    <div className="text-xs text-white/40">
                      {code.createdAt instanceof Date ? code.createdAt.toLocaleDateString() : ""}
                    </div>
                  </td>
                  <td className="py-3 pr-4">{code.planId || "—"}</td>
                  <td className="py-3 pr-4">{code.amount.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium", statusBadgeStyles[code.status])}>
                      {code.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-white">{code.usageCount}</span>
                    <span className="text-white/40"> / {code.maxUses}</span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(code)}
                      className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30 hover:text-white"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/50 md:flex-row">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredCodes.length)} of {filteredCodes.length} codes
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6 border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-white">Razorpay pricing controls</h3>
          <p className="text-sm text-white/60">
            Update base price, GST, and convenience fees to keep the checkout ladder aligned with live marketing campaigns.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Base price (₹)</span>
            <input
              type="number"
              value={pricingDraft.basePriceInr}
              onChange={(event) => updatePricingField("basePriceInr", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">GST %</span>
            <input
              type="number"
              value={pricingDraft.gstPercent}
              onChange={(event) => updatePricingField("gstPercent", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Convenience fee %</span>
            <input
              type="number"
              value={pricingDraft.convenienceFeePercent}
              onChange={(event) => updatePricingField("convenienceFeePercent", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Discount %</span>
            <input
              type="number"
              value={pricingDraft.discountPercent}
              onChange={(event) => updatePricingField("discountPercent", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Razorpay key</span>
            <input
              value={pricingDraft.razorpayKey}
              onChange={(event) => updatePricingField("razorpayKey", event.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Razorpay secret</span>
            <input
              value={pricingDraft.razorpaySecret}
              onChange={(event) => updatePricingField("razorpaySecret", event.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Plans</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingDraft.plans.map((plan, index) => (
              <div key={plan.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <label className="flex flex-col gap-1 text-sm text-white/70">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Plan ID</span>
                  <input
                    value={plan.id}
                    onChange={(event) => updatePricingPlan(index, "id", event.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-sm text-white/70">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Label</span>
                  <input
                    value={plan.label}
                    onChange={(event) => updatePricingPlan(index, "label", event.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-sm text-white/70">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Coins</span>
                  <input
                    type="number"
                    value={plan.coins}
                    onChange={(event) => updatePricingPlan(index, "coins", Number(event.target.value) || 0)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-sm text-white/70">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Amount (₹)</span>
                  <input
                    type="number"
                    value={plan.amountInr}
                    onChange={(event) => updatePricingPlan(index, "amountInr", Number(event.target.value) || 0)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                  />
                </label>
                <label className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                  <input
                    type="checkbox"
                    checked={plan.active}
                    onChange={(event) => updatePricingPlan(index, "active", event.target.checked)}
                    className="h-4 w-4 rounded border border-white/20 bg-black/40 text-sky-400"
                  />
                  Active
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <GradientButton type="button" onClick={handlePricingSave} disabled={!pricingDirty || pricingSaving}>
            {pricingSaving ? "Saving" : "Save pricing"}
          </GradientButton>
        </div>
      </GlassCard>

      <RewardConfigManager />

      <CodeModal
        open={modalOpen}
        initialCode={editingCode}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCode}
        onDelete={handleDeleteCode}
        saving={saving}
        deleting={deleting}
      />
    </div>
  );
}
