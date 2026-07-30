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


# Remove previous sources
rm -rf ./dist/

# Install
deno install

# Build with `deno bundle` into ./build/
deno task build

echo "Build complete."
