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

# Build the production site into ./dist/
deno task build

echo "Build complete."
