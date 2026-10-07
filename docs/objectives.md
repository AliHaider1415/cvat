# Objectives

## Measurement objectives

### MO-1 — Annotation counts endpoint latency

| Field | Entry |
| --- | --- |
| **What is measured** | Server-side request time for `GET /api/tasks/1/annotation-counts` (Django test `Client` inside `cvat_server`, authenticated as `admin`), from call start until response status is available. The Annotation counts page also shows UI `Request latency: N ms` (`performance.now` around the browser fetch); that includes Traefik + browser overhead on top of this path. |
| **How** | One warm-up request discarded, then **5** timed runs via `manage.py shell` / Django `Client`. Median of those 5. |
| **Target** | Median of 5 runs at or below **200 ms**. |
| **Conditions** | Local Docker CVAT stack (`cvat_server` + Postgres); sample task `id=1`; charger plugged in; host Windows 11 with usual desktop apps open. |
| **Not included** | Cold start of Docker / first request after container recreate; browser/Traefik RTT; tasks other than sample task `1`; serverless / Nuclio (`/api/lambda`) availability. |

**You pick the target number, then you justify it.** A target you clear without doing anything tells us one thing about you. A target you miss honestly tells us something better.

Justification for **200 ms**: aggregation is four grouped SQL queries (root shapes, tracks, intervals, tags) plus label resolution — not a full annotation dump. On this machine the warm path is typically tens of milliseconds; **200 ms** leaves headroom for Docker/DB jitter while still requiring the endpoint to stay snappy for the chart page. (An earlier **5000 ms** draft was too soft once measured.)

---

## Feature objectives

| ID | Objective |
| --- | --- |
| FO-1 | Build the API so it returns the correct per-class annotation count for a task. |
| FO-2 | Handle API edge cases; require login; refuse users without access to that task. |
| FO-3 | Build the separate UI page that charts counts from the API. |
| FO-4 | Handle UI edge cases (empty data, failed request) and authorisation via existing CVAT login. |
| FO-5 | Measure latency by showing it in the UI (see MO-1). |
| FO-6 | Add filtering in the API and UI. |

---

## Rules for any number you report

- It comes from your machine, pasted as raw output.
- Your docs state your CPU, RAM, operating system and the CVAT commit SHA you cloned.
- Measure 5 times. Report the median and the spread.

**One number on its own is not a measurement.**

### Machine / build under test

| Field | Value |
| --- | --- |
| **CPU** | 11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz |
| **RAM** | ~16 GB |
| **OS** | Microsoft Windows 11 Pro (Build 26200), x64 |
| **CVAT commit** | `27e5cca6b8d43b4fc6495e1d276fd4e00d3566c7` (`27e5cca6b`) |

### Latency runs (MO-1)

Raw Django `Client` timings for `GET /api/tasks/1/annotation-counts` inside `cvat_server` (warm-up excluded):

```
run1: 68.6 ms
run2: 62.4 ms
run3: 58.4 ms
run4: 64.2 ms
run5: 61.9 ms
median: 62.4 ms
spread (min–max): 58.4–68.6 ms
```

**Result vs target:** median **62.4 ms** ≤ **200 ms** (pass).
