self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "You have a new message." };
  }

  const title = payload.title || `New message from ${payload.sender || "Chateazy"}`;
  const targetUrl = payload.url || (payload.peerId ? `/#/chat?peer=${encodeURIComponent(payload.peerId)}` : "/#/chat");
  const options = {
    body: payload.body || payload.text || "You have a new message.",
    tag: payload.tag || `msg-${payload.sender || "chat"}`,
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: payload.vibrate || [300, 150, 300, 150, 300],
    data: {
      url: targetUrl,
      sender: payload.sender || "Chateazy",
      peerId: payload.peerId || ""
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/#/chat";

  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clientsList) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) {
          try { await client.navigate(targetUrl); } catch {}
        }
        return;
      }
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});
