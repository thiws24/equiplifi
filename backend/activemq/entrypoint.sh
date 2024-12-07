#!/bin/bash

# Standardwerte verwenden, wenn keine ENV-Variablen gesetzt sind
ACTIVEMQ_USER=${ACTIVEMQ_USER:-admin}
ACTIVEMQ_PASSWORD=${ACTIVEMQ_PASSWORD:-admin}

# Pfad zur jetty-realm.properties für Version 5.18.6
REALM_FILE="/opt/apache-activemq/conf/jetty-realm.properties"

# Überprüfen, ob die Datei existiert
if [ -f "$REALM_FILE" ]; then
  echo "Konfiguriere Benutzer in $REALM_FILE"
  # Ersetze oder füge den Benutzer hinzu
  sed -i "s/^admin:.*/$ACTIVEMQ_USER: $ACTIVEMQ_PASSWORD, admin/" "$REALM_FILE"
else
  echo "Fehler: $REALM_FILE nicht gefunden!"
  exit 1
fi

# Starte ActiveMQ
echo "Starte ActiveMQ..."
exec /opt/apache-activemq/bin/activemq console
