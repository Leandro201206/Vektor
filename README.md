# Vektor – Gewichts- & Fortschrittstracker

Persönliche PWA mit React, TypeScript, Vite und Tailwind CSS. Die Daten werden ausschließlich lokal im Browser (`localStorage`) abgelegt; es gibt keinen Account und keine geräteübergreifende Synchronisierung.

## 1. Windows: lokal starten

Installiere [Node.js LTS](https://nodejs.org/), [Git](https://git-scm.com/downloads/win) und [VS Code](https://code.visualstudio.com/). Entpacke die ZIP-Datei und öffne den Projektordner in VS Code. Im PowerShell-Terminal:

```powershell
npm install
npm run dev
```

Die angezeigte lokale Adresse im Browser öffnen. Einen Produktionsbuild erstellst du mit `npm run build` (Ausgabe in `dist/`).

## 2. GitHub-Repository erstellen

Auf GitHub **New repository** wählen: Name `vektor`, zunächst **Public** (GitHub Pages unter GitHub Free), ohne zusätzliche README oder `.gitignore`.

Im PowerShell-Terminal des Projektordners:

```powershell
git init
git branch -M main
git add .
git commit -m "Vektor PWA initial"
git remote add origin https://github.com/DEIN-NAME/vektor.git
git push -u origin main
```

Ersetze `DEIN-NAME` mit deinem Benutzernamen. Anmeldung über den Browser-/Credential-Manager-Dialog; keine Zugangsdaten in Quellcodedateien speichern.

## 3. Automatisches Deployment

In GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions** auswählen. Der vorbereitete Workflow `.github/workflows/deploy.yml` baut bei jedem Push auf `main` und veröffentlicht die PWA. Den ersten Lauf kannst du unter **Actions** prüfen.

Die URL ist normalerweise `https://DEIN-NAME.github.io/vektor/` und wird unter **Pages** angezeigt. Diese Webseite ist öffentlich erreichbar; nur deine lokal gespeicherten Messwerte sind nicht auf dem Server. Für GitHub Pages aus einem privaten Repository sind gegebenenfalls kostenpflichtige GitHub-Tarife nötig.

## 4. Spätere Updates

```powershell
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Falls `npm install` eine `package-lock.json` erzeugt, diese mit committen. Danach lässt sich der Workflow für reproduzierbare Builds von `npm install` auf `npm ci` umstellen.

## 5. Installation und Datensicherung

- Chrome/Edge am PC: App-Installationssymbol in der Adressleiste.
- Chrome auf Android: Browsermenü → **App installieren** oder **Zum Startbildschirm hinzufügen**.
- In Vektor unter **Einstellungen & Backup** regelmäßig JSON-Backups herunterladen.

**Wichtig:** Verschiedene Geräte oder Browser verwenden verschiedene Datenspeicher. Das Löschen von Browserdaten kann deine Messwerte entfernen. Ein Import ersetzt vorhandene Daten; vorher sichern.

Vektor startet ohne Demo-Messungen. Die anfänglichen Start-/Zielwerte sind Platzhalter; passe sie an deine eigenen Werte an. Trage auch deine Körpergröße ein, bevor du BMI-Werte nutzt.
