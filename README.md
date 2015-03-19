# Why Flux?

The best understand Flux is to arrive at the conclusion that we need something exactly like Flux.

In this app we will slowly refactor a typical growing React app into one using Flux and it will (hopefully) feel natural.

Rough agenda:

* Introduce controller views as a place to manage app state.
* Introduce stores as a place to store the same-kind data for multiple components (mutate them directly and filter them on the component side).
* Introduce actions to DRY, well… actions.
* Introduce filtered stores. Make sure all actions update all relevant stores.
* Centralize all the store update logic inside the stores themselves via a dispatcher listening to action results.
