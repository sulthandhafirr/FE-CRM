import { useAuth } from "../../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api/apiClient";
import ProfilePageLayout from "../components/ProfilePageLayout";

// Helper: Fetch the tier assigned to a customer profile
const fetchProfileTier = async (userId) => {
  if (!userId) return null;
  try {
    const { data } = await api.get(`/api/tiers/profile/${userId}`);
    return data; // { profileId, tierId, tierName, tierColor } — semua null kalau belum ada tier
  } catch {
    return null;
  }
};

export default function CustomerProfilePage() {
  const { user, role, loading: authLoading } = useAuth();

  // Fetch tier — hanya relevan untuk role customer
  const { data: profileTier } = useQuery({
    queryKey: ["profile-tier", user?.id],
    queryFn: () => fetchProfileTier(user?.id),
    enabled: !!user?.id && !authLoading && role === "customer",
    staleTime: 1000 * 60 * 5,
  });

  return <ProfilePageLayout tier={role === "customer" ? profileTier : null} />;
}
