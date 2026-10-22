using System;
using System.Text;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Converts monetary amounts and integer numbers into English words
/// (e.g., 2540.50 -> "TWO THOUSAND FIVE HUNDRED FORTY PESOS AND FIFTY CENTS ONLY").
/// </summary>
public static class NumberToWordsConverter
{
    private static readonly string[] UnitsMap =
    {
        "ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
        "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"
    };

    private static readonly string[] TensMap =
    {
        "ZERO", "TEN", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
    };

    public static string Convert(decimal amount, string currencyName = "PESOS", string fractionName = "CENTS")
    {
        if (amount < 0)
        {
            return "MINUS " + Convert(Math.Abs(amount), currencyName, fractionName);
        }

        long wholePart = (long)Math.Floor(amount);
        int centsPart = (int)Math.Round((amount - wholePart) * 100);

        var sb = new StringBuilder();

        if (wholePart == 0)
        {
            sb.Append("ZERO");
        }
        else
        {
            sb.Append(ConvertWholeNumber(wholePart));
        }

        sb.Append(' ').Append(currencyName);

        if (centsPart > 0)
        {
            sb.Append(" AND ").Append(ConvertWholeNumber(centsPart)).Append(' ').Append(fractionName);
        }
        else
        {
            sb.Append(" ONLY");
        }

        return sb.ToString().Trim();
    }

    public static string ConvertWholeNumber(long number)
    {
        if (number == 0)
            return "ZERO";

        if (number < 0)
            return "MINUS " + ConvertWholeNumber(Math.Abs(number));

        var words = new StringBuilder();

        if (number / 1_000_000_000 > 0)
        {
            words.Append(ConvertWholeNumber(number / 1_000_000_000)).Append(" BILLION ");
            number %= 1_000_000_000;
        }

        if (number / 1_000_000 > 0)
        {
            words.Append(ConvertWholeNumber(number / 1_000_000)).Append(" MILLION ");
            number %= 1_000_000;
        }

        if (number / 1_000 > 0)
        {
            words.Append(ConvertWholeNumber(number / 1_000)).Append(" THOUSAND ");
            number %= 1_000;
        }

        if (number / 100 > 0)
        {
            words.Append(ConvertWholeNumber(number / 100)).Append(" HUNDRED ");
            number %= 100;
        }

        if (number > 0)
        {
            if (number < 20)
            {
                words.Append(UnitsMap[number]);
            }
            else
            {
                words.Append(TensMap[number / 10]);
                if (number % 10 > 0)
                {
                    words.Append(' ').Append(UnitsMap[number % 10]);
                }
            }
        }

        return words.ToString().Trim();
    }
}
