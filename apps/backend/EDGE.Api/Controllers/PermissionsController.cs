using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Application.Permissions.Queries;

namespace EDGE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Policies.CanManageUsers)]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PermissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<Permission>>> GetAll()
    {
        var result = await _mediator.Send(new GetPermissionsQuery());
        return Ok(result);
    }
}
