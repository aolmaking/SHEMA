# Practical Development, Testing & Verification Workflows

## 1. Quick Verification Commands

```powershell
# Run the pure layout optimization & motion tests (144 combinations)
npm run test:adaptive-container

# Run desktop grid snapping & collision avoidance tests
node scripts/test_snap_to_grid_toggle_and_regular_partitioning.js
node scripts/test_folder_collision_and_compact_size.js

# Run detach & drag-out integrity test
node scripts/test_detach_and_drag_out_not_disappearing.js

# Run comprehensive end-to-end self test
node scripts/selftest.js

# Build and refresh the running desktop widget installation
npm run install-app
```

---

## 2. Safe Modification Procedure (Step A to E)

1. **Step A: Understand**: Identify the affected widget, inspect its HTML, CSS, and JS.
2. **Step B: Plan**: Check `AGENTS.md` and `ARCHITECTURE.md`. Ensure no circular dependencies or redundant events.
3. **Step C: Implement**: Make the smallest focused change. Preserve stable `data-id` keys.
4. **Step D: Verify**: Run targeted unit and integration tests.
5. **Step E: Update Knowledge**: Record architectural findings or performance baselines.
