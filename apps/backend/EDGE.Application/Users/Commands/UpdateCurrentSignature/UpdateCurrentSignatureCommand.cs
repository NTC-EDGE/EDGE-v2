using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Commands.UpdateCurrentSignature;

public record UpdateCurrentSignatureCommand(string ESignature) : IRequest<User?>;
