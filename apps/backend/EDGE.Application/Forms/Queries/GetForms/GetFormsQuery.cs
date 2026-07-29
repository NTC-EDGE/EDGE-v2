using System.Collections.Generic;
using MediatR;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetForms;

public record GetFormsQuery : IRequest<List<FormDto>>;
