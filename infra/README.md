# Azure infrastructure (Bicep)

| File | What it creates | Who runs it |
|---|---|---|
| `foundation.bicep` | Log Analytics, Container Apps environment, container registry, Key Vault, the API's managed identity (with pull and secret-read access), the deploy identity trusted by GitHub Actions, and an error alert | An Azure admin, once (and again only to change these resources) |
| `app.bicep` | The `kiaratech-api` Container App: API container plus ClamAV sidecar, settings, scaling, health probes | `.github/workflows/deploy.yml`, on every release |
| `naming.bicep` | Shared resource names | Imported by both |

Step-by-step setup is in `handover/Kiaratech-Hosting-Handover.pdf`, section 6. In short:

```bash
az group create --name rg-kiaratech-web --location uksouth
az deployment group create -g rg-kiaratech-web -f infra/foundation.bicep -p alertEmail=<ops address>
```

Then put the Turnstile secret in the Key Vault as `turnstile-secret`, create the GitHub environment `production` with the variables listed in the guide, and run **Actions > deploy > Run workflow** on `main`.

Check the templates compile (no Azure sign-in needed):

```bash
bicep lint infra/foundation.bicep
bicep lint infra/app.bicep
```
