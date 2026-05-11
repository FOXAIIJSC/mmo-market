using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Admin;
using MmoMarket.Application.Disputes;
using MmoMarket.Application.Sellers;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AdminService _svc;
    private readonly KycService _kyc;
    private readonly DisputeService _disputes;
    public AdminController(AdminService svc, KycService kyc, DisputeService disputes)
    {
        _svc = svc; _kyc = kyc; _disputes = disputes;
    }

    [HttpGet("metrics")]
    public Task<AdminMetricsDto> Metrics(CancellationToken ct) => _svc.GetMetricsAsync(ct);

    [HttpGet("users")]
    public Task<AdminUserDto[]> Users([FromQuery] string? role, CancellationToken ct) => _svc.ListUsersAsync(role, ct);

    [HttpGet("products")]
    public Task<AdminProductDto[]> Products([FromQuery] string? status, CancellationToken ct) => _svc.ListProductsAsync(status, ct);

    [HttpPost("products/{id:guid}/approve")]
    public Task<AdminProductDto> ApproveProduct(Guid id, CancellationToken ct) => _svc.ApproveProductAsync(id, ct);

    public record AdminRejectDto(string? Reason);
    [HttpPost("products/{id:guid}/reject")]
    public Task<AdminProductDto> RejectProduct(Guid id, [FromBody] AdminRejectDto dto, CancellationToken ct) => _svc.RejectProductAsync(id, dto.Reason ?? "", ct);

    [HttpGet("kyc/pending")]
    public Task<KycDto[]> KycPending(CancellationToken ct) => _kyc.ListPendingAsync(ct);

    [HttpPost("kyc/{id:guid}/approve")]
    public Task<KycDto> ApproveKyc(Guid id, CancellationToken ct) => _kyc.ApproveAsync(id, ct);

    [HttpPost("kyc/{id:guid}/reject")]
    public Task<KycDto> RejectKyc(Guid id, [FromBody] AdminRejectDto dto, CancellationToken ct) => _kyc.RejectAsync(id, dto.Reason ?? "", ct);

    [HttpGet("disputes")]
    public Task<DisputeListItemDto[]> Disputes([FromQuery] string? status, CancellationToken ct) => _disputes.ListAllAsync(status, ct);

    public record ResolveDisputeDto(string Resolution, string Action);
    [HttpPost("disputes/{id:guid}/resolve")]
    public async Task<DisputeDetailDto> ResolveDispute(Guid id, [FromBody] ResolveDisputeDto dto, CancellationToken ct)
    {
        var adminId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("Missing user id"));
        return await _disputes.ResolveAsync(adminId, id, new DisputeResolveDto(dto.Resolution, dto.Action), ct);
    }

    [HttpGet("withdrawals")]
    public Task<AdminWithdrawDto[]> Withdrawals([FromQuery] string? status, CancellationToken ct) => _svc.ListWithdrawalsAsync(status, ct);

    public record ProcessWithdrawDto(bool Approve, string? AdminNote);
    [HttpPost("withdrawals/{id:guid}/process")]
    public Task<AdminWithdrawDto> ProcessWithdraw(Guid id, [FromBody] ProcessWithdrawDto dto, CancellationToken ct) => _svc.ProcessWithdrawAsync(id, dto.Approve, dto.AdminNote, ct);

    [HttpGet("wallets/overview")]
    public Task<AdminWalletOverview> WalletOverview(CancellationToken ct) => _svc.GetWalletOverviewAsync(ct);

    [HttpGet("wallets")]
    public Task<AdminWalletUserDto[]> WalletUsers([FromQuery] string? search, CancellationToken ct) => _svc.ListWalletUsersAsync(search, ct);

    [HttpGet("wallets/{userId:guid}/transactions")]
    public Task<AdminWalletTxnDto[]> UserTransactions(Guid userId, CancellationToken ct) => _svc.GetUserTransactionsAsync(userId, ct);

    public record AdminTopupRequest(decimal Amount, string? Note);
    [HttpPost("wallets/{userId:guid}/topup")]
    public Task<AdminWalletUserDto> AdminTopup(Guid userId, [FromBody] AdminTopupRequest dto, CancellationToken ct) => _svc.AdminTopupAsync(userId, new AdminTopupDto(dto.Amount, dto.Note ?? ""), ct);
}
