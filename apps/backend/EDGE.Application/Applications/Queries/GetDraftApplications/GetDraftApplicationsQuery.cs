using System.Collections.Generic;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;

public record GetDraftApplicationsQuery(
    Guid? CategoryId = null,
    string? CategoryParam = null,
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null
) : IRequest<object>;
