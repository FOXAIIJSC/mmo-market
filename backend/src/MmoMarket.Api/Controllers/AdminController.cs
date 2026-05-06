using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Admin;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AdminService _svc;
    public AdminController(AdminService svc) => _svc = svc;

    [HttpGet("metrics")]
    public Task<AdminMetricsDto> Metrics(CancellationToken ct) => _svc.GetMetricsAsync(ct);
}
