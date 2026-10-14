
## Layout

This repo follows the modular repository structure where each feature gets its own module.
The major file suffixes are .routes for the api routes registered on that module, .service where the logic lives, .repository where the methods are provided to talk to the tables related to the feature, .types contains the typescript types which are used in the feature module. .validator contains the validator, which will be zod based, the .constants file contains the constant used inside the module and .queries contains the raw sql queires which are executed in the repository layer.

Other shared Functions and Middlewares live in the utils folder.

## Inter Communication between modules

All connections to the modules must be done through the service layer only. The imports between each layer will be from layer to layer. Only the service layer can import the repository layer, only the routes layer can import the service layer, and so on.

## Transactions

Transactions will start in the service layer, while calling the methods provided by the repository layer, the transaction object will be passed down to the repository.

## Errors

When something goes wrong on purpose, or we can say that it is expected error then in that case we throw an error of the AppError class, this error is give to the error middleware by the next(error). This middleware extracts the status code and the message from the AppError obj and then sends a proper response with the said error status code.
For an error we didn't plan for the default code is 500. The Response Envelope we send for an error response we send is {error:{code:"ONE_WORD_STATUS",message:"Message string about the error"}}

## Routing

To add a public route, we have to first add the router for that in the route data's public route array, all the public routers are added to that route. For teneat route which are going to require a authentication middleware and teneat resolution middleware will be added to the authenticatedRoutes array.
The feature never attaches its own auth middleware, cause they are handled at the routes level so that each feature doesn't have to add them.
As tenat routes are authenticated, they live in the v1 parent path, any route which is neither public route nor has the auth prefix(v1), they are sent the 404 on purpose. Also we check the route path, before adding them to the main router, so that no duplicate paths are added
