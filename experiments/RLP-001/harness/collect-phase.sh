#!/bin/sh
# Collect every attempt of a phase listed in agents.json that has no result
# yet. Runtime notification figures (final context tokens, tool uses,
# duration) are added when notifications.json has them; transcripts are the
# primary usage source. usage: collect-phase.sh PHASE [PARALLEL]
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
phase=$1
parallel=${2:-1}
node -e '
const fs=require("fs"),p=process.argv[1],ph=process.argv[2];
const ag=require(`${p}/results/${ph}/agents.json`);
const nf=`${p}/results/${ph}/notifications.json`, no=fs.existsSync(nf)?require(nf):{};
for (const [att,agent] of Object.entries(ag.attempts)) {
  if (fs.existsSync(`${p}/results/${ph}/attempts/${att}.json`)) continue;
  const [tok,tools,ms]=no[att]??[];
  const args=["--manifest",`${p}/results/${ph}/manifest.json`,"--attempt",att,"--transcript",`${ag.transcriptDir}/agent-${agent}.jsonl`,...(tok?["--notification-tokens",tok,"--notification-tools",tools,"--notification-ms",ms]:[])];
  console.log(args.join(" "));
}' "$here" "$phase" | xargs -P "$parallel" -L 1 node "$here/harness/collect.mjs"
