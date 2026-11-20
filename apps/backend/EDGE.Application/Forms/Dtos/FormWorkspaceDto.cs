using System.Collections.Generic;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Forms.Dtos;

public class FormWorkspaceDto
{
    public FormDto Form { get; set; } = new();
    public List<FormServiceOptionDto> LinkedServices { get; set; } = new();
    public List<ServiceVariantDto> ServiceVariants { get; set; } = new();
}
