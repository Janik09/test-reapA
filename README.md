# RestaurantApp – Stressfrei reservieren & vorbestellen

Eine einfache Demo-Web-App mit Spring Boot (Backend) und statischem HTML/CSS/JS (Frontend). Das Frontend wird direkt über Spring Boot ausgeliefert (`/src/main/resources/static`).

## Setup & Start

```bash
cd backend
./mvnw spring-boot:run
```

Danach im Browser öffnen: `http://localhost:8080`

> Hinweis: Die `./mvnw`-Datei ist eine leichte Wrapper-Variante, die das lokal installierte Maven nutzt.

## Datumsformat

Reservierungen erwarten `dateTimeStart` im ISO-Format ohne Zeitzone, z. B.:

```
2024-08-01T18:30
```

## API (Kurzüberblick)

- `GET /api/menu`
- `GET /api/menu/{id}`
- `GET /api/tables`
- `POST /api/reservations`
- `GET /api/reservations?contact=...`
- `GET /api/reservations/{id}`
- `POST /api/orders`
- `GET /api/orders?contact=...`
- `GET /api/orders/{id}`
- `POST /api/orders/{id}/pay`
- `GET /api/health`

## Beispiel-Workflows

### Reservierung
1. Öffne die Seite „Reservierung“.
2. Name, Kontakt, Datum/Uhrzeit, Dauer und Personen eingeben.
3. Backend weist automatisch den kleinsten passenden freien Tisch zu.
4. Bestätigungscode (ID) wird angezeigt.

### Vorbestellung
1. Unter „Menu“ Gerichte auswählen und in den Warenkorb legen.
2. Unter „Vorbestellung“ Kontakt und optional Reservierungs-ID eingeben.
3. Bestellung abschicken – Status startet bei `NEW`.

### Mock-Zahlung
1. Unter „Meine Buchungen“ mit Kontakt suchen.
2. Bei offenen Bestellungen den Button „Jetzt bezahlen“ klicken.
3. Status wechselt auf `PAID`.

## Daten
Beispieldaten werden über `data.sql` initialisiert:
- Mindestens 10 Tische
- Mindestens 8 Menüpunkte in mehreren Kategorien
