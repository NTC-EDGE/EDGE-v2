using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}
