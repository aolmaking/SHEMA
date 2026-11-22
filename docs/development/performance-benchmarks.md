# Performance Benchmarks & Measurement Protocols

## 1. Interaction Pipeline Target Budgets

| Metric | Target (60 Hz) | Target (120 Hz) | Critical Upper Bound |
| :--- | :--- | :--- | :--- |
| **Pointer Handler Work** | < 2.0 ms | < 1.0 ms | > 5.0 ms |
| **Main Thread Frame Work** | < 16.67 ms | < 8.33 ms | > 33.3 ms (dropped frame) |
| **Geometry Calculation** | < 1.5 ms | < 0.8 ms | > 4.0 ms |
| **IPC Message Roundtrip** | < 3.0 ms | < 1.5 ms | > 8.0 ms |
| **Active Resize Disk I/O** | 0 ms (Zero I/O) | 0 ms (Zero I/O) | Any sync disk write |

---

## 2. Profiling Methodology

* **Scenario**: Drag and resize widget continuously across dimensions (e.g. 144x144 to 480x320 and back) over 500 interaction cycles.
* **Diagnostics**: Measure execution times of `geo.resizeFrom`, `calculateAdaptiveLayout`, `shell.js` rAF event processing, and memory allocation delta.
