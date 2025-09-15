# Sistema de Suscripciones con Supabase

Este documento describe la implementación de un sistema simple de suscripciones utilizando Supabase como backend.

## Estructura de la Base de Datos

### Tabla `subscriptions`

```sql
create table subscriptions (
  id uuid references auth.users on delete cascade not null primary key,
  is_active boolean default false,
  paid_until date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table subscriptions enable row level security;

-- Crear políticas de seguridad
create policy "Users can view their own subscription"
  on subscriptions for select
  using ( auth.uid() = id );

create policy "Only service role can update subscriptions"
  on subscriptions for all
  using ( auth.role() = 'service_role' );
```

## Servicio de Suscripciones

El archivo `src/services/subscription.service.js` maneja toda la lógica relacionada con las suscripciones:

```javascript
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
```

## Middleware de Protección

El archivo `src/middlewares/subscription-guard.js` proporciona un middleware para proteger las rutas que requieren una suscripción activa:

```javascript
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
```

## Uso

### Proteger una Ruta

Para proteger una ruta y asegurarse de que solo los usuarios con suscripción activa puedan acceder:

```javascript
const subscriptionGuard = require("./middlewares/subscription-guard");

router.get("/ruta-protegida", subscriptionGuard, (req, res) => {
  // Solo usuarios con suscripción activa llegarán aquí
});
```

### Marcar un Pago de Suscripción

Para registrar que un usuario ha pagado su suscripción:

```javascript
await subscriptionService.createOrUpdateSubscription(userId, "2025-10-15");
```

## Características

- Sistema simple y efectivo para menos de 50 usuarios
- Seguridad manejada por Supabase a través de RLS
- Los usuarios solo pueden ver su propia información de suscripción
- Control de fechas de vencimiento de suscripción
- Fácil integración con rutas existentes

## Seguridad

- La tabla utiliza Row Level Security (RLS) de Supabase
- Los usuarios solo pueden ver su propia información de suscripción
- Solo el rol de servicio puede modificar las suscripciones
- Integración directa con el sistema de autenticación de Supabase
