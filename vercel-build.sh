#!/bin/bash

# Install Git LFS
git lfs install

# Fetch all LFS files
git lfs pull

# Run the Next.js build
pnpm build
