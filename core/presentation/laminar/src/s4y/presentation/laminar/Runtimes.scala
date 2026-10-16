package s4y.presentation.laminar

import zio.Runtime

/** `Runtime` is invariant, but a runtime for services `R` can run anything needing fewer services.
  * Lets one composition-root runtime be handed to boundary objects typed by just the use cases they
  * call.
  */
extension [R](runtime: Runtime[R])
  def narrow[R1 >: R]: Runtime[R1] =
    Runtime(runtime.environment, runtime.fiberRefs, runtime.runtimeFlags)
