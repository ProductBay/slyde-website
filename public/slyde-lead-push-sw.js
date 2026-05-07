self.addEventListener("push", (event) => {
  let payload = {
    title: "SLYDE update",
    body: "Open your Slyder Lead Dashboard for the latest update.",
    url: "/join/slyder/status",
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/images/slyde-logo-email.png",
      badge: "/icon.svg",
      vibrate: [140, 70, 140],
      tag: payload.tag || "slyde-lead-update",
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/join/slyder/status", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client && new URL(client.url).href === url) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
      return undefined;
    }),
  );
});
