# Live-Demo Anleitung (Restaurant-App)

Diese Anleitung ist für eine kurze Live-Demo vor Publikum. Sie zeigt den kompletten Flow: Gast -> Bestellung -> QR -> Küche -> Service -> Admin.

## Voraussetzungen
- Java 17+ installiert
- Port 8080 frei

## Start
1. Im Repo-Root `backend` starten:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   (Windows PowerShell: `./mvnw.cmd spring-boot:run`)
2. Browser öffnen:
   - `http://localhost:8080/#/login`

## Demo-User (Login)
- Gast: `Gast` / `Gast1`
- Koch: `Koch` / `Koch1`
- Kellner: `Kellner` / `Kellner1`
- Admin: `Admin` / `Admin1`

## Live-Demo Ablauf (empfohlen)

### 1) Gast-Flow: Reservierung + Bestellung
1. Einloggen als **Gast**.
2. **Reservierung** anlegen:
   - Menü: „Reservierung“
   - Daten eingeben (Name, Kontakt, Datum/Uhrzeit, Personen)
   - Nach Erfolg erscheint ein **Alert** mit Datum/Uhrzeit/Personen.
3. **Speisekarte** öffnen:
   - Menü: „Speisekarte“
   - Mind. 1 Gericht „In den Warenkorb“.
4. **Bestellung** abschicken:
   - Menü: „Bestellen“
   - Name/Kontakt ausfüllen
   - Bestellung senden
5. **QR-Code**:
   - Nach dem Bestellen öffnet sich ein QR-Popup.
   - Der QR enthält die **Bestelldaten** (Name, Kontakt, Items, Summe).

### 2) Koch-Flow: Zubereitung
1. Abmelden und als **Koch** einloggen.
2. In der **Küche** erscheinen bezahlte Demo-Bestellungen.
3. Für eine Bestellung den Button **„Als fertig gekocht markieren“** klicken.

### 3) Kellner-Flow: Zum Tisch bringen
1. Abmelden und als **Kellner** einloggen.
2. Oben in „Fertige Gerichte“ erscheinen fertig gekochte Bestellungen.
3. Bei einer Bestellung **„Zum Tisch gebracht“** klicken → verschwindet aus der Liste.
4. Unter „Reservierungen“ sind alle Reservierungen sichtbar.

### 4) Admin-Flow: Verwaltung
1. Abmelden und als **Admin** einloggen.
2. **Menüeintrag hinzufügen** (Name, Kategorie, Preis, Bild-URL, Beschreibung).
3. **Löschen** einzelner Einträge oder „Alles löschen“.

## Troubleshooting (kurz)
- **Kein Menü sichtbar?** Seite neu laden und als Gast einloggen.
- **QR-Code leer?** Bestellung neu anlegen, danach QR erneut öffnen.
- **Port belegt?** Andere App auf 8080 schließen.

## Demo-Tipps
- QR-Code zeigt im Popup zusätzlich den Klartext-Inhalt – das ist die beste Stelle zum Erklären.
- Für einen sauberen Demo-Start kannst du als Admin alle Daten löschen.
