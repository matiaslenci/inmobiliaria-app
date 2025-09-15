const { supabase } = require("../utils/client");

class SubscriptionService {
  async getSubscriptionStatus(userId) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    return data;
  }

  async createOrUpdateSubscription(userId, paidUntil) {
    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({
        id: userId,
        is_active: true,
        paid_until: paidUntil,
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription:", error);
      return null;
    }

    return data;
  }

  async isSubscriptionActive(userId) {
    const subscription = await this.getSubscriptionStatus(userId);
    if (!subscription) return false;

    return (
      subscription.is_active && new Date(subscription.paid_until) > new Date()
    );
  }
}

module.exports = new SubscriptionService();
