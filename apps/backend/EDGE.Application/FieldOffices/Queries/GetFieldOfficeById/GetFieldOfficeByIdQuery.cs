using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.FieldOffices.Dtos;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;

public record GetFieldOfficeByIdQuery(Guid Id) : IRequest<ApiResponse<FieldOfficeDto>>;
