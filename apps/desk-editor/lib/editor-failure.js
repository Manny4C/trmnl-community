// Only these fixed labels may leave the curator. Never persist provider messages,
// source text, request headers, credentials or raw model output in diagnostics.
const CODES=new Set(['credential_missing','provider_http_error','provider_timeout','provider_network_error','provider_json_invalid','response_incomplete_tokens','response_incomplete_filter','response_incomplete','response_failed','response_refused','output_missing','output_json_invalid','output_invalid','output_coverage_invalid','snapshot_publish_failed','curator_unavailable']);
export function editorFailure(code,status){const e=Error('Newsflash editor unavailable; no automatic retry.');e.editorDiagnosticCode=CODES.has(code)?code:'curator_unavailable';if(Number.isInteger(status)&&status>=100&&status<=599)e.status=status;return e;}
export function diagnosticCode(error){return CODES.has(error?.editorDiagnosticCode)?error.editorDiagnosticCode:'curator_unavailable';}
