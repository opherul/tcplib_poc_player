const lab_status = "SUCCESS";
const total_score = 3;
const events = [{ "step": 1, "description": "Host A (eth0) sends a message to unknown Host B. Switch floods the packet.", "sender_port": "eth0", "packet_summary": { "src": "AA:AA:AA:AA:AA:AA", "dst": "BB:BB:BB:BB:BB:BB", "type": "Flooding", "payload": "Are you there B?" }, "state": { "table_before": {}, "table_after": { "AA:AA:AA:AA:AA:AA": "eth0" } }, "evaluation": { "passed": true, "expected": ["eth1", "eth2"], "actual": ["eth1", "eth2"], "feedback": "Perfect match." } }, { "step": 2, "description": "Host B (eth1) replies to known Host A. Switch forwards directly.", "sender_port": "eth1", "packet_summary": { "src": "BB:BB:BB:BB:BB:BB", "dst": "AA:AA:AA:AA:AA:AA", "type": "Direct Forwarding", "payload": "Yes, I am here A!" }, "state": { "table_before": { "AA:AA:AA:AA:AA:AA": "eth0" }, "table_after": { "AA:AA:AA:AA:AA:AA": "eth0", "BB:BB:BB:BB:BB:BB": "eth1" } }, "evaluation": { "passed": true, "expected": ["eth0"], "actual": ["eth0"], "feedback": "Perfect match." } }, { "step": 3, "description": "Host C (eth2) sends a Broadcast frame. Switch copies it to all other ports.", "sender_port": "eth2", "packet_summary": { "src": "CC:CC:CC:CC:CC:CC", "dst": "FF:FF:FF:FF:FF:FF", "type": "Broadcast", "payload": "Who has IP 10.0.0.1?" }, "state": { "table_before": { "AA:AA:AA:AA:AA:AA": "eth0", "BB:BB:BB:BB:BB:BB": "eth1" }, "table_after": { "AA:AA:AA:AA:AA:AA": "eth0", "BB:BB:BB:BB:BB:BB": "eth1", "CC:CC:CC:CC:CC:CC": "eth2" } }, "evaluation": { "passed": true, "expected": ["eth0", "eth1"], "actual": ["eth0", "eth1"], "feedback": "Perfect match." } }];
const react_frontend_data = {
  lab_status,
  total_score,
  events
};
export {
  react_frontend_data as default,
  events,
  lab_status,
  total_score
};
