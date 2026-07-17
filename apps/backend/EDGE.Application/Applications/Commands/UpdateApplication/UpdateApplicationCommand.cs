using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands;

public record UpdateApplicationCommand(Guid Id, string Title, string ApplicantName, ApplicationStatus Status) : IRequest<ApplicationRecord?>;
