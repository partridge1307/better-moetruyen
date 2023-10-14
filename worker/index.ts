declare const self: ServiceWorkerGlobalScope;

self.addEventListener('push', function (event) {
  const data = JSON.parse(event.data?.text() ?? '{title: ""}');

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: '/static/icon.png',
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        if (!clientList.length) return self.clients.openWindow('/');

        let client = clientList[0];
        for (let i = 1; i < clientList.length; i++) {
          if (clientList[i].focused) client = clientList[i];
        }

        return client.focus();
      })
  );
});

export {};
