module Program

[<EntryPoint>]
let main _ = Harness.run (CoreTests.all @ AdversarialTests.all @ RenderTests.all)
