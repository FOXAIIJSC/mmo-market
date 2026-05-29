using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Reviews;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reviews")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService _svc;
    private readonly ICurrentUser _user;
    public ReviewController(ReviewService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);

    [HttpPost]
    public Task<OwnReviewDto> Create([FromBody] ReviewCreateDto dto, CancellationToken ct) => _svc.CreateAsync(Uid, dto, ct);

    [HttpGet("mine")]
    public Task<OwnReviewDto[]> Mine(CancellationToken ct) => _svc.GetMineAsync(Uid, ct);

    [HttpPut("{id:guid}")]
    public Task<OwnReviewDto> Update(Guid id, [FromBody] ReviewUpdateDto dto, CancellationToken ct) =>
        _svc.UpdateAsync(Uid, id, dto, ct);
}
