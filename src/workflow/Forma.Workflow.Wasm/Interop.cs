using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;
using Forma.Workflow;
using Microsoft.FSharp.Collections;

/// Marshalling glue only. Holds the one sessions value; every decision lives in
/// Forma.Workflow (EmbedHost, Embed, Validation, Render).
[SupportedOSPlatform("browser")]
public static partial class FormaWorkflowInterop
{
    private static FSharpMap<string, EmbedState> sessions = EmbedHost.empty;

    [JSExport]
    public static string Dispatch(string messageJson)
    {
        var result = EmbedHost.dispatch(RenderOptionsModule.defaults, messageJson, sessions);
        sessions = result.Item1;
        return result.Item2;
    }

    [JSExport]
    public static string Document(string instance) => EmbedHost.document(instance, sessions)?.Value ?? "";

    [JSExport]
    public static void Dispose(string instance) => sessions = EmbedHost.dispose(instance, sessions);

    [JSExport]
    public static string Validate(string documentText) => JsonModule.compact(Validation.reportJson(Validation.load(documentText)));

    public static void Main() { }
}
