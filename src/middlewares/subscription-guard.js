const subscriptionService = require("../services/subscription.service");

const subscriptionGuard = async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const isActive = await subscriptionService.isSubscriptionActive(req.user.id);

  if (!isActive) {
    // Aquí puedes redirigir a una página de pago o mostrar un mensaje
    return res.redirect("/subscription-required");
  }

  next();
};

module.exports = subscriptionGuard;
