using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly ApplicationDbContext _context;

    public ConversationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .Include(c => c.Tenant)
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .Include(c => c.Participants)
                .ThenInclude(p => p.Tenant)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<List<Conversation>> GetUserConversationsAsync(Guid userId, Guid? tenantId, string? filter = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Conversations
            .Include(c => c.Tenant)
            .Include(c => c.Messages)
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .Include(c => c.Participants)
                .ThenInclude(p => p.Tenant)
            .Where(c => !c.IsDeleted && c.Participants.Any(p => p.UserId == userId && !p.HasLeft));

        if (tenantId.HasValue)
        {
            query = query.Where(c => c.TenantId == tenantId || c.Scope == Domain.Enums.ConversationScope.InterRegional);
        }

        var normalizedFilter = filter?.Trim().ToLowerInvariant();

        if (normalizedFilter == "archived")
        {
            query = query.Where(c => c.IsArchived);
        }
        else if (normalizedFilter == "direct")
        {
            query = query.Where(c => !c.IsArchived && c.Type == Domain.Enums.ConversationType.Direct);
        }
        else if (normalizedFilter == "group")
        {
            query = query.Where(c => !c.IsArchived && (c.Type == Domain.Enums.ConversationType.Group || c.Type == Domain.Enums.ConversationType.Channel));
        }
        else if (normalizedFilter == "active" || normalizedFilter == "all")
        {
            query = query.Where(c => !c.IsArchived);
        }

        return await query
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ChatMessage>> GetMessagesAsync(Guid conversationId, int skip, int take, CancellationToken cancellationToken = default)
    {
        return await _context.ChatMessages
            .Include(m => m.Sender)
            .Include(m => m.SenderTenant)
            .Include(m => m.Attachments)
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .OrderByDescending(m => m.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<Conversation> AddConversationAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        await _context.Conversations.AddAsync(conversation, cancellationToken);
        return conversation;
    }

    public async Task<ChatMessage> AddMessageAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        await _context.ChatMessages.AddAsync(message, cancellationToken);
        return message;
    }

    public async Task MarkMessagesReadAsync(Guid conversationId, Guid userId, Guid lastMessageId, CancellationToken cancellationToken = default)
    {
        var participant = await _context.ConversationParticipants
            .FirstOrDefaultAsync(p => p.ConversationId == conversationId && p.UserId == userId, cancellationToken);

        if (participant != null)
        {
            participant.LastReadAt = DateTimeOffset.UtcNow;
            participant.LastReadMessageId = lastMessageId;
        }
    }

    public async Task<List<ConversationParticipant>> GetAllParticipantsAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        return await _context.ConversationParticipants
            .IgnoreQueryFilters()
            .Where(p => p.ConversationId == conversationId)
            .ToListAsync(cancellationToken);
    }
}
