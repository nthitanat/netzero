# MySQL InnoDB Crash — 2026-02-26

## Summary

MySQL crashed due to an InnoDB tablespace permission error on the `products_survey_question` table, causing a fatal assertion abort. MySQL then failed to restart because it kept hitting the same corrupted/inaccessible tablespace on every startup attempt.

---

## Crash Timeline

| Time (UTC+7) | Event |
|---|---|
| 14:40:03 | `GET /api/v1/products/surveys/questions` triggered a read on `products_survey_question.ibd` |
| 14:40:03 | InnoDB got **OS error 13 (Permission Denied)** on the `.ibd` file |
| 14:40:03 | InnoDB retried 100 times — all failed |
| 14:40:03 | InnoDB raised `[FATAL]` — unable to read page into buffer pool |
| 14:40:03 | MySQL called `signal 6 (SIGABRT)` — process killed itself |
| 14:40:03+ | Both `netzero-server` and `netzero-chat-server` got `PROTOCOL_CONNECTION_LOST` then `ECONNREFUSED 172.17.0.1:3306` |
| 21:42–21:43 | MySQL restart loop — failed 8+ times in a row (same tablespace error on startup) |

---

## Root Cause

**File: `/www/server/data/netzero/products_survey_question.ibd`**

The InnoDB `.ibd` data file for `products_survey_question` either:
1. Had **wrong ownership/permissions** (not owned by `mysql:mysql`) — OS error 13
2. Was **deleted or moved** while MySQL was still running (the error log warning: *"Have you deleted .ibd files under a running mysqld server?"*)

The most likely cause is that the `.ibd` file was touched/replaced during a recent deployment (the `netzero-chat-server` was redeployed ~9 minutes before the crash), which may have altered permissions on the MySQL data directory.

---

## Error Log Evidence

```
[ERROR] [MY-012592] [InnoDB] Operating system error number 13 in a file operation.
[ERROR] [MY-012595] [InnoDB] The error means mysqld does not have the access rights to the directory.
[Warning] [MY-012093] [InnoDB] Cannot open './netzero/products_survey_question.ibd'.
  Have you deleted .ibd files under a running mysqld server?

[FATAL] [MY-011899] [InnoDB] Unable to read page [page id: space=519, page number=7]
  into the buffer pool after 100 attempts.
  The most probable cause of this error may be that the table has been corrupted.

[ERROR] [MY-013183] [InnoDB] Assertion failure: buf0buf.cc:4118:ib::fatal triggered
InnoDB: We intentionally generate a memory trap.

2026-02-26T14:40:03Z UTC - mysqld got signal 6
```

---

## Fix

### Step 1 — Fix file permissions

```bash
sudo chown -R mysql:mysql /www/server/data/netzero/
sudo chmod -R 660 /www/server/data/netzero/*.ibd
sudo chmod 700 /www/server/data/netzero/
```

### Step 2 — Remove stale PID file

```bash
sudo rm -f /www/server/data/engagement.pid
```

### Step 3 — Start MySQL

```bash
sudo systemctl start mysqld
sudo systemctl status mysqld
```

---

## If MySQL Still Won't Start (Tablespace Corruption)

Use `innodb_force_recovery` to bypass the corrupted tablespace and start MySQL in recovery mode.

### Edit `/etc/mysql/my.cnf` (or aaPanel MySQL config):

```ini
[mysqld]
innodb_force_recovery = 1
```

Try incrementally increasing from 1 → 6 until MySQL starts:

| Level | What it skips |
|---|---|
| 1 | Skips corrupt pages (safe) |
| 2 | Skips background threads |
| 3 | Does not roll back active transactions |
| 4 | Skips insert buffer merge |
| 5 | Does not look at undo logs |
| 6 | Skips corrupt pages on read (most aggressive) |

### Once MySQL starts in recovery mode:

```sql
-- Backup all data first
mysqldump -u root -p netzero > /tmp/netzero_backup_$(date +%Y%m%d).sql

-- Drop the corrupted table (data will be lost)
USE netzero;
DROP TABLE IF EXISTS products_survey_question;
```

### Then remove `innodb_force_recovery` from the config and restart MySQL normally:

```bash
sudo systemctl restart mysqld
```

The app's `databaseEnsure` logic will automatically recreate `products_survey_question` on the next request.

---

## Prevention

1. **Never directly modify files** inside `/www/server/data/` while MySQL is running
2. After any server deployment that touches MySQL data directories, verify ownership:
   ```bash
   ls -la /www/server/data/netzero/
   # All files should be owned by mysql:mysql
   ```
3. Consider adding a **MySQL healthcheck** to the deployment script that verifies MySQL is still running after deploy
4. Set `innodb_file_per_table=ON` (likely already on) so corruption is isolated to one table, not the entire database

---

## Related Services Affected

- `netzero-server` (port 3001) — all DB queries failed
- `netzero-chat-server` (port 3004) — all DB queries failed
- Both containers entered **unhealthy** state (healthcheck pings `/api/v1/health` which also requires DB)
- MySQL healthcheck was pinging `172.17.0.1:3306` (Docker host gateway → host MySQL)
