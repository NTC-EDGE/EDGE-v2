using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Application.Applications.Commands;
using EDGE.Application.Applications.Queries;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using EDGE.Infrastructure.Hubs;

namespace EDGE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly IHubContext<NotificationHub> _hubContext;

    public ApplicationsController(
        IMediator mediator,
        IBackgroundJobClient backgroundJobs,
        IHubContext<NotificationHub> hubContext)
    {
        _mediator = mediator;
        _backgroundJobs = backgroundJobs;
        _hubContext = hubContext;
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanSubmitApplication)]
    public async Task<IActionResult> Create(
        [FromBody] CreateApplicationCommand command,
        [FromServices] IValidator<CreateApplicationCommand> validator)
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

        var result = await _mediator.Send(command);

        // Queue a Hangfire background job
        _backgroundJobs.Enqueue(() => Console.WriteLine($"[Hangfire Job] Processed application: {result.Title} by {result.ApplicantName}"));

        // Broadcast SignalR notification
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"New application submitted: '{result.Title}'");

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    [Authorize(Policy = Policies.CanViewAllApplications)]
    public async Task<ActionResult<List<ApplicationRecord>>> GetAll()
    {
        var result = await _mediator.Send(new GetApplicationsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Policies.CanViewAllApplications)]
    public async Task<ActionResult<ApplicationRecord>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetApplicationQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanEvaluateApplication)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateApplicationCommand command,
        [FromServices] IValidator<UpdateApplicationCommand> validator)
    {
        if (id != command.Id)
        {
            return BadRequest("Route ID does not match request body ID.");
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var result = await _mediator.Send(command);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteApplicationCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }
}
