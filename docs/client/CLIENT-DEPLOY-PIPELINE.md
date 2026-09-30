# Shared frontend deployment

NetZero and Glocal now use one checkout, one root production environment, and one deployment entry point. Use [the Docker and deployment guide](../server/DOCKER-AND-DEPLOYMENT-GUIDE.md) for target selection, publication, rollback, and verification.

Both React builds are static files served by the existing host web server. `netzero-client` publishes to `/netzero/`; `glocal-client` publishes to `/glocal/` and retains hash routing. The backend remains `netzero-server` and `netzero-chat-server` in production Compose. Credentials belong only in the private root `.env.production`.
