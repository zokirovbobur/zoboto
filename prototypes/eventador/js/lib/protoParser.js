/* ======================= src/lib/protoParser.js ======================= */
/* Mock proto parser — extracts services / rpc methods / message shapes from
   a free-text .proto file. Good enough for the UI demo; the real build
   service uses protoc to produce the OCI descriptor. */
function parseProtoText(text) {
  const out = { services: [], messages: {} };
  if (!text || typeof text !== 'string') return out;
  /* services + their methods */
  const svcRe = /service\s+([A-Za-z_][\w.]*)\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = svcRe.exec(text))) {
    const svcName = m[1];
    const body = m[2];
    const methods = [];
    const rpcRe = /rpc\s+([A-Za-z_]\w*)\s*\(\s*(stream\s+)?([A-Za-z_]\w*)\s*\)\s*returns\s*\(\s*(stream\s+)?([A-Za-z_]\w*)\s*\)/g;
    let rm;
    while ((rm = rpcRe.exec(body))) {
      const cliStream = !!rm[2];
      const srvStream = !!rm[4];
      const streaming = cliStream && srvStream ? 'bidi'
        : cliStream ? 'client-streaming'
        : srvStream ? 'server-streaming'
        : 'unary';
      methods.push({ name: rm[1], streaming, requestType: rm[3], responseType: rm[5] });
    }
    out.services.push({ name: svcName, methods });
  }
  /* messages with fields */
  const msgRe = /message\s+([A-Za-z_]\w*)\s*\{([\s\S]*?)\}/g;
  while ((m = msgRe.exec(text))) {
    const name = m[1];
    const body = m[2];
    const fields = {};
    const fieldRe = /^\s*(repeated\s+|optional\s+)?([\w.<>,]+)\s+(\w+)\s*=\s*\d+/gm;
    let fm;
    while ((fm = fieldRe.exec(body))) {
      const repeated = (fm[1] || '').trim() === 'repeated';
      fields[fm[3]] = repeated ? 'repeated ' + fm[2] : fm[2];
    }
    out.messages[name] = fields;
  }
  return out;
}

const DEFAULT_PROTO_TEMPLATE = `syntax = "proto3";
package payments;

service Checkout {
  rpc Charge (CheckoutRequest) returns (CheckoutResponse);
  rpc Refund (RefundRequest) returns (RefundResponse);
}

message CheckoutRequest {
  double amount = 1;
  string currency = 2;
  string customer_id = 3;
}
message CheckoutResponse {
  string transaction_id = 1;
  string status = 2;
}
message RefundRequest  { string transaction_id = 1; string reason = 2; }
message RefundResponse { string refund_id = 1; string status = 2; }
`;


/* ======================= src/store.jsx ======================= */
