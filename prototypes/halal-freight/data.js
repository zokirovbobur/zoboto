/* ============================================================
   Halal Freight Finance — Mock data
   ============================================================ */
window.HFF_DATA = (function () {
  const fmt = (n) => "$" + Number(n).toLocaleString("en-US");

  const carrier = {
    name: "Baraka Logistics LLC",
    owner: "Ali Karimov",
    dot: "3849201",
    mc: "MC-928411",
    type: "Owner-operator (LLC)",
    fleet: 3,
    states: ["TX", "OK", "AR", "NM", "LA"],
    safety: "Satisfactory",
    mcAge: "4 yrs 2 mo",
    email: "ali@barakalogistics.com",
    phone: "(469) 555-0148",
    address: "1420 Trade Center Blvd, Dallas, TX 75247",
    limit: 38000,
    used: 14500,
    repeat: 11,
  };

  const brokers = {
    northbridge: {
      name: "NorthBridge Freight Brokers",
      mc: "MC-771204",
      daysToPay: 28,
      avgDays: 31,
      onTime: 94,
      disputes: 1,
      credit: "A− (Low risk)",
      creditTone: "green",
      paid: 142,
    },
    summit: {
      name: "Summit Carriers Exchange",
      mc: "MC-655019",
      daysToPay: 47,
      avgDays: 52,
      onTime: 71,
      disputes: 4,
      credit: "BB (Watch)",
      creditTone: "amber",
      paid: 63,
    },
    cleardrop: {
      name: "ClearDrop Logistics Inc",
      mc: "MC-902551",
      daysToPay: 22,
      avgDays: 25,
      onTime: 97,
      disputes: 0,
      credit: "A (Low risk)",
      creditTone: "green",
      paid: 208,
    },
  };

  // primary featured request
  const featured = {
    id: "FR-20418",
    carrier: carrier.name,
    owner: carrier.owner,
    broker: brokers.northbridge.name,
    brokerKey: "northbridge",
    load: "LD-77-3920",
    pickup: "Dallas, TX",
    delivery: "Memphis, TN",
    pickupDate: "Jun 02, 2026",
    deliveryDate: "Jun 05, 2026",
    terms: "Net 30",
    invoice: 5000,
    advance: 4500,
    fee: 150,
    reserve: 350,
    score: 84,
    risk: "Low Risk",
    status: "Approved",
    bol: "BOL-558120",
    pod: true,
    submitted: "Jun 06, 2026",
  };

  // dashboard recent requests (carrier)
  const carrierRequests = [
    { id: "FR-20418", broker: "NorthBridge Freight Brokers", load: "LD-77-3920", lane: "Dallas, TX → Memphis, TN", invoice: 5000, advance: 4500, fee: 150, status: "Approved", date: "Jun 06", score: 84 },
    { id: "FR-20392", broker: "ClearDrop Logistics Inc", load: "LD-77-3854", lane: "Houston, TX → Atlanta, GA", invoice: 7200, advance: 6480, fee: 216, status: "Funded", date: "Jun 04", score: 91 },
    { id: "FR-20355", broker: "ClearDrop Logistics Inc", load: "LD-77-3781", lane: "Dallas, TX → Phoenix, AZ", invoice: 4100, advance: 3690, fee: 123, status: "Broker Paid", date: "May 29", score: 88 },
    { id: "FR-20311", broker: "Summit Carriers Exchange", load: "LD-77-3699", lane: "El Paso, TX → Denver, CO", invoice: 6300, advance: 5355, fee: 189, status: "Under Review", date: "May 27", score: 76 },
    { id: "FR-20288", broker: "NorthBridge Freight Brokers", load: "LD-77-3640", lane: "Dallas, TX → Nashville, TN", invoice: 3800, advance: 3420, fee: 114, status: "Settled", date: "May 22", score: 86 },
    { id: "FR-20240", broker: "Summit Carriers Exchange", load: "LD-77-3588", lane: "Austin, TX → Kansas City, MO", invoice: 5500, advance: 0, fee: 0, status: "Draft", date: "May 20", score: null },
  ];

  // admin review queue
  const adminQueue = [
    { id: "FR-20431", carrier: "Crescent Haul Co", broker: "Summit Carriers Exchange", brokerTone: "amber", invoice: 8200, advance: 6560, score: 62, risk: "Medium", verify: "Manual review", status: "Manual review", flag: "manual" },
    { id: "FR-20429", carrier: "Baraka Logistics LLC", broker: "NorthBridge Freight Brokers", brokerTone: "green", invoice: 5000, advance: 4500, score: 84, risk: "Low", verify: "Passed", status: "Auto approve", flag: "auto" },
    { id: "FR-20427", carrier: "Silk Road Carriers", broker: "ClearDrop Logistics Inc", brokerTone: "green", invoice: 6400, advance: 5760, score: 89, risk: "Low", verify: "Passed", status: "Auto approve", flag: "auto" },
    { id: "FR-20425", carrier: "Atlas Owner-Op", broker: "Summit Carriers Exchange", brokerTone: "amber", invoice: 9100, advance: 0, score: 38, risk: "High", verify: "POD missing", status: "High risk", flag: "high" },
    { id: "FR-20422", carrier: "Noor Transit LLC", broker: "ClearDrop Logistics Inc", brokerTone: "green", invoice: 4700, advance: 4230, score: 81, risk: "Low", verify: "Awaiting docs", status: "Awaiting documents", flag: "docs" },
    { id: "FR-20419", carrier: "Hilal Freight Group", broker: "Summit Carriers Exchange", brokerTone: "amber", invoice: 7800, advance: 5850, score: 58, risk: "Medium", verify: "Broker overdue", status: "Broker overdue", flag: "overdue" },
    { id: "FR-20417", carrier: "Granite Lane Trucking", broker: "ClearDrop Logistics Inc", brokerTone: "green", invoice: 3300, advance: 2970, score: 92, risk: "Low", verify: "Passed", status: "Auto approve", flag: "auto" },
    { id: "FR-20414", carrier: "Cedar Mile Logistics", broker: "Summit Carriers Exchange", brokerTone: "amber", invoice: 5600, advance: 4200, score: 66, risk: "Medium", verify: "Manual review", status: "Manual review", flag: "manual" },
  ];

  // collections / settlement
  const collections = [
    { id: "FR-20392", broker: "ClearDrop Logistics Inc", invoice: 7200, advance: 6480, fee: 216, due: "Jun 18, 2026", daysLeft: 3, status: "Awaiting payment", tone: "blue" },
    { id: "FR-20355", broker: "ClearDrop Logistics Inc", invoice: 4100, advance: 3690, fee: 123, due: "Jun 12, 2026", daysLeft: -3, status: "Payment received", tone: "green" },
    { id: "FR-20311", broker: "Summit Carriers Exchange", invoice: 6300, advance: 5355, fee: 189, due: "Jun 09, 2026", daysLeft: -6, status: "Overdue", tone: "red" },
    { id: "FR-20288", broker: "NorthBridge Freight Brokers", invoice: 3800, advance: 3420, fee: 114, due: "Jun 05, 2026", daysLeft: -10, status: "Settled", tone: "gray" },
    { id: "FR-20274", broker: "Summit Carriers Exchange", invoice: 5900, advance: 5015, fee: 177, due: "Jun 20, 2026", daysLeft: 5, status: "Awaiting payment", tone: "blue" },
  ];

  // scoring weights
  const scoring = [
    { key: "broker", label: "Broker payment risk", weight: 50, score: 88, tone: "green", desc: "Days-to-pay, dispute history, credit standing of the paying broker." },
    { key: "carrier", label: "Carrier legitimacy risk", weight: 25, score: 90, tone: "green", desc: "DOT/MC active status, authority age, FMCSA safety rating." },
    { key: "document", label: "Document fraud risk", weight: 20, score: 79, tone: "green", desc: "BOL/POD match, signature detection, OCR confidence, duplicate factoring check." },
    { key: "route", label: "Route / GPS risk", weight: 5, score: 72, tone: "amber", desc: "ELD/GPS route reconciliation against the rate confirmation lane." },
  ];

  const rules = [
    { cond: "MC authority age < 6 months", action: "Manual review", tone: "amber" },
    { cond: "Proof of Delivery missing", action: "Reject or manual review", tone: "red" },
    { cond: "Broker average days-to-pay > 45", action: "Lower advance %", tone: "amber" },
    { cond: "Duplicate invoice detected", action: "Reject", tone: "red" },
    { cond: "Document confidence < 80%", action: "Manual review", tone: "amber" },
    { cond: "Invoice amount anomaly vs. lane", action: "Manual review", tone: "amber" },
  ];

  // shariah exceptions
  const shariahLog = [
    { date: "Jun 10, 2026", ref: "FR-20419", event: "Late-payment penalty flag auto-removed (no penalty interest permitted)", status: "Resolved", tone: "green" },
    { date: "Jun 04, 2026", ref: "FR-20392", event: "Fee verified as fixed Wakalah service fee, not debt discount", status: "Cleared", tone: "green" },
    { date: "May 28, 2026", ref: "FR-20355", event: "Reserve release reconciled after broker settlement", status: "Cleared", tone: "green" },
    { date: "May 21, 2026", ref: "FR-20240", event: "Manual check: advance structured as Qard Hasan (benevolent, no markup)", status: "Cleared", tone: "green" },
  ];

  // reports / analytics
  const reports = {
    fundedVolume: 1284500,
    wakalahRevenue: 38540,
    avgAdvancePct: 89,
    lossRate: 0.7,
    avgBrokerDays: 33,
    repeatUsage: 68,
    manualRatio: 22,
    autoRatio: 78,
    shariahExceptions: 4,
    monthly: [
      { m: "Jan", v: 142 }, { m: "Feb", v: 168 }, { m: "Mar", v: 195 },
      { m: "Apr", v: 221 }, { m: "May", v: 258 }, { m: "Jun", v: 300 },
    ],
    brokerDays: [
      { b: "ClearDrop", d: 25 }, { b: "NorthBridge", d: 31 }, { b: "Summit", d: 52 },
    ],
  };

  const docExtract = [
    { field: "Invoice amount", value: "$5,000.00", conf: 99 },
    { field: "Broker name", value: "NorthBridge Freight Brokers", conf: 97 },
    { field: "Load number", value: "LD-77-3920", conf: 98 },
    { field: "Delivery date", value: "Jun 05, 2026", conf: 95 },
    { field: "BOL number", value: "BOL-558120", conf: 96 },
    { field: "POD signature", value: "Detected — R. Mason", conf: 92 },
    { field: "Route match", value: "Dallas, TX → Memphis, TN", conf: 88 },
  ];

  const verifyChecks = [
    { label: "Carrier DOT / MC active", status: "ok", meta: "DOT 3849201 · MC-928411" },
    { label: "Broker verified", status: "ok", meta: "NorthBridge · MC-771204" },
    { label: "Proof of Delivery detected", status: "ok", meta: "Signed Jun 05" },
    { label: "BOL matched with invoice", status: "ok", meta: "BOL-558120" },
    { label: "Duplicate invoice check", status: "ok", meta: "No prior factoring found" },
    { label: "GPS / route match", status: "ok", meta: "88% lane match" },
    { label: "High-risk anomaly scan", status: "ok", meta: "No anomalies" },
  ];

  return { fmt, carrier, brokers, featured, carrierRequests, adminQueue, collections, scoring, rules, shariahLog, reports, docExtract, verifyChecks };
})();
