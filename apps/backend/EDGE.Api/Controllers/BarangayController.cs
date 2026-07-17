using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Barangays.Commands.CreateBarangay;
using EDGE.Application.Barangays.Commands.UpdateBarangay;
using EDGE.Application.Barangays.Commands.DeleteBarangay;
using EDGE.Application.Barangays.Queries.GetBarangayById;
using EDGE.Application.Barangays.Queries.GetBarangays;
using EDGE.Application.Barangays.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Controllers;

[Route("api/barangays")]
[ApiController]
public class BarangayController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<BarangayDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBarangays([FromQuery] Guid? municipalityId, [FromQuery] bool? activeOnly)
    {
        var result = await mediator.Send(new GetBarangaysQuery(municipalityId, activeOnly));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BarangayDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBarangayById(Guid id)
    {
        var result = await mediator.Send(new GetBarangayByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBarangay([FromBody] CreateBarangayCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded
            ? BadRequest(result)
            : CreatedAtAction(nameof(GetBarangayById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBarangay(Guid id, [FromBody] UpdateBarangayCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<string>.Fail("ID path parameter does not match command body ID."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteBarangay(Guid id)
    {
        var result = await mediator.Send(new DeleteBarangayCommand(id));
        if (!result.Succeeded)
        {
            return result.Message != null && result.Message.Contains("not found")
                ? NotFound(result)
                : Conflict(result);
        }
        return Ok(result);
    }
}
