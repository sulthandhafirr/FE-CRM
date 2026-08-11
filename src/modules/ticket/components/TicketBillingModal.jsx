import { useState } from "react";
import { MdClose, MdAdd, MdDelete } from "react-icons/md";
import { O } from "./ticketTheme";

export default function TicketBillingModal({ initialItems, savingBilling, onSave, onClose }) {
  const [items, setItems] = useState(initialItems.length > 0 ? initialItems : [{ name: "", amount: "" }]);

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => setItems([...items, { name: "", amount: "" }]);

  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSave = () => {
    const validItems = items
      .filter((i) => i.name.trim() && Number(i.amount) > 0)
      .map((i) => ({ name: i.name.trim(), amount: Number(i.amount) }));
    onSave(validItems);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "16px",
          width: "420px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Billing Items</h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", padding: "4px" }}
          >
            <MdClose size={18} color="#9CA3AF" />
          </button>
        </div>

        {/* Items */}
        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                style={{
                  flex: 2,
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="number"
                placeholder="Amount"
                value={item.amount}
                onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", padding: "4px" }}
              >
                <MdDelete size={16} color="#DC2626" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              border: `1px dashed ${O[300]}`,
              background: "white",
              color: O[600],
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <MdAdd size={14} /> Add item
          </button>
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderTop: "1px solid #F3F4F6",
            fontSize: "14px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          <span>Total</span>
          <span>Rp {total.toLocaleString("id-ID")}</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", padding: "16px 20px", borderTop: "1px solid #F3F4F6" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              background: "white",
              color: "#6B7280",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savingBilling}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: savingBilling ? "#D1D5DB" : O[500],
              color: "white",
              fontWeight: "600",
              fontSize: "13px",
              cursor: savingBilling ? "not-allowed" : "pointer",
            }}
          >
            {savingBilling ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}