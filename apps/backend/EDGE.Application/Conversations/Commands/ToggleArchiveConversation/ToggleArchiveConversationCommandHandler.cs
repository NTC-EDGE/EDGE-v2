using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Conversations.Commands.ToggleArchiveConversation;

public class ToggleArchiveConversationCommandHandler : IRequestHandler<ToggleArchiveConversationCommand, bool>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleArchiveConversationCommandHandler(
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

    public async Task<bool> Handle(ToggleArchiveConversationCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken)
            ?? throw new KeyNotFoundException("Conversation not found.");

        var participant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id && !p.HasLeft);
        if (participant == null)
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        conversation.IsArchived = request.IsArchived ?? !conversation.IsArchived;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return conversation.IsArchived;
    }
}
