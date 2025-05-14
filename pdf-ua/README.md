# PDF-UA Converter Service

Ein REST-Service zur Konvertierung von Word-Dokumenten in PDF-UA-Dokumente mit Collabora Online.

## Voraussetzungen

- Node.js (v14 oder höher)
- Docker
- Collabora Online Docker Container

## Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd pdf-ua-converter
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Collabora Online Container starten:
```bash
docker run -t -d -p 9980:9980 -e "domain=localhost" -e "username=admin" -e "password=admin" --restart always collabora/code
```

4. Umgebungsvariablen konfigurieren:
Erstellen Sie eine `.env` Datei im Hauptverzeichnis mit folgendem Inhalt:
```
PORT=3000
COLLABORA_URL=http://localhost:9980
```

## Verwendung

1. Service starten:
```bash
npm start
```

2. Für die Entwicklung mit automatischem Neustart:
```bash
npm run dev
```

## API Endpunkte

### Dokument konvertieren
```
POST /convert
Content-Type: multipart/form-data
```

Parameter:
- `document`: Die Word-Datei (.doc oder .docx)

Response:
- Konvertierte PDF-Datei als Download

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok"
}
```

## Test mit curl

Sie können den Service mit folgendem curl-Befehl testen:

```bash
# Health Check
curl http://localhost:3000/health

# Dokument konvertieren
curl -X POST \
  -F "document=@/pfad/zu/ihrer/datei.docx" \
  -H "Content-Type: multipart/form-data" \
  --output konvertiert.pdf \
  http://localhost:3000/convert
```

Ersetzen Sie `/pfad/zu/ihrer/datei.docx` mit dem tatsächlichen Pfad zu Ihrer Word-Datei. Die konvertierte PDF-Datei wird als `konvertiert.pdf` im aktuellen Verzeichnis gespeichert.

## Fehlerbehandlung

Der Service gibt folgende HTTP-Statuscodes zurück:
- 200: Erfolgreiche Konvertierung
- 400: Ungültige Anfrage (keine Datei oder falsches Dateiformat)
- 500: Server-Fehler bei der Konvertierung

## Sicherheitshinweise

- Stellen Sie sicher, dass der Collabora Online Container in einer sicheren Umgebung läuft
- Konfigurieren Sie die Zugangsdaten für Collabora Online entsprechend
- Verwenden Sie HTTPS in Produktionsumgebungen 