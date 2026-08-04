using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.SystemConfigs.DTOs;
using EDGE.Domain.Entities;

namespace EDGE.Application.SystemConfigs.Commands.UpdateSystemConfig;

public class UpdateSystemConfigCommandHandler : IRequestHandler<UpdateSystemConfigCommand, SystemConfigDto>
{
    private readonly ISystemConfigRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSystemConfigCommandHandler(ISystemConfigRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SystemConfigDto> Handle(UpdateSystemConfigCommand request, CancellationToken cancellationToken)
    {
        var config = await _repository.GetByKeyAsync(request.Key, cancellationToken);
        if (config == null)
        {
            config = new SystemConfig
            {
                Key = request.Key,
                Value = request.Value,
                Description = request.Description ?? "Application configuration setting",
                Category = request.Category ?? "General",
                DataType = "String",
                IsPublic = false
            };
            await _repository.AddAsync(config, cancellationToken);
        }
        else
        {
            config.Value = request.Value;
            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                config.Description = request.Description;
            }
            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                config.Category = request.Category;
            }
            _repository.Update(config);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SystemConfigDto
        {
            Id = config.Id,
            Category = config.Category,
            Key = config.Key,
            Value = config.Value,
            Description = config.Description,
            DataType = config.DataType,
            IsPublic = config.IsPublic,
            LastModifiedAt = config.LastModifiedAt
        };
    }
}
