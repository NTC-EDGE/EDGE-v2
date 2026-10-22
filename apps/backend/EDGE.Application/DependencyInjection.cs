using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using System.Reflection;
using EDGE.Application.Common.Behaviors;
using EDGE.Application.Forms.Services;

namespace EDGE.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            cfg.AddOpenBehavior(typeof(UserActivityLoggingBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);
        services.AddScoped<ContractFormValidator>();
        services.AddScoped<EDGE.Application.Receipts.Services.ICashierCustodianValidator, EDGE.Application.Receipts.Services.CashierCustodianValidator>();

        // Service Category Fee Calculation Strategies
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationStrategy, EDGE.Application.Fees.Calculations.Strategies.CertificateFeeCalculationStrategy>();
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationStrategy, EDGE.Application.Fees.Calculations.Strategies.LicenseFeeCalculationStrategy>();
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationStrategy, EDGE.Application.Fees.Calculations.Strategies.PermitFeeCalculationStrategy>();
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationStrategy, EDGE.Application.Fees.Calculations.Strategies.ExamFeeCalculationStrategy>();
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationStrategy, EDGE.Application.Fees.Calculations.Strategies.AccreditationFeeCalculationStrategy>();
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationStrategy, EDGE.Application.Fees.Calculations.Strategies.RequestsAndComplaintsFeeCalculationStrategy>();
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationStrategy, EDGE.Application.Fees.Calculations.Strategies.DefaultFeeCalculationStrategy>();
        services.AddSingleton<EDGE.Application.Fees.Calculations.IFeeCalculationEngine, EDGE.Application.Fees.Calculations.FeeCalculationEngine>();

        return services;
    }
}
