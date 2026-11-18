// One-off setup, run by an Azure admin with Owner (or Contributor + Role Based Access Control Administrator) on the
// resource group. Creates everything except the Container App itself, which the GitHub deploy workflow manages.
//
//   az deployment group create -g rg-kiaratech-web -f infra/foundation.bicep -p alertEmail=<ops address>
//
// Safe to run again: every resource is declared, so re-running only corrects drift.

import { resourceNames, turnstileSecretName } from 'naming.bicep'

@description('Region for every resource. UK South keeps data in the UK.')
param location string = resourceGroup().location

@description('GitHub repository allowed to deploy, as owner/name.')
param githubRepository string = 'Shifan260982/KiaratechSolutions'

@description('GitHub environment the deploy workflow runs in. Only runs in this environment can sign in to Azure.')
param githubEnvironment string = 'production'

@description('Where error alerts are e-mailed. Leave empty to skip creating the alert.')
param alertEmail string = ''

var names = resourceNames(resourceGroup().id)

// Built-in role definition IDs (the same in every Azure tenant).
var roles = {
  acrPull: '7f951dda-4ed3-4680-a7ca-43fe172d538d'
  keyVaultSecretsUser: '4633458b-17de-408a-b874-0445c86b69e6'
  contributor: 'b24988ac-6180-42a0-ab88-20f7382dd24c'
}

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: names.logs
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: names.environment
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
  }
}

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: names.registry
  location: location
  sku: { name: 'Basic' }
  properties: {
    adminUserEnabled: false // images are pulled with the API's managed identity, never a password (anonymous pull is off on Basic)
  }
}

resource vault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: names.keyVault
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    enablePurgeProtection: true
    softDeleteRetentionInDays: 90
  }
}

// The API's identity. User-assigned, so it exists (with its permissions) before the Container App is first created:
// a system-assigned identity would only exist after creation, too late to pull the first image.
resource apiIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: names.apiIdentity
  location: location
}

resource apiCanPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, apiIdentity.id, roles.acrPull)
  scope: registry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roles.acrPull)
    principalId: apiIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource apiCanReadSecrets 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(vault.id, apiIdentity.id, roles.keyVaultSecretsUser)
  scope: vault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roles.keyVaultSecretsUser)
    principalId: apiIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// The deploy workflow's identity: signs in from GitHub Actions with OpenID Connect, so no password is stored anywhere.
resource deployIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: names.deployIdentity
  location: location
}

resource githubTrust 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: deployIdentity
  name: 'github-${githubEnvironment}'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${githubRepository}:environment:${githubEnvironment}'
    audiences: ['api://AzureADTokenExchange']
  }
}

// Contributor on this resource group only: enough to build images in the registry and update the Container App.
// It cannot grant permissions, so a compromised workflow cannot widen its own access.
resource deployCanDeploy 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, deployIdentity.id, roles.contributor)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roles.contributor)
    principalId: deployIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// One alert for any error the API logs (orphaned CV, failed notification, scanner down, Graph or captcha problems).
resource alertGroup 'Microsoft.Insights/actionGroups@2023-01-01' = if (!empty(alertEmail)) {
  name: 'ag-kiaratech-web'
  location: 'global'
  properties: {
    groupShortName: 'kiaratech'
    enabled: true
    emailReceivers: [
      { name: 'operations', emailAddress: alertEmail, useCommonAlertSchema: true }
    ]
  }
}

resource apiErrors 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = if (!empty(alertEmail)) {
  name: 'alert-kiaratech-api-errors'
  location: location
  properties: {
    displayName: 'Kiaratech API logged an error'
    description: 'The API logged at least one ERROR line. Read the message in Log Analytics: orphaned CV, notification failed, scanner unavailable, graph request rejected or captcha secret rejected.'
    severity: 2
    enabled: true
    scopes: [logs.id]
    evaluationFrequency: 'PT15M'
    windowSize: 'PT15M'
    criteria: {
      allOf: [
        {
          query: 'ContainerAppConsoleLogs_CL | where ContainerAppName_s == "${names.app}" and ContainerName_s == "api" | where Log_s has " ERROR kiaratech."'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: { numberOfEvaluationPeriods: 1, minFailingPeriodsToAlert: 1 }
        }
      ]
    }
    actions: { actionGroups: [alertGroup.id] }
  }
}

@description('Set as the GitHub variable AZURE_CLIENT_ID.')
output deployClientId string = deployIdentity.properties.clientId

@description('Needed in section 7 of the handover guide (Graph permissions); identity name is kiaratech-api.')
output apiIdentityClientId string = apiIdentity.properties.clientId

@description('Put the Cloudflare Turnstile secret here, named turnstile-secret, before the first app deployment.')
output keyVaultName string = vault.name

output turnstileSecretName string = turnstileSecretName
output registryName string = registry.name
