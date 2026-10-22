using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public record ServiceCategoryDef(
    string Key,
    Guid Id,
    Guid CategoryId,
    string Name,
    string? Group,
    string Code,
    string Desc,
    string Contract
);

public record ServiceVariantDef(
    Guid Id,
    Guid ServiceId,
    ServiceVariantType Type,
    string Description,
    bool IsIndividual = true
);

public record VariantElementDef(
    Guid VariantId,
    string Code,
    string Description
);

public record ServiceNoteDef(
    Guid ServiceId,
    Guid? ServiceVariantId,
    string Content
);

public record RequirementDef(
    Guid Id,
    string Name,
    string Desc
);

public record VariantRequirementDef(
    Guid VariantId,
    Guid ReqId,
    bool IsRequired
);

public record FormSectionDef(
    string Key,
    string Title,
    List<string> FieldKeys
);

public record ServiceFormDef(
    string ServiceKey,
    Guid FormId,
    Guid SectionGuidPrefix,
    List<FormSectionDef> Sections
);

public record ServiceInformationDef(
    Guid Id,
    string[] Keywords,
    string Information,
    string WhoMayAvail
);
