using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Provinces.Commands.CreateProvince;
using EDGE.Application.Provinces.Commands.DeleteProvince;
using EDGE.Application.Provinces.Commands.UpdateProvince;
using EDGE.Application.Provinces.Queries.GetProvinces;
using EDGE.Application.Provinces.Queries.GetProvinceById;
using EDGE.Application.Provinces.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Controllers;

[Route("api/provinces")]
[ApiController]
public class ProvinceController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ProvinceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProvinces([FromQuery] Guid? regionId, [FromQuery] bool? activeOnly)
    {
        var result = await mediator.Send(new GetProvincesQuery(regionId, activeOnly));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProvinceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProvinceById(Guid id)
    {
        var result = await mediator.Send(new GetProvinceByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProvince([FromBody] CreateProvinceCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded
            ? BadRequest(result)
            : CreatedAtAction(nameof(GetProvinceById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProvince(Guid id, [FromBody] UpdateProvinceCommand command)
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
    public async Task<IActionResult> DeleteProvince(Guid id)
    {
        var result = await mediator.Send(new DeleteProvinceCommand(id));
        if (!result.Succeeded)
        {
            return result.Message != null && result.Message.Contains("not found")
                ? NotFound(result)
                : Conflict(result);
        }
        return Ok(result);
    }
}
