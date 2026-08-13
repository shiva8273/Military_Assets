import { useState, useEffect } from "react";
import { Plus, Scale, RefreshCw } from "lucide-react";
import {
  getOpeningBalances,
  createOpeningBalance,
  getBases,
  getEquipmentTypes,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function OpeningBalances() {
  const { role, baseId } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bases, setBases] = useState([]);
  const [eqTypes, setEqTypes] = useState([]);

  const [form, setForm] = useState({
    base: role === "ADMIN" ? "" : baseId || "",
    equipment_type: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOptions();
    fetchRecords();
  }, []);

  const fetchOptions = async () => {
    try {
      if (role === "ADMIN") {
        const resB = await getBases();
        setBases(resB.data?.results || resB.data || []);
      }
      const resE = await getEquipmentTypes();
      setEqTypes(resE.data?.results || resE.data || []);
    } catch {}
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getOpeningBalances();
      setRecords(res.data?.results || res.data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.base) errs.base = "Base is required";
    if (!form.equipment_type)
      errs.equipment_type = "Equipment Type is required";
    if (!form.quantity || Number(form.quantity) <= 0)
      errs.quantity = "Quantity must be greater than 0";
    if (!form.date) errs.date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createOpeningBalance({
        ...form,
        quantity: Number(form.quantity),
      });
      toast.success("Opening balance created successfully.");
      setModalOpen(false);
      setForm({
        base: role === "ADMIN" ? "" : baseId || "",
        equipment_type: "",
        quantity: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.friendlyMessage || "Failed to create opening balance.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      label: "Base",
      accessor: "base_name",
      sortable: true,
      render: (val, row) => val || row.base?.name || row.base || "—",
    },
{
  label: "Equipment Type",
  accessor: "equipment_type_name",
  sortable: true,
  render: (val) => (
    <span className="font-medium text-slate-200">
      {val || "—"}
    </span>
  ),
},
    {
      label: "Quantity",
      accessor: "quantity",
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-100 tabular-nums">{val}</span>
      ),
    },
    {
      label: "Date",
      accessor: "date",
      sortable: true,
      render: (val) => val || "—",
    },
    {
      label: "Created At",
      accessor: "created_at",
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Opening Balances</h2>
          <p className="text-xs text-slate-400">
            Initialize stock levels across military bases
          </p>
        </div>
        {role === "ADMIN" && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create Opening Balance
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        onRefresh={fetchRecords}
        emptyTitle="No opening balances recorded"
        emptyDescription="Get started by initializing stock for an equipment type at a base."
        emptyAction={
          role === "ADMIN"
            ? {
                label: "Create Opening Balance",
                onClick: () => setModalOpen(true),
              }
            : undefined
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Opening Balance"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {role === "ADMIN" ? (
            <div>
              <label className="form-label">Base</label>
              <select
                value={form.base}
                onChange={(e) => setForm({ ...form, base: e.target.value })}
                className={`form-input ${errors.base ? "border-red-500" : ""}`}
              >
                <option value="">Select Base</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.base && <p className="form-error">{errors.base}</p>}
            </div>
          ) : (
            <div>
              <label className="form-label">Base ID</label>
              <input
                type="text"
                value={form.base}
                disabled
                className="form-input opacity-60 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="form-label">Equipment Type</label>
            <select
              value={form.equipment_type}
              onChange={(e) =>
                setForm({ ...form, equipment_type: e.target.value })
              }
              className={`form-input ${errors.equipment_type ? "border-red-500" : ""}`}
            >
              <option value="">Select Equipment Type</option>
              {eqTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.category})
                </option>
              ))}
            </select>
            {errors.equipment_type && (
              <p className="form-error">{errors.equipment_type}</p>
            )}
          </div>

          <div>
            <label className="form-label">Initial Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g. 100"
              className={`form-input ${errors.quantity ? "border-red-500" : ""}`}
            />
            {errors.quantity && <p className="form-error">{errors.quantity}</p>}
          </div>

          <div>
            <label className="form-label">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={`form-input ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
