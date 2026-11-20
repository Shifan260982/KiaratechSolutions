// The API Container App with its ClamAV sidecar. Deployed by .github/workflows/deploy.yml on every release,
// after foundation.bicep has created the registry, Key Vault, identity and environment.
// Settings come from GitHub environment variables; see the handover guide, section 6.

import { resourceNames, turnstileSecretName } from 'naming.bicep'

param location string = resourceGroup().location

@description('Image tag to run: the Git commit the workflow built.')
@minLength(7)
param imageTag string

@description('Exact https origins of the website, comma-separated.')
param allowedOrigins string

// E-mail. Recipients need MAIL_SENDER; a form whose recipient is empty answers "try again later".
param mailSender string = ''
param enquiryRecipient string = ''
param applicationRecipient string = ''

var names = resourceNames(resourceGroup().id)

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' existing = {
  name: names.environment
}

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: names.registry
}

resource vault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: names.keyVault
}

resource apiIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: names.apiIdentity
}

var settings = {
  APP_ENV: 'production'
  ALLOWED_ORIGINS: allowedOrigins
  AZURE_CLIENT_ID: apiIdentity.properties.clientId // tells the API which managed identity to sign in with
  MAIL_SENDER: mailSender
  ENQUIRY_RECIPIENT: enquiryRecipient
  APPLICATION_RECIPIENT: applicationRecipient
  CLAMAV_HOST: 'localhost' // the sidecar shares the replica's network
  CLAMAV_PORT: '3310'
  TRUSTED_PROXY_HOPS: '1' // Container Apps ingress; add one per extra proxy such as Front Door
}

resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: names.app
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${apiIdentity.id}': {} }
  }
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        transport: 'auto'
        allowInsecure: false
      }
      registries: [{ server: registry.properties.loginServer, identity: apiIdentity.id }]
      secrets: [
        {
          name: turnstileSecretName
          keyVaultUrl: '${vault.properties.vaultUri}secrets/${turnstileSecretName}'
          identity: apiIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${registry.properties.loginServer}/kiaratech-api:${imageTag}'
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: concat(
            map(items(settings), s => { name: s.key, value: s.value }),
            [{ name: 'TURNSTILE_SECRET_KEY', secretRef: turnstileSecretName }]
          )
          probes: [
            { type: 'Liveness', httpGet: { path: '/health', port: 8000 }, periodSeconds: 30 }
            { type: 'Readiness', httpGet: { path: '/health', port: 8000 }, periodSeconds: 10 }
          ]
        }
        {
          name: 'clamav'
          // infra/clamav/Dockerfile: the official image with macro detection on. It updates its own signatures after start-up.
          image: '${registry.properties.loginServer}/kiaratech-clamav:${imageTag}'
          resources: { cpu: json('1.5'), memory: '3Gi' } // signature reloads briefly need about twice the resting memory
        }
      ]
      scale: {
        minReplicas: 1 // ClamAV takes minutes to load signatures, so never scale to zero
        maxReplicas: 2 // rate-limit counts live in each replica; more needs a shared store
      }
    }
  }
}

@description('Default address. Map api.kiaratechs.com to it (handover guide, section 8).')
output fqdn string = app.properties.configuration.ingress.fqdn
