using MediatR;
using NtcEdge.Domain.Entities;

namespace NtcEdge.Application.Applications.Commands;

public record CreateApplicationCommand(string Title, string ApplicantName) : IRequest<ApplicationRecord>;
