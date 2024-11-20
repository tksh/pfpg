#!/bin/bash
set -e

if command -v bun &> /dev/null  # Check the 'Bun' installed or not
then
    echo "Bun has already installed."
else
    echo "Bun is not installed. Starting installation..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL=\"$HOME/.bun\"
    export PATH=\"$BUN_INSTALL/bin:$PATH\"
fi


# Farm

# Remove previous sources
rm -rf ./farm/

# Setup
bun create farm@latest "farm" --template "vanilla"

# bun create farm@latest
# ✔ Project name => "farm"
# ✔ farm directory is not empty, do you want to overwrite? · yes
# - If already exists same name project directory, Farm will asked above question,
# - So you should be remove ./farm/ dir before 'create farm' to skip the qustion.
# ✔ Select a framework => "vanilla"
# - Valid templates are [vanilla, react, vue3, vue2, lit, svelte, solid, preact, nestjs, tauri, electron]

# Change directory
cd farm

# Install
bun install


# Remove sample files in 'farm/public' directory
rm -rf ./public/*

# Copy the public files from 'src' directory
for f in android-chrome-192x192.png \
          android-chrome-512x512.png \
          apple-touch-icon.png \
          favicon.ico \
          favicon.svg \
          site.webmanifest; do
    cp "../src/$f" "./public/$f" || exit 1
done

# Copy the original 'src' directory to 'farm/src/'
cp -r ../src/ ./


# Generate the custom 'farm/farm.config.ts' to over written
bun ../scripts/generate_farm_config_ts.ts



# Preprocess using TS scripts before Farm build

# Remove 'console.log()' from JS or TS
find ./src/js -type f \( -name "*.js" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  bun ../scripts/remove_console_logs.ts --input="$file" --output="$file"
done

# Remove '<script type="importmap"></script>' from HTML
find ./src/js -type f \( -name "*.html" \) -print0 | while IFS= read -r -d '' file; do
  bun ../scripts/remove_importmap.ts --input="$file" --output="$file"
done



# Build with Farm into ./farm/build/
bun run build  # = 'farm build'


echo "Build complete."