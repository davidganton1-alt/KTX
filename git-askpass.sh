#!/bin/sh
# Git credential helper for Docker preview container
# Provides the GitHub token for git pull operations
echo "username=davidganton1-alt"
echo "password=$GH_TOKEN"
