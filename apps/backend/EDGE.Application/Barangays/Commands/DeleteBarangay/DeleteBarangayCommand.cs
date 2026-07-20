using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Barangays.Commands.DeleteBarangay;

public record DeleteBarangayCommand(Guid Id) : IRequest<ApiResponse<string>>;
