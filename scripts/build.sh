#!/bin/bash
set -e

# NetlifyにプリインストールされているDenoを無視し、最新版をインストール
curl -fsSL https://deno.land/install.sh | sh
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# バージョン確認用ログ
deno --version

# Install
deno install

# Build with `deno bundle` into ./dist/, and then remove console.log statements from the bundled files
deno task build && deno task remove:console

echo "Build complete."
