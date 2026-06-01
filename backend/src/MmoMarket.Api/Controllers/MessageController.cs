using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Messages;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/messages")]
public class MessageController : ControllerBase
{
    private readonly MessageService _svc;
    private readonly ICurrentUser _user;
    public MessageController(MessageService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);
    private string Role => _user.Role ?? "Buyer";

    [HttpGet]
    public Task<ConversationDto[]> List(CancellationToken ct) =>
        _svc.ListBuyerConversationsAsync(Uid, ct);

    [HttpPost("start")]
    public Task<ConversationDto> Start([FromBody] StartConversationDto dto, CancellationToken ct) =>
        _svc.GetOrCreateConversationAsync(Uid, dto.SellerUsername, ct);

    [HttpGet("{id:guid}")]
    public Task<ChatMessageDto[]> GetMessages(Guid id, CancellationToken ct) =>
        _svc.GetMessagesAsync(id, Uid, "Buyer", ct);

    [HttpPost("{id:guid}")]
    public Task<ChatMessageDto> Send(Guid id, [FromBody] SendMessageDto dto, CancellationToken ct) =>
        _svc.SendMessageAsync(id, Uid, "Buyer", dto.Body, ct);
}
