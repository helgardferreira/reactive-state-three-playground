# Playground Notes

## Actors contain all of your state logic

- Similar to redux and reducers but
  the finite state machine (FSM) is built
  in making some transactions impossible
  and preventing many types of bugs
- xState tooling is amazing for debugging
  and modelling your business logic
- Actors can only send and receive messages
  as their form of communication - this
  ensures that your state machines are
  as decoupled as possible from
  your presentational layer as well
  as other state machines
  
## Events as reactive and Observable (RxJs) streams

- Through FRP you can declaratively, model
  the stream of data between FSMs, the
  presentational layer as well as APIs at
  compile time
- Reduces the amount of bugs from asynchronous
  code and effectively removes race conditions
  if utilised correctly
  
## Summary

We can leverage the actor model to treat our system
as a distributed system. We can use RxJs and, by extension,
functional reactive programming to model complex user
interactions and streams of asynchronous events. Our
streams then feed into xState and xState can feed into
our streams. By using a central event bus we can access
all our events in one central location but state is
localised on a per component / behaviour basis.
