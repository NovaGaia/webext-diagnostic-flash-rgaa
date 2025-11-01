// Service Worker pour l'extension
console.log('Service Worker de l\'extension chargé');

// Écouteur pour les connexions depuis le panneau DevTools
chrome.runtime.onConnect.addListener((port) => {
  console.log('Connexion établie depuis:', port.name);
  
  port.onMessage.addListener((msg) => {
    console.log('Message reçu:', msg);
  });
  
  port.onDisconnect.addListener(() => {
    console.log('Connexion fermée');
  });
});

// Écouteur pour l'installation de l'extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installée:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Première installation de l\'extension');
  }
});
