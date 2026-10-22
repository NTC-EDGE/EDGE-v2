using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Fees.Calculations;

public interface IFeeCalculationEngine
{
    FeeCalculationResultDto Calculate(FeeCalculationRequest request);
}
