# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

# Flowbite React Vite App

## Zarządzanie serwerem proxy AWS

Serwer proxy jest zarządzany przez PM2 i działa na porcie 3000. Obsługuje połączenia z AWS RDS i S3.

### Podstawowe komendy PM2

1. **Status serwera**
```bash
pm2 status
```

2. **Uruchomienie serwera**
```bash
pm2 start server/index.mjs --name aws-proxy
```

3. **Zatrzymanie serwera**
```bash
pm2 stop aws-proxy
```

4. **Restart serwera**
```bash
pm2 restart aws-proxy
```

5. **Podgląd logów**
```bash
pm2 logs aws-proxy
```

6. **Monitorowanie w czasie rzeczywistym**
```bash
pm2 monit
```

### Automatyczne uruchamianie

Aby serwer uruchamiał się automatycznie po restarcie systemu:

```bash
pm2 startup
pm2 save
```

### Konfiguracja

Plik konfiguracyjny PM2: `ecosystem.config.js`

```javascript
export default {
  apps: [{
    name: 'aws-proxy',
    script: 'server/index.mjs',
    watch: ['server'],
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    autorestart: true,
    max_memory_restart: '1G',
  }]
};
```

## Uruchamianie aplikacji React

Aby uruchomić aplikację frontendową:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:5173

## Konfiguracja AWS

### Połączenie z RDS (MySQL)

Serwer proxy obsługuje połączenie z bazą danych MySQL na AWS RDS. Konfiguracja znajduje się w pliku `.env`:

```bash
RDS_HOST=flask-app-msbox.chqqwymic43o.us-east-1.rds.amazonaws.com
RDS_PORT=3306
RDS_USER=admin
RDS_PASSWORD=twoje_haslo
RDS_DATABASE=msbox_db
```

Przykład użycia w React:
```typescript
// Wykonanie zapytania SQL przez proxy
const response = await fetch('http://localhost:3000/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    sql: 'SELECT * FROM twoja_tabela',
    parameters: [] 
  }),
});
```

### Połączenie z S3

Konfiguracja S3 znajduje się w pliku `.env`:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=twoj_access_key
AWS_SECRET_ACCESS_KEY=twoj_secret_key
S3_BUCKET_NAME=msbox-app-all
```

Przykład użycia w React:
```typescript
// Pobranie pliku z S3
const response = await s3Service.getFile('nazwa_pliku.txt');

// Przesłanie pliku do S3
const response = await s3Service.uploadFile(plik, 'nazwa_pliku.txt');
```

### CORS dla S3

Konfiguracja CORS dla bucketa S3:

```json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedOrigins": ["http://localhost:5173"],
            "ExposeHeaders": []
        }
    ]
}
```
