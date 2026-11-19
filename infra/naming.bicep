// Resource names shared by foundation.bicep and app.bicep, so both always point at the same resources.
// Registry and Key Vault names must be globally unique, so they carry a hash of the resource group ID.

@export()
func resourceNames(resourceGroupId string) object => {
  apiIdentity: 'kiaratech-api' // the API's managed identity; also the name admins search for when granting Graph access
  deployIdentity: 'kiaratech-deploy' // used only by the GitHub deploy workflow
  registry: 'kiaratech${uniqueString(resourceGroupId)}'
  keyVault: 'kv-kiaratech-${take(uniqueString(resourceGroupId), 6)}'
  logs: 'log-kiaratech-web'
  environment: 'cae-kiaratech-web'
  app: 'kiaratech-api'
}

@export()
var turnstileSecretName = 'turnstile-secret'
