#!/bin/bash

# Define dynamic fields as environment variables
CHART_DIRECTORY="$1"
CHART_YAML="$2"
CHARTMUSEUM_URL="$3"
CHART_REPO="$4"
CHART_NAME="$5"

# Check current chart version
CURRENT_CHART_VERSION=$(grep -E '^version:' "$CHART_YAML" | awk '{print $2}')
echo "Current chart version: $CURRENT_CHART_VERSION"
echo "CURRENT_CHART_VERSION=$CURRENT_CHART_VERSION" >> "$GITHUB_ENV"

# Add ChartMuseum repository
helm repo add fetch-charts "$CHARTMUSEUM_URL"

# Update helm repository
helm repo update

# Search existing chart on ChartMuseum
CHART_SEARCH_RESULT=$(helm search repo "$CHART_REPO/$CHART_NAME" --versions -o json | jq -r ".[] | select(.version == \"$CURRENT_CHART_VERSION\")")
if [[ ! -z $CHART_SEARCH_RESULT ]]; then
  echo "Chart version already exists on ChartMuseum. Exiting..."
  exit 1
fi
