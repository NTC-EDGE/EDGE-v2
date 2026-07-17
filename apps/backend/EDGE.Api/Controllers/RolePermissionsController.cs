using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.RolePermissions.Commands;

namespace EDGE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Policies.CanManageUsers)]
public class RolePermissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RolePermissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("assign")]
    public async Task<IActionResult> Assign(
        [FromBody] AssignPermissionCommand command,
        [FromServices] IValidator<AssignPermissionCommand> validator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var success = await _mediator.Send(command);
        if (!success) return BadRequest("Could not assign permission to role. Please check IDs.");
        return Ok(new { Message = "Permission assigned successfully." });
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke(
        [FromBody] RevokePermissionCommand command,
        [FromServices] IValidator<RevokePermissionCommand> validator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var success = await _mediator.Send(command);
        if (!success) return NotFound("Mapping not found.");
        return Ok(new { Message = "Permission revoked successfully." });
    }
}
