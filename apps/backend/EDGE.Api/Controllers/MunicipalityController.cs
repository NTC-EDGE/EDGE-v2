using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Municipalities.Commands.CreateMunicipality;
using EDGE.Application.Municipalities.Commands.DeleteMunicipality;
using EDGE.Application.Municipalities.Commands.UpdateMunicipality;
using EDGE.Application.Municipalities.Queries.GetMunicipalities;
using EDGE.Application.Municipalities.Queries.GetMunicipalityById;
using EDGE.Application.Municipalities.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Controllers;

[Route("api/municipalities")]
[ApiController]
public class MunicipalityController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<MunicipalityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMunicipalities([FromQuery] Guid? provinceId, [FromQuery] bool? activeOnly)
    {
        var result = await mediator.Send(new GetMunicipalitiesQuery(provinceId, activeOnly));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MunicipalityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMunicipalityById(Guid id)
    {
        var result = await mediator.Send(new GetMunicipalityByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateMunicipality([FromBody] CreateMunicipalityCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded
            ? BadRequest(result)
            : CreatedAtAction(nameof(GetMunicipalityById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMunicipality(Guid id, [FromBody] UpdateMunicipalityCommand command)
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
    public async Task<IActionResult> DeleteMunicipality(Guid id)
    {
        var result = await mediator.Send(new DeleteMunicipalityCommand(id));
        if (!result.Succeeded)
        {
            return result.Message != null && result.Message.Contains("not found")
                ? NotFound(result)
                : Conflict(result);
        }
        return Ok(result);
    }
}
