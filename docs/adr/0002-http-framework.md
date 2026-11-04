# HTTP framework: Express or Fastify

## Status

Accepted

## Context

- `apps/api` is the only HTTP service. Every later module adds routes to it,
  so the framework sits under tenant resolution, uploads, health checks,
  tracing and shutdown.
- I already write Express fluently. Module 01 is about the repo around the
  app (workspaces, config, health, migrations, Docker, CI), not the app, so
  time spent learning a framework comes out of that.
- Route handlers are `async` and throw typed errors (`AppError`, the
  `@tessera/db/errors` classes). The error middleware from Stage 00.5 only
  works if a rejected promise in a handler reaches it.
- Module 02 needs tenant resolution before every data route, but never
  before `/healthz` and `/readyz`. Stage 00.1 already does this with a
  route registry: public routes are mounted first, and `AuthRouter` adds
  `authenticate` and `resolveTenant` for everything under `/v1`.
- Stage 01.2 validates config with zod. Request validation is coming too, and
  one schema library for both is less to learn and keep in sync.
- Stage 01.5 drains in-flight requests on SIGTERM. That needs the underlying
  `http.Server` (`server.close()`, closing idle keep-alive sockets).
- Module 08 adds OpenTelemetry. The framework needs a maintained
  instrumentation.

## Options

**Express 5**

- Async errors: since 5.0, a handler or middleware that returns a rejected
  promise is forwarded to the error middleware as if it called `next(err)`
  (Express 5 migration guide). In Express 4 the rejection was unhandled and
  the request hung, unless every handler was wrapped with `.catch(next)`.
- Skipping middleware: by mount order and routers. A middleware applies to
  whatever is mounted after it on the same app or router, which is how
  `AuthRouter` keeps tenant resolution off the public routes.
- Validation: none built in. A small zod middleware per route, the same
  library as config.
- Shutdown: `app.listen()` returns the Node `http.Server` it creates
  (`lib/application.js`), so the drain logic owns the server directly.
- Observability: `@opentelemetry/instrumentation-express` in the OTel JS
  contrib repo, supporting `express >=4 <6`.

**Fastify 5**

- Async errors: handlers are `async` first; a rejection goes to the error
  handler.
- Skipping middleware: plugins with encapsulation. Hooks registered inside a
  plugin apply only to the routes in that plugin, so public routes would live
  in a separate plugin from the tenant-scoped ones. Clean, but it's a new
  model to learn.
- Validation: JSON Schema built in (validation plus fast response
  serialization). zod works through a third-party type provider, so
  config and requests would use either two schema languages or an extra
  dependency.
- Shutdown: `fastify.close()` runs `onClose` hooks; the server is
  `fastify.server`.
- Observability: `@fastify/otel`, maintained by the Fastify team. The old
  contrib `@opentelemetry/instrumentation-fastify` is deprecated in its
  favour.

**Performance** isn't a deciding force. Fastify is usually quoted as faster,
but I haven't measured either for this workload. Revisit after Module 09's
load test.

## Decision

**Express 5.** It's what the code already uses and what I know. Express 5
closes the gap that mattered most (async errors reach the error middleware
without wrappers). The route registry already handles "these routes skip this
middleware". zod stays the one schema library for config and requests.

## Consequences

**What we gave up**

- No built-in request validation or response serialization. Each route that
  takes input needs a zod middleware, written and applied by hand.
- No plugin encapsulation. Which middleware runs on which route depends on
  mount order in `routes.ts`, so mounting a router in the wrong place can
  silently skip `resolveTenant`. The route registry, and later a test that
  `/v1` routes reject a request with no tenant, are the backstop.
- Fastify's plugin model isn't on the resume from this project.

**What we get**

- No framework learning time in Module 01.
- The Stage 00.5 error middleware keeps working unchanged, including for
  `async` handlers.
- The `http.Server` is a plain return value, which the Stage 01.5 drain code
  needs. `app.ts` discards it today, so that stage must keep it.

**To fix with the boot work (Stage 01.2 / 01.5)**

- In Express 5, `app.listen` passes a listen error (for example `EADDRINUSE`)
  to its callback instead of throwing it. The callback in `app.ts` ignores its
  argument, so on a busy port it logs "Server started" and the process
  exits. The `try/catch` around it can't catch this, because the error comes
  later, as an event.

**Build and packaging (decided in Stage 01.1)**

- Workspace packages are consumed compiled. Their `exports` point at
  `dist/*.js` with `dist/*.d.ts` types, and TypeScript project references
  (`composite`, `tsc -b`) build them in dependency order. The runtime is
  plain JS everywhere: dev, CI and the Docker image run the same files.
- Because of that, anything that imports `@tessera/db` or `@tessera/config`
  needs `tsc -b` first. The `test`, `test:unit`, `test:integration` and `dev`
  scripts run it. A change in a package isn't seen by an app until it's
  rebuilt (`tsc -b --watch` in dev), although VS Code reads the source
  directly.
- `typecheck` writes `dist/` (git-ignored). A referenced project may not
  disable emit (TS6310), so with project references there is no true
  no-emit type check.

**Cost of reversing**

- Moving to Fastify later means rewriting `app.ts`, `routes.ts`, the route
  registry and every middleware into hooks and plugins. Route handlers
  change little, and services and repositories not at all, because they
  never see the framework: the layer rule (routes → service → repository)
  keeps this decision contained to the HTTP layer.
