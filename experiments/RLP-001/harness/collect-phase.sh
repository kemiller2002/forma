#!/bin/sh
# Score every finished, uncollected attempt of a phase.
# usage: collect-phase.sh PHASE [PARALLEL]
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node "$here/harness/pending.mjs" "$1" | xargs -r -P "${2:-1}" -L 1 node "$here/harness/collect.mjs"
