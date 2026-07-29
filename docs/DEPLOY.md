# Deploying Atlas

Single Hetzner VPS running the whole stack under Docker Compose, with Caddy
terminating TLS. LiveKit is Cloud, so no media ever transits this box — that is
what keeps a small server viable.

**Recommended: CX32** (4 vCPU / 8 GB / 80 GB, ~€7/mo).
Measured idle footprint: API ~600 MB (4 Octane workers), web ~400 MB,
Postgres ~400 MB, Redis ~80 MB. CX22 (4 GB) also works but `next build` can
exhaust memory — add 2 GB of swap or build images off-box.

---

## 1. Provision

Create an **Ubuntu 24.04** server in Hetzner Cloud. In the Cloud Console also
create an **Object Storage** bucket pair (`atlas-videos`, `atlas-recordings`)
and an access key.

Point DNS at the server **before** first boot of the stack — Caddy requests a
certificate for `APP_DOMAIN` on startup and will fail if the record is absent:

```
A     atlas.example.com    -> <server-ipv4>
AAAA  atlas.example.com    -> <server-ipv6>
```

## 2. Server setup

```bash
ssh root@<server-ip>

apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh

# Firewall: only SSH and HTTP(S). Postgres and Redis are published to no host
# port at all, but this closes them off even if that ever changes.
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443 && ufw --force enable

# Only needed on a 4 GB box, where `next build` can OOM.
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 3. Configure

```bash
git clone <your-repo-url> /opt/atlas
cd /opt/atlas

cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml run --rm --no-deps api \
    php artisan key:generate --show      # paste into APP_KEY
nano .env.prod                            # fill every blank
chmod 600 .env.prod
```

## 4. Deploy

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

First build takes several minutes — Swoole compiles from source. Migrations run
automatically from the API entrypoint.

## 5. Verify

```bash
docker compose -f docker-compose.prod.yml ps          # all healthy
curl -I https://atlas.example.com                     # 200, valid cert
curl -s https://atlas.example.com/up                  # Laravel health check

# Rate limiting must be per-client, not global. Behind a proxy this is the
# thing most likely to be silently wrong: if TrustProxies is misconfigured,
# Laravel sees Caddy's IP for everyone and one user's failed logins lock out
# the entire user base.
docker compose -f docker-compose.prod.yml exec api \
    php artisan tinker --execute="dump(request()->ip());"
```

## 6. Backups

Postgres is the only stateful thing on the box; media lives in Object Storage.

```bash
chmod +x /opt/atlas/scripts/backup-db.sh
crontab -e
# 15 3 * * * /opt/atlas/scripts/backup-db.sh >> /var/log/atlas-backup.log 2>&1
```

Test a restore before you need one:

```bash
gunzip -c backups/atlas-<stamp>.sql.gz | \
    docker compose -f docker-compose.prod.yml exec -T postgres psql -U atlas -d atlas
```

## 7. Updating

```bash
cd /opt/atlas && git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Compose replaces containers one service at a time; Caddy keeps serving
throughout. There is a brief gap while the API container restarts — acceptable
for a single-box deployment. If you need zero-downtime, `php artisan octane:reload`
reloads workers in place when only PHP code changed.

**Rollback:** `git checkout <previous-sha> && docker compose ... up -d --build`.
Migrations are not automatically reversed — check `php artisan migrate:status`
before rolling back across a schema change.

---

## Notes and gotchas

**`NEXT_PUBLIC_*` are build-time.** They are inlined into the JS bundle during
`next build`, and `next.config.ts` rewrites are baked into the routes manifest.
Changing them in `.env.prod` alone does nothing — the web image must be rebuilt.

**The API image must never contain `.env`.** `api/.dockerignore` enforces this;
all configuration arrives through Compose environment variables.

**Octane holds workers between requests.** After changing PHP code, restart the
container or run `octane:reload` — `opcache.validate_timestamps` is off, so the
filesystem is not re-checked.

**Queue is `sync`.** Jobs run inline. If you add queued work, switch
`QUEUE_CONNECTION` to `redis` *and* enable the `worker` service in the compose
file together — redis without a worker makes jobs disappear silently.

**`middleware.ts` is deprecated in Next 16**, renamed to `proxy.ts`. It still
works, but migrate when convenient:
`npx @next/codemod@canary middleware-to-proxy .`
