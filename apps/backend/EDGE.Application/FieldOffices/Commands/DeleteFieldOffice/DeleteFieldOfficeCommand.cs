using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;

public record DeleteFieldOfficeCommand(Guid Id) : IRequest<ApiResponse<string>>;
