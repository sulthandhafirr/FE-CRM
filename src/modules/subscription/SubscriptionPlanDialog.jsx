import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { getSubscriptionPayment, getSubscriptionPlans, renewSubscription } from "./subscription.service";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatIdr = (amount) => amount
  ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
  : "Price unavailable";

export default function SubscriptionPlanDialog({ open, onClose, onComplete }) {
  const [plan, setPlan] = useState("monthly");
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) getSubscriptionPlans().then(setPrices).catch(() => {});
  }, [open]);

  const waitForPayment = async (orderId) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await wait(1500);
      try {
        const payment = await getSubscriptionPayment(orderId);
        if (payment.status === "paid") return payment;
        if (payment.status === "failed") throw new Error("Payment failed. Please try again.");
      } catch (paymentError) {
        if (paymentError?.response?.status !== 404) throw paymentError;
      }
    }
    throw new Error("Payment succeeded, but activation is still processing. Please try again shortly.");
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await renewSubscription(plan);
      if (!window.snap) throw new Error("Payment service is unavailable.");

      window.snap.pay(result.snapToken, {
        onSuccess: async () => {
          try {
            await waitForPayment(result.midtransOrderId);
            await onComplete?.();
            onClose();
          } catch (paymentError) {
            setError(paymentError?.response?.data?.message || paymentError.message || "Payment failed.");
            setLoading(false);
          }
        },
        onPending: () => {
          setError("Payment is pending. Complete the payment before continuing.");
          setLoading(false);
        },
        onError: () => {
          setError("Payment failed. Please try again.");
          setLoading(false);
        },
        onClose: () => setLoading(false),
      });
    } catch (paymentError) {
      setError(paymentError?.response?.data?.message || paymentError.message || "Payment failed.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Choose subscription plan</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Your current subscription remains unchanged until payment succeeds.
        </Typography>
        <FormControl>
          <RadioGroup value={plan} onChange={(event) => setPlan(event.target.value)}>
            <FormControlLabel value="monthly" control={<Radio />} label={`Monthly — ${formatIdr(prices.monthlyAmount)}`} disabled={loading} />
            <FormControlLabel value="yearly" control={<Radio />} label={`Yearly — ${formatIdr(prices.yearlyAmount)}`} disabled={loading} />
          </RadioGroup>
        </FormControl>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={submit} disabled={loading} variant="contained">
          {loading ? "Processing..." : "Continue to Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
