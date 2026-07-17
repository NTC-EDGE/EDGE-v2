using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Regions.Commands.CreateRegion;
using EDGE.Application.Regions.Commands.UpdateRegion;
using EDGE.Application.Regions.Commands.DeleteRegion;
using EDGE.Application.Regions.Queries.GetRegions;
using EDGE.Application.Regions.Queries.GetRegionById;
using EDGE.Application.Regions.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Controllers;

[Route("api/regions")]
[ApiController]
public class RegionController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<RegionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRegions([FromQuery] bool? activeOnly)
    {
        var result = await mediator.Send(new GetRegionsQuery(activeOnly));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<RegionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRegionById(Guid id)
    {
        var result = await mediator.Send(new GetRegionByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRegion([FromBody] CreateRegionCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded
            ? BadRequest(result)
            : CreatedAtAction(nameof(GetRegionById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRegion(Guid id, [FromBody] UpdateRegionCommand command)
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
    public async Task<IActionResult> DeleteRegion(Guid id)
    {
        var result = await mediator.Send(new DeleteRegionCommand(id));
        if (!result.Succeeded)
        {
            return result.Message != null && result.Message.Contains("not found")
                ? NotFound(result)
                : Conflict(result);
        }
        return Ok(result);
    }
}
