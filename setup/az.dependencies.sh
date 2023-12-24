#!/bin/sh
#set -x


uniqueName=${1:-$(printf '%x' $RANDOM)}
rgName="aishop-${uniqueName}"

# Get signed in user objectId (PrincipalId)...
objectId=$(az ad signed-in-user show --query id -o tsv)

# Create resource group...
az group create -n $rgName -l westeurope >/dev/null

# Deploy infra...
DEPLOY_OUTPUT=$(az deployment group create -g $rgName  --template-file ./setup/infra/main.bicep  --parameters uniqueName=${uniqueName} objectId=${objectId} --query [properties.outputs.cosmosConnectionURL.value,properties.outputs.storageAccountName.value] -o tsv)

# Set env vars...
export AISHOP_MONGO_CONNECTION_STR=$(echo $DEPLOY_OUTPUT | cut -f 1 -d ' ')
export AISHOP_STORAGE_ACCOUNT=$(echo $DEPLOY_OUTPUT | cut -f 2 -d ' ')
export AISHOP_IMAGE_CONTAINER=images


printenv | grep AISHOP_.*= | sed 's/AZ_\([^=]*=\)\(.*\)/\1\2/' 