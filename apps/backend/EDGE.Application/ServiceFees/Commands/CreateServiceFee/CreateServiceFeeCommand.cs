using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.ServiceFees.DTOs;

namespace EDGE.Application.ServiceFees.Commands.CreateServiceFee;

public record ServiceFeeEntry(Guid FeeId, decimal Amount);

public record CreateServiceFeeCommand(
    Guid ServiceId,
    List<ServiceFeeEntry> Fees
) : IRequest<List<ServiceFeeDto>>;
