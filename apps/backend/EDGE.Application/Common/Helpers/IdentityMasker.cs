using System;
using System.Linq;

namespace EDGE.Application.Common.Helpers;

public static class IdentityMasker
{
    public static string MaskName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "A***y***s U***r";

        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var maskedParts = parts.Select(part =>
        {
            if (part.Length <= 2)
                return part[0] + "*";
            return part[0] + new string('*', part.Length - 2) + part[^1];
        });

        return string.Join(" ", maskedParts);
    }

    public static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return "a***s@a***s.local";

        var parts = email.Trim().Split('@');
        string namePart = parts[0];
        string domainPart = parts[1];

        string maskedName = namePart.Length switch
        {
            <= 2 => namePart[0] + "*",
            _ => namePart[0] + new string('*', namePart.Length - 2) + namePart[^1]
        };

        var domainParts = domainPart.Split('.');
        string maskedDomainHost = domainParts[0].Length switch
        {
            <= 2 => domainParts[0][0] + "*",
            _ => domainParts[0][0] + new string('*', domainParts[0].Length - 2) + domainParts[0][^1]
        };

        string tld = domainParts.Length > 1 ? string.Join(".", domainParts.Skip(1)) : "com";

        return $"{maskedName}@{maskedDomainHost}.{tld}";
    }
}
