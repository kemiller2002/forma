#!/usr/bin/env bash
# Install the Forma presentation assets pinned in a site's forma.lock.
#
# usage: install.sh [--lock FILE] [--source DIR] [--output DIR] [--update]
#
#   --lock FILE    lock file to read (default: forma.lock)
#   --source DIR   copy assets from a local directory instead of downloading
#                  (a Forma checkout's dist/marketing, or an offline cache)
#   --output DIR   override the lock's destination directory
#   --update       record the sha256 of each asset in the lock instead of
#                  verifying it; use only when deliberately pinning a new
#                  version (the release's own checksum file is still checked
#                  when downloading)
#
# Exit codes: 0 installed, 2 usage or lock error, 3 checksum mismatch,
# 4 asset unavailable. Needs only bash, curl, and sha256sum or shasum.
set -euo pipefail

lock="forma.lock"
source_dir="${FORMA_SOURCE:-}"
output=""
update=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --lock) lock="${2:?--lock requires a file}"; shift 2 ;;
    --source) source_dir="${2:?--source requires a directory}"; shift 2 ;;
    --output) output="${2:?--output requires a directory}"; shift 2 ;;
    --update) update=1; shift ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "forma: unknown argument '$1'" >&2; exit 2 ;;
  esac
done

[ -f "$lock" ] || { echo "forma: lock file '$lock' not found" >&2; exit 2; }

digest() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1
  else shasum -a 256 "$1" | cut -d' ' -f1; fi
}

version=""; repository="kemiller2002/forma"; destination=""
assets=(); pins=()
set -f
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%%#*}"
  set -- $line
  [ "$#" -eq 0 ] && continue
  case "$1" in
    forma) version="${2:-}" ;;
    repository) repository="${2:-}" ;;
    destination) destination="${2:-}" ;;
    asset) assets+=("${2:-}"); pins+=("${3:-sha256:unpinned}") ;;
    *) echo "forma: unknown lock directive '$1' in $lock" >&2; exit 2 ;;
  esac
done < "$lock"

[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "forma: lock must pin an exact version (forma X.Y.Z)" >&2; exit 2; }
[[ "$repository" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || { echo "forma: invalid repository '$repository'" >&2; exit 2; }
[ "${#assets[@]}" -gt 0 ] || { echo "forma: lock lists no assets" >&2; exit 2; }
destination="${output:-$destination}"
[ -n "$destination" ] || { echo "forma: lock has no destination" >&2; exit 2; }

base="https://github.com/$repository/releases/download/v$version"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

fetch() {
  local name="$1" target="$2"
  if [ -n "$source_dir" ]; then
    [ -f "$source_dir/$name" ] || { echo "forma: $name not found in $source_dir" >&2; exit 4; }
    cp "$source_dir/$name" "$target"
  else
    curl -fsSL --retry 3 --retry-delay 2 -o "$target" "$base/$name" \
      || { echo "forma: could not download $base/$name" >&2; exit 4; }
  fi
}

# The release publishes its own checksums; downloaded assets must match them.
fetch "forma-marketing.sha256" "$work/release.sha256"

for i in "${!assets[@]}"; do
  name="${assets[$i]}"
  [[ "$name" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "forma: invalid asset name '$name'" >&2; exit 2; }
  fetch "$name" "$work/$name"
  actual="$(digest "$work/$name")"
  released="$(awk -v f="$name" '$2 == f { print $1 }' "$work/release.sha256")"
  [ "$actual" = "$released" ] || { echo "forma: $name does not match the release checksum for v$version" >&2; exit 3; }
  if [ "$update" -eq 1 ]; then
    pins[$i]="sha256:$actual"
  elif [ "${pins[$i]}" != "sha256:$actual" ]; then
    echo "forma: $name sha256 $actual does not match the pin ${pins[$i]} in $lock" >&2
    exit 3
  fi
done

mkdir -p "$destination"
for name in "${assets[@]}"; do
  mv "$work/$name" "$destination/$name"
done

if [ "$update" -eq 1 ]; then
  {
    echo "# Forma presentation pin. Upgrade deliberately: change the version, run"
    echo "# install.sh --update, review the release notes, and commit this file."
    echo "forma $version"
    echo "repository $repository"
    echo "destination ${output:-$destination}"
    for i in "${!assets[@]}"; do echo "asset ${assets[$i]} ${pins[$i]}"; done
  } > "$work/forma.lock"
  mv "$work/forma.lock" "$lock"
  echo "forma: pinned v$version in $lock"
fi

echo "forma: installed ${#assets[@]} asset(s) from Forma v$version into $destination"
