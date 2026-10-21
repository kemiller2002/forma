#!/bin/sh
# Collect every finished attempt of a phase that has a notification entry and
# no result yet. usage: collect-phase.sh PHASE
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
phase=$1
node -e '
const fs=require("fs"),p=process.argv[1],ph=process.argv[2];
const ag=require(`${p}/results/${ph}/agents.json`),no=require(`${p}/results/${ph}/notifications.json`);
for (const [att,[tok,tools,ms]] of Object.entries(no)) {
  if (fs.existsSync(`${p}/results/${ph}/attempts/${att}.json`)) continue;
  console.log([att,`${ag.transcriptDir}/agent-${ag.attempts[att]}.jsonl`,tok,tools,ms].join(" "));
}' "$here" "$phase" | while read att tr tok tools ms; do
  node "$here/harness/collect.mjs" --manifest "$here/results/$phase/manifest.json" --attempt "$att" --transcript "$tr" --notification-tokens "$tok" --notification-tools "$tools" --notification-ms "$ms"
done
