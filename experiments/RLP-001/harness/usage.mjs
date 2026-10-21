import fs from "node:fs";

// Agent-efficiency instrumentation from a worker's transcript (JSONL written
// by the agent runtime). Usage is taken from the last record of each API
// message id (streaming repeats ids with growing usage). Fields the
// transcript does not expose are reported as null (unavailable), never 0.

const parseLines = text => text.split("\n").filter(Boolean).flatMap(line => {
  try { return [JSON.parse(line)]; } catch { return []; }
});

const textOf = content => (Array.isArray(content) ? content.filter(c => c.type === "text").map(c => c.text).join("\n") : String(content ?? ""));

export const transcriptUsage = (file, workspace) => {
  if (!file || !fs.existsSync(file)) return { available: false, reason: `transcript not found: ${file}` };
  const records = parseLines(fs.readFileSync(file, "utf8"));
  const assistant = records.filter(r => r.type === "assistant" && r.message);
  const byId = assistant.reduce((acc, r) => acc.set(r.message.id ?? r.uuid, r), new Map());
  const messages = [...byId.values()];
  const sum = key => messages.reduce((s, r) => s + (r.message.usage?.[key] ?? 0), 0);
  const toolUses = [...new Map(assistant.flatMap(r => (r.message.content ?? []).filter(c => c.type === "tool_use")).map(t => [t.id, t])).values()];
  const toolResults = records.filter(r => r.type === "user").flatMap(r => (Array.isArray(r.message?.content) ? r.message.content : []).filter(c => c.type === "tool_result"));
  const toolResultChars = toolResults.reduce((s, c) => s + JSON.stringify(c.content ?? "").length, 0);
  const times = records.map(r => Date.parse(r.timestamp)).filter(Number.isFinite);
  const finalText = textOf(messages[messages.length - 1]?.message.content);
  const resultLine = /RESULT validation=(pass|fail) runs=(\d+)/.exec(finalText);
  const inputUncached = sum("input_tokens");
  const cacheCreation = sum("cache_creation_input_tokens");
  const cacheRead = sum("cache_read_input_tokens");
  const output = sum("output_tokens");
  return {
    available: true,
    models: [...new Set(messages.map(r => r.message.model))],
    apiMessages: messages.length,
    inputTokens: inputUncached + cacheCreation + cacheRead,
    inputUncachedTokens: inputUncached,
    cacheCreationTokens: cacheCreation,
    cacheReadTokens: cacheRead,
    outputTokens: output,
    totalTokens: inputUncached + cacheCreation + cacheRead + output,
    toolCalls: toolUses.length,
    toolCallsByName: toolUses.reduce((acc, t) => ({ ...acc, [t.name]: (acc[t.name] ?? 0) + 1 }), {}),
    // Tool output size is observable; its token count is not exposed per
    // call, so it is reported in characters.
    toolResultChars,
    toolTokens: null,
    durationMs: times.length ? Math.max(...times) - Math.min(...times) : null,
    reportedResult: resultLine ? { validation: resultLine[1], runs: Number(resultLine[2]) } : null,
    leakage: leakageAudit(toolUses, workspace)
  };
};

// Any tool call that names a path outside the attempt's workspace.
export const leakageAudit = (toolUses, workspace) => {
  const outside = /(?:\/home\/user|\/tmp|\/root)[^\s"'`;|&)]*/g;
  return toolUses.flatMap(t => {
    const text = JSON.stringify(t.input ?? {});
    const paths = [...text.matchAll(outside)].map(m => m[0]).filter(p => !p.startsWith(workspace));
    return paths.length ? [{ tool: t.name, paths: [...new Set(paths)].slice(0, 5) }] : [];
  });
};
