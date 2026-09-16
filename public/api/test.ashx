<%@ WebHandler Language="C#" Class="TestHandler" %>
using System.Web;
public class TestHandler : IHttpHandler {
    public void ProcessRequest(HttpContext context) {
        context.Response.ContentType = "text/plain";
        context.Response.Write("HELLO_ASPNET");
    }
    public bool IsReusable { get { return true; } }
}
