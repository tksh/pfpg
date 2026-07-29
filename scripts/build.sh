#!/bin/bash
set -e

if command -v deno &> /dev/null  # Check the 'Deno' installed or not
then
    echo "Deno has already installed."
else
    echo "Deno is not installed. Starting installation..."
    curl -fsSL https://deno.land/install.sh | sh
    export DENO_INSTALL="$HOME/.deno"
    export PATH="$DENO_INSTALL/bin:$PATH"
fi


# Farm

# Remove previous sources
rm -rf ./farm/


# Setup
npx -y create-farm@latest "farm" --template "vanilla"

# deno run -A npm:create-farm@latest
# ✔ Project name => "farm"
# ✔ farm directory is not empty, do you want to overwrite? · yes
# - If already exists same name project directory, Farm will asked above question,
# - So you should be remove ./farm/ dir before 'create farm' to skip the qustion.
# ✔ Select a framework => "vanilla"
# - Valid templates are [vanilla, react, vue3, vue2, lit, svelte, solid, preact, nestjs, tauri, electron]


# Change directory
cd farm

# Install
deno add npm:alwan npm:core-js
deno install


# Remove sample files in 'farm/public' directory
rm -rf ./public/*

# Copy the original 'src' directory to 'farm/src/'
cp -r ../src/ ./


# Move the static assetss from 'farm/src' to 'farm/public' directory
for f in android-chrome-192x192.png \
         android-chrome-512x512.png \
         apple-touch-icon.png \
         favicon.ico \
         favicon.svg \
         site.webmanifest; do
    mv "./src/$f" "./public/$f" || exit 1
done

# Move the static assets to public/

# .webp files from 'farm/src/showcase_images' to 'farm/public/showcase_images'
mkdir -p ./public/showcase_images/
mv ./src/showcase_images/*.webp ./public/showcase_images/

# .wasm file from 'farm/src/resvg-js-wasm' to 'farm/public/resvg-js-wasm'
mkdir -p ./public/resvg-js-wasm/
mv ./src/resvg-js-wasm/* ./public/resvg-js-wasm/


# Check the copied files
echo "Check the list of files in ./farm/src/ directory."
ls -lh ./src/

echo "Check the list of files in ./farm/public/ directory."
ls -lh ./public/



# Generate the custom 'farm/farm.config.ts' to over written
deno run --allow-read --allow-write ../scripts/generate_farm_config_ts.ts



# Preprocess using TS scripts before Farm build

# # Remove 'console.log()' from JS or TS
find ./src/js -type f \( -name "*.js" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  deno run --allow-read --allow-write ../scripts/remove_console_logs.ts --input="$file" --output="$file"
done

# Remove '<script type="importmap"></script>' from HTML
find ./src/js -type f \( -name "*.html" \) -print0 | while IFS= read -r -d '' file; do
  deno run --allow-read --allow-write ../scripts/remove_importmap.ts --input="$file" --output="$file"
done



# Build with Farm into ./farm/build/
deno task build  # = 'farm build'


echo "Build complete."
