using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Applications.Commands;

public record CreateApplicationCommand(string Title, string ApplicantName) : IRequest<ApplicationRecord>;
