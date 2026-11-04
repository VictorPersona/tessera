## Layout

This repo follows the modular repository structure where each feature gets its own module.
The major file suffixes are .routes for the api routes registered on that module, .service where the logic lives, .repository where the methods are provided to talk to the tables related to the feature,while are in the .schema files , .types contains the typescript types which are used in the feature module. .validator contains the validator, which will be zod based, the .constants file contains the constant used inside the module and .queries contains the raw sql queires which are executed in the repository layer.

Other shared Functions and Middlewares live in the utils folder.

## Inter Communication between modules

All connections to the modules must be done through the service layer only. A module never imports another module's repository.

1. **Reading from another module:** call that module's service.
2. **Writes that must commit together in one transaction** go inside the same module where possible. Keep such modules small; cross-module transactions are the exception.
3. **When a cross-module transaction is unavoidable,** the other module exposes a service method that takes the caller's executor and joins its transaction. The service the route calls opens the scope (`withTenant`) and passes the executor down. Routes never see the executor.
4. **Shared infrastructure** (the jobs queue, an audit log, idempotency keys) is not a feature module. It is a single function that takes the caller's executor (for example `enqueue(executor, job)`), and any service may call it.

The imports between each layer will be from layer to layer. Only the service layer can import the repository layer, only the routes layer can import the service layer, and so on.

## Transactions

Transactions will start in the service layer, while calling the methods provided by the repository layer, the transaction object will be passed down to the repository.

## Errors

When something goes wrong on purpose, or we can say that it is expected error then in that case we throw an error of the AppError class, this error is give to the error middleware by the next(error). This middleware extracts the status code and the message from the AppError obj and then sends a proper response with the said error status code.

Postgres errors are translated at the repository boundary by `throwAppropriateError` in `packages/db`. Only the few that mean something to the business become named classes, each keeping the original error as `cause`:

| SQLSTATE / code                             | Class                                         | HTTP (error middleware) | Worker (`shouldRetry`) |
| ------------------------------------------- | --------------------------------------------- | ----------------------- | ---------------------- |
| 23505 unique_violation                      | `ConflictError` (carries the constraint name) | 409                     | dead                   |
| 40001 serialization_failure, 40P01 deadlock | `RetryError`                                  | 503                     | retry                  |
| 42501 insufficient_privilege (RLS)          | `PrivilegeError`, our bug: logged loudly      | 500, never 403          | dead                   |
| ECONNREFUSED, ECONNRESET, ...               | `ConnectionError`                             | 503                     | retry                  |

Everything else is rethrown unchanged. Repositories never catch an error and turn it into a 500.

The error middleware (`apps/api/src/middlewares/error.middleware.ts`) is the only place an error becomes a status code. For an error we didn't plan for, the code is 500, the error is logged with the request id, and the body never contains the message or the stack.

Every response carries an `X-Request-Id` header. The error envelope is `{error:{code:"ONE_WORD_STATUS",message:"Message string about the error",requestId:"..."}}`.

The worker decides retry versus dead with `shouldRetry` (exported from `packages/db/public.errors`), by error class, never by message text. Only listed classes retry; anything unknown is dead. A retry reruns the whole unit of work, never one statement.

## Routing

To add a public route, we have to first add the router for that in the route data's public route array, all the public routers are added to that route. For teneat route which are going to require a authentication middleware and teneat resolution middleware will be added to the authenticatedRoutes array.
The feature never attaches its own auth middleware, cause they are handled at the routes level so that each feature doesn't have to add them.
As tenat routes are authenticated, they live in the v1 parent path, any route which is neither public route nor has the auth prefix(v1), they are sent the 404 on purpose. Also we check the route path, before adding them to the main router, so that no duplicate paths are added

## Import rules (enforced by lint)

To better facilate the checks of whether the Inter layer communication between modules is following the guidelines , so to enforce them ESlint is being used, and the rules live in eslint.config.mjsand --print-config <file> shows what applies to a file;

Current ESLINT Rules

| File | Banned |
| ---- | ------ |

| File                                       | Banned                                                          |
| ------------------------------------------ | --------------------------------------------------------------- |
| routes                                     | pg, packages/db, and repository/schema/queries files            |
| repository                                 | pg, express, routes/service files, and packages/db (types only) |
| service                                    | pg, and packages/db except `packages/db/public.*`               |
| queries                                    | pg, and packages/db except `packages/db/public.*`               |
| error.middleware                           | pg, and packages/db except `packages/db/public.errors`          |
| everything else                            | pg, packages/db                                                 |
| packages/db, composition roots, `*.test.*` | nothing (rule off)                                              |

Type only imports are allowed cause we are working with typescript, so it will allow it to understand.

The core list is a deny list, so for the files in the object the values which are there are the restrictions which constitue the deny list.

## Testing

- Test files are named by suite: `*.unit.test.ts` (no database) and `*.int.test.ts` (real Postgres). Run one suite with `npx vitest run --project unit` or `--project integration`.
- The integration suite checks Postgres once before any test (`packages/db/tests/integrationGlobalSetup.ts`) and stops with "Postgres not reachable" if it's down.
- Repository tests are integration tests. They assert behaviour the database guarantees (tenant isolation, atomicity, constraint errors), never "the driver was called with X".
- Service tests are unit tests with hand-written fakes typed by the repository interfaces in `<feature>.types.ts`. Services take their repositories and `withTenant` as parameters (`makeDocumentsService(deps)`), so a test passes fakes in.
- No `vi.mock` of `packages/db` or repository files.
- Integration tests create and clean up their own rows; never assume a table is empty.
