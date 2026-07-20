using System.Text.Json;
using System.Text.Json.Serialization;

// =============================================================================
// GeoJSON → geographic-data.json Converter
// Extracts name/code properties only — no geometry/boundaries.
// =============================================================================

const string docsPath = @"c:\Users\User\Documents\EDGE-v2\docs";
const string outputPath = @"c:\Users\User\Documents\EDGE-v2\apps\backend\EDGE.Infrastructure\Persistence\SeedData\geographic-data.json";

var jsonOptions = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true,
    WriteIndented = true
};

Console.WriteLine();
Console.WriteLine("=====================================================");
Console.WriteLine(" Philippine Geographic Data Converter (.NET 10)");
Console.WriteLine("=====================================================");
Console.WriteLine();

// ── Step 1: Load all four GeoJSON levels ─────────────────────────────────────
Console.Write("[1/5] Loading Region data...    ");
var regions       = await ExtractPropertiesAsync(Path.Combine(docsPath, "Regionbdry.geojson"));

Console.Write("[2/5] Loading Province data...  ");
var provinces     = await ExtractPropertiesAsync(Path.Combine(docsPath, "Provincebdry.geojson"));

Console.Write("[3/5] Loading Municipality data...");
var municipalities = await ExtractPropertiesAsync(Path.Combine(docsPath, "Municipalitybdry.geojson"));

Console.Write("[4/5] Loading Barangay data...  ");
var barangays     = await ExtractPropertiesAsync(Path.Combine(docsPath, "Barangaybdry.geojson"));

// ── Step 2: Build lookup dictionaries ────────────────────────────────────────
Console.WriteLine("[5/5] Building hierarchical structure...");

var provincesByRegion  = IndexBy(provinces,     "ADM1_PCODE");
var munisByProvince    = IndexBy(municipalities, "ADM2_PCODE");
var barangaysByMuni    = IndexBy(barangays,      "ADM3_PCODE");

// ── Step 3: Assemble hierarchy ───────────────────────────────────────────────
var output = new List<object>();

foreach (var r in regions)
{
    var regionCode = Get(r, "ADM1_PCODE");
    var regionName = Get(r, "ADM1_EN");

    var provinceList = new List<object>();

    if (provincesByRegion.TryGetValue(regionCode, out var provGroup))
    {
        foreach (var p in provGroup)
        {
            var provCode = Get(p, "ADM2_PCODE");
            var provName = Get(p, "ADM2_EN");

            var muniList = new List<object>();

            if (munisByProvince.TryGetValue(provCode, out var muniGroup))
            {
                foreach (var m in muniGroup)
                {
                    var muniCode = Get(m, "ADM3_PCODE");
                    var muniName = Get(m, "ADM3_EN");

                    var brgyList = new List<object>();

                    if (barangaysByMuni.TryGetValue(muniCode, out var brgyGroup))
                    {
                        foreach (var b in brgyGroup)
                        {
                            brgyList.Add(new
                            {
                                id       = Guid.NewGuid().ToString(),
                                code     = Get(b, "ADM4_PCODE"),
                                name     = Get(b, "ADM4_EN"),
                                isActive = true
                            });
                        }
                    }

                    muniList.Add(new
                    {
                        id           = Guid.NewGuid().ToString(),
                        code         = muniCode,
                        name         = muniName,
                        isActive     = true,
                        barangays    = brgyList
                    });
                }
            }

            provinceList.Add(new
            {
                id             = Guid.NewGuid().ToString(),
                code           = provCode,
                name           = provName,
                isActive       = true,
                municipalities = muniList
            });
        }
    }

    output.Add(new
    {
        id        = Guid.NewGuid().ToString(),
        code      = regionCode,
        name      = regionName,
        isActive  = true,
        provinces = provinceList
    });
}

// ── Step 4: Write JSON output ─────────────────────────────────────────────────
Console.WriteLine();
Console.WriteLine($"Writing output to:");
Console.WriteLine($"  {outputPath}");

var json = JsonSerializer.Serialize(output, jsonOptions);
await File.WriteAllTextAsync(outputPath, json);

var fileSizeMB = new FileInfo(outputPath).Length / 1024.0 / 1024.0;

Console.WriteLine();
Console.WriteLine("=====================================================");
Console.WriteLine(" SUCCESS!");
Console.WriteLine($"  Regions        : {regions.Count}");
Console.WriteLine($"  Provinces      : {provinces.Count}");
Console.WriteLine($"  Municipalities : {municipalities.Count}");
Console.WriteLine($"  Barangays      : {barangays.Count}");
Console.WriteLine($"  Output size    : {fileSizeMB:F2} MB");
Console.WriteLine("=====================================================");
Console.WriteLine();

// =============================================================================
// Helpers
// =============================================================================

static async Task<List<Dictionary<string, string>>> ExtractPropertiesAsync(string filePath)
{
    var sw = System.Diagnostics.Stopwatch.StartNew();
    var results = new List<Dictionary<string, string>>();

    await using var stream = File.OpenRead(filePath);
    using var doc = await JsonDocument.ParseAsync(stream);

    var features = doc.RootElement.GetProperty("features");
    foreach (var feature in features.EnumerateArray())
    {
        var props = feature.GetProperty("properties");
        var ht = new Dictionary<string, string>();
        foreach (var prop in props.EnumerateObject())
        {
            ht[prop.Name] = prop.Value.ValueKind == JsonValueKind.Null
                ? string.Empty
                : prop.Value.ToString();
        }
        results.Add(ht);
    }

    sw.Stop();
    Console.WriteLine($"{results.Count} features in {sw.Elapsed.TotalSeconds:F1}s");
    return results;
}

static Dictionary<string, List<Dictionary<string, string>>> IndexBy(
    List<Dictionary<string, string>> items, string key)
{
    var index = new Dictionary<string, List<Dictionary<string, string>>>();
    foreach (var item in items)
    {
        if (!item.TryGetValue(key, out var k) || string.IsNullOrEmpty(k)) continue;
        if (!index.ContainsKey(k)) index[k] = new List<Dictionary<string, string>>();
        index[k].Add(item);
    }
    return index;
}

static string Get(Dictionary<string, string> dict, string key) =>
    dict.TryGetValue(key, out var v) ? v : string.Empty;
