using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.FieldOffices.Dtos;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOffices;

public record GetFieldOfficesQuery(Guid? RegionId = null) : IRequest<ApiResponse<List<FieldOfficeDto>>>;
