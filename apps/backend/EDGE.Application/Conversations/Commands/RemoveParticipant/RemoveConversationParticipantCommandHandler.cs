using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;

namespace EDGE.Application.Conversations.Commands.RemoveParticipant;

public class RemoveConversationParticipantCommandHandler : IRequestHandler<RemoveConversationParticipantCommand, bool>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveConversationParticipantCommandHandler(
        IConversationRepository conversationRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RemoveConversationParticipantCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Conversation with ID '{request.ConversationId}' was not found.");

        var isSelf = currentUser.Id == request.UserId;
        var isCreator = conversation.CreatedBy == currentUser.Id.ToString();
        var callerParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id && !p.HasLeft);
        var isAdmin = isCreator || (callerParticipant != null && (callerParticipant.Role == ParticipantRole.Owner || callerParticipant.Role == ParticipantRole.Admin));

        if (!isSelf && !isAdmin && !currentUser.IsSuperAdmin)
        {
            throw new UnauthorizedAccessException("You do not have permission to remove this participant.");
        }

        var participant = conversation.Participants.FirstOrDefault(p => p.UserId == request.UserId && !p.HasLeft);
        if (participant != null)
        {
            participant.HasLeft = true;
            participant.LeftAt = DateTimeOffset.UtcNow;
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }

        return false;
    }
}
