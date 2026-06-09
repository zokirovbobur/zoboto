/* ======================= src/screens/middleware.js =======================
   Middleware Proto Registry
   Alohida sahifa — proto fayllari orqali middleware ulanishlarini
   boshqarish, service discovery va gRPC endpoint mapping.
   ===================================================================== */

/* ---------- MiddlewareProtoDetail drawer ---------- */
function MiddlewareProtoDetail({ proto, onClose }) {
  const services = proto.services || [];
  const methodCount = services.reduce((n, s) => n + (s.methods || []).length, 0);
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'services',  label: `Services (${services.length})` },
    { id: 'methods',   label: `Methods (${methodCount})` },
    { id: 'mappings',  label: 'Flow Mappings' },
  ];

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{proto.Name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
            v{proto.Version} · OCI: <span className="mono" style={{ fontSize: 11 }}>{proto.Ref || 'not pushed'}</span>
          </div>
        </div>
        <Badge>{proto.Status || 'active'}</Badge>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none', border: 'none', padding: '8px 14px', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              color: activeTab === t.id ? 'var(--text)' : 'var(--muted)',
              borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid g2" style={{ gap: 12 }}>
          <Card title="Identity">
            <KV k="Name"><b>{proto.Name}</b></KV>
            <KV k="Version"><span className="mono">{proto.Version}</span></KV>
            <KV k="Status"><Badge>{proto.Status || 'active'}</Badge></KV>
            <KV k="OCI Ref"><span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{proto.Ref || '—'}</span></KV>
          </Card>
          <Card title="Stats">
            <KV k="Services">{services.length}</KV>
            <KV k="Methods">{methodCount}</KV>
            <KV k="Flow usage">{(proto.usedByFlows || []).length} flows</KV>
            <KV k="Last updated">just now</KV>
          </Card>
          {proto.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Card title="Description">
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{proto.description}</p>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Tab: Services */}
      {activeTab === 'services' && (
        services.length === 0
          ? <EmptyState icon="⛬" title="No services" sub="Upload a .proto file to parse its services." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {services.map((svc, i) => (
                <Card key={i} title={svc.name}
                  sub={`${(svc.methods || []).length} method${(svc.methods || []).length !== 1 ? 's' : ''}`}>
                  {(svc.methods || []).map((m, j) => (
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '6px 0', borderBottom: j < svc.methods.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--accent)', minWidth: 120 }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {m.inputType} → {m.outputType}
                      </span>
                      {m.clientStreaming && <Badge>client-stream</Badge>}
                      {m.serverStreaming && <Badge>server-stream</Badge>}
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          )
      )}

      {/* Tab: Methods (flat list) */}
      {activeTab === 'methods' && (
        <div className="tablecard">
          <table>
            <thead>
              <tr>
                {['Service', 'Method', 'Input', 'Output', 'Streaming'].map(c => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {services.flatMap(svc =>
                (svc.methods || []).map((m, j) => (
                  <tr key={`${svc.name}-${j}`}>
                    <td className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{svc.name}</td>
                    <td><b className="mono">{m.name}</b></td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{m.inputType}</td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{m.outputType}</td>
                    <td>
                      {m.clientStreaming && <Badge>client</Badge>}
                      {m.serverStreaming && <Badge>server</Badge>}
                      {!m.clientStreaming && !m.serverStreaming && <span style={{ color: 'var(--faint)' }}>unary</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Flow Mappings */}
      {activeTab === 'mappings' && (
        <div>
          <p className="hint" style={{ marginBottom: 16 }}>
            Flows that reference this proto via a gRPC trigger or step.
          </p>
          {(proto.usedByFlows || []).length === 0
            ? <EmptyState icon="⛓" title="No flows mapped" sub="Create a flow with a gRPC trigger to link it here." />
            : (
              <div className="tablecard">
                <table>
                  <thead><tr>{['Flow', 'Collection', 'Method used', 'Status'].map(c => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {(proto.usedByFlows || []).map((f, i) => (
                      <tr key={i}>
                        <td><b>{f.name}</b></td>
                        <td className="mono" style={{ fontSize: 12 }}>{f.collection}</td>
                        <td className="mono" style={{ fontSize: 12 }}>{f.method}</td>
                        <td><Badge>{f.status || 'live'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

/* ---------- MiddlewareServiceMap component ---------- */
function MiddlewareServiceMap({ protos }) {
  const allServices = protos.flatMap(p =>
    (p.services || []).map(s => ({ ...s, protoName: p.Name, protoVersion: p.Version }))
  );

  if (allServices.length === 0) return (
    <EmptyState icon="🔌" title="No services discovered"
      sub="Upload proto files to see the service topology here." />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {allServices.map((svc, i) => (
        <div key={i} style={{
          background: 'var(--panel)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>⚙</span>
            <div>
              <div style={{ fontWeight: 700 }}>{svc.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                from <span className="mono">{svc.protoName}@{svc.protoVersion}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(svc.methods || []).map((m, j) => (
                <span key={j} style={{
                  background: 'var(--panel3)', border: '1px solid var(--border2)',
                  borderRadius: 20, padding: '2px 10px', fontSize: 11,
                  fontFamily: 'var(--mono)', color: 'var(--accent)',
                }}>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- MiddlewareEndpointBuilder component ---------- */
function MiddlewareEndpointBuilder({ protos, onSave }) {
  const [selectedProto, setSelectedProto] = React.useState('');
  const [selectedService, setSelectedService] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('');
  const [endpointPath, setEndpointPath] = React.useState('');
  const [authMode, setAuthMode] = React.useState('none');

  const proto = protos.find(p => p.id === selectedProto);
  const services = proto?.services || [];
  const service = services.find(s => s.name === selectedService);
  const methods = service?.methods || [];

  React.useEffect(() => {
    if (selectedProto && selectedService && selectedMethod) {
      setEndpointPath(`/grpc/${selectedService.toLowerCase()}/${selectedMethod.toLowerCase()}`);
    }
  }, [selectedProto, selectedService, selectedMethod]);

  const inputStyle = {
    width: '100%', background: 'var(--panel2)', border: '1px solid var(--border2)',
    color: 'var(--text)', borderRadius: 'var(--r-sm)', padding: '8px 12px',
    fontFamily: 'inherit', fontSize: 13,
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p className="hint">Build a new HTTP→gRPC middleware endpoint by selecting a proto service and method.</p>

      <div className="grid g3" style={{ gap: 12 }}>
        {/* Proto selector */}
        <div>
          <label style={labelStyle}>Proto</label>
          <select style={inputStyle} value={selectedProto}
            onChange={e => { setSelectedProto(e.target.value); setSelectedService(''); setSelectedMethod(''); }}>
            <option value="">— select proto —</option>
            {protos.map(p => (
              <option key={p.id} value={p.id}>{p.Name}@{p.Version}</option>
            ))}
          </select>
        </div>

        {/* Service selector */}
        <div>
          <label style={labelStyle}>Service</label>
          <select style={inputStyle} value={selectedService}
            disabled={!selectedProto}
            onChange={e => { setSelectedService(e.target.value); setSelectedMethod(''); }}>
            <option value="">— select service —</option>
            {services.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Method selector */}
        <div>
          <label style={labelStyle}>Method</label>
          <select style={inputStyle} value={selectedMethod}
            disabled={!selectedService}
            onChange={e => setSelectedMethod(e.target.value)}>
            <option value="">— select method —</option>
            {methods.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedMethod && (
        <>
          <div className="grid g2" style={{ gap: 12 }}>
            <div>
              <label style={labelStyle}>HTTP Endpoint path</label>
              <input type="text" style={inputStyle} value={endpointPath}
                onChange={e => setEndpointPath(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Auth mode</label>
              <select style={inputStyle} value={authMode} onChange={e => setAuthMode(e.target.value)}>
                <option value="none">None</option>
                <option value="api-key">API Key</option>
                <option value="jwt">JWT</option>
                <option value="mtls">mTLS</option>
              </select>
            </div>
          </div>

          {/* Preview box */}
          <div style={{
            background: 'var(--panel2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', padding: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Endpoint preview
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.8 }}>
              <div><span style={{ color: 'var(--accent)' }}>POST</span> <span style={{ color: 'var(--text)' }}>{endpointPath}</span></div>
              <div style={{ color: 'var(--faint)' }}>→ gRPC {selectedService}/{selectedMethod}</div>
              <div style={{ color: 'var(--faint)' }}>auth: {authMode}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn onClick={() => { setSelectedProto(''); setSelectedService(''); setSelectedMethod(''); }}>
              Reset
            </Btn>
            <Btn kind="pri" onClick={() => onSave && onSave({ proto: selectedProto, service: selectedService, method: selectedMethod, path: endpointPath, auth: authMode })}>
              Create endpoint
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Main MiddlewareProtos screen ---------- */
function MiddlewareProtos() {
  const { db, openDrawer, confirm, toast } = useApp();
  const protos = db.protos || [];
  const [activeTab, setActiveTab] = React.useState('registry');

  // Inject some mock extra data for middleware context
  const enrichedProtos = protos.map(p => ({
    ...p,
    Status: 'active',
    description: p.description || 'Protocol buffer contract for gRPC-based middleware integration.',
    usedByFlows: (db.flows || [])
      .filter(f => f.Trigger === 'gRPC' && Math.random() > 0.5)
      .slice(0, 2)
      .map(f => ({ name: f.Flow, collection: f.Collection, method: 'Execute', status: f.State })),
  }));

  const openDetail = (proto) => openDrawer({
    title: proto.Name + '@' + proto.Version,
    sub: 'middleware proto · read-only preview',
    content: <MiddlewareProtoDetail proto={proto} />,
    saveLabel: 'Close',
    onSave: () => {},
  });

  const handleNewEndpoint = (cfg) => {
    toast && toast(`Endpoint created: ${cfg.path}`);
  };

  const tabs = [
    { id: 'registry',   label: 'Proto Registry' },
    { id: 'services',   label: 'Service Map' },
    { id: 'endpoints',  label: 'Endpoint Builder' },
  ];

  return (
    <div className="page">
      <PageHead
        crumb={<Crumb extra="Middleware · Protos" />}
        title="Middleware Proto Registry"
        desc="Manage Protocol Buffer contracts used by gRPC middleware integrations. Upload, version and map .proto files to flow triggers and HTTP endpoints."
        docref="ADR-0015 · middleware §3"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => toast && toast('Proto upload coming soon')}>↑ Upload .proto</Btn>
            <Btn kind="pri" onClick={() => toast && toast('Push to OCI registry coming soon')}>Push to OCI</Btn>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid g4 mb">
        <Metric k="Protos" v={String(protos.length)} d="registered contracts" dk="flat" />
        <Metric k="Services"
          v={String(protos.reduce((n, p) => n + (p.services || []).length, 0))}
          d="across all protos" dk="flat" />
        <Metric k="Methods"
          v={String(protos.reduce((n, p) => n + (p.services || []).reduce((m, s) => m + (s.methods || []).length, 0), 0))}
          d="total RPC methods" dk="flat" />
        <Metric k="Endpoints" v="0" d="middleware mappings" dk="flat" />
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, borderBottom: '1px solid var(--border)',
        marginBottom: 20,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none', border: 'none', padding: '9px 16px', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              color: activeTab === t.id ? 'var(--text)' : 'var(--muted)',
              borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Proto Registry */}
      {activeTab === 'registry' && (
        enrichedProtos.length === 0
          ? (
            <EmptyState icon="⛬" title="No protos in this workspace"
              sub={<>Upload your first <span className="mono">.proto</span> file to register it.</>} />
          ) : (
            <div className="tablecard">
              <table>
                <thead>
                  <tr>
                    {['Name', 'Version', 'Services', 'Methods', 'Status', 'OCI ref', 'Last update', ''].map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {enrichedProtos.map(p => {
                    const svcCount = (p.services || []).length;
                    const mCount = (p.services || []).reduce((n, s) => n + (s.methods || []).length, 0);
                    return (
                      <tr key={p.id} className="clickable" onClick={() => openDetail(p)}>
                        <td><b>{p.Name}</b></td>
                        <td className="mono">{p.Version}</td>
                        <td>{svcCount}</td>
                        <td>{mCount}</td>
                        <td><Badge>{p.Status}</Badge></td>
                        <td className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{p.Ref || '—'}</td>
                        <td style={{ color: 'var(--faint)', fontSize: 12 }}>just now</td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                          onClick={e => e.stopPropagation()}>
                          <Btn sm onClick={() => openDetail(p)}>👁 View</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
      )}

      {/* Tab: Service Map */}
      {activeTab === 'services' && (
        <MiddlewareServiceMap protos={enrichedProtos} />
      )}

      {/* Tab: Endpoint Builder */}
      {activeTab === 'endpoints' && (
        <MiddlewareEndpointBuilder protos={enrichedProtos} onSave={handleNewEndpoint} />
      )}
    </div>
  );
}
