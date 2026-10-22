using System;
using System.Text.Json;
using EDGE.Application.Common.JsonConverters;
using Xunit;

namespace EDGE.Application.UnitTests.JsonConverters;

public class FlexibleDateOnlyJsonConverterTests
{
    private readonly JsonSerializerOptions _options;

    public FlexibleDateOnlyJsonConverterTests()
    {
        _options = new JsonSerializerOptions();
        _options.Converters.Add(new FlexibleDateOnlyJsonConverter());
        _options.Converters.Add(new FlexibleNullableDateOnlyJsonConverter());
    }

    private class TestModel
    {
        public DateOnly Date { get; set; }
        public DateOnly? NullableDate { get; set; }
    }

    [Theory]
    [InlineData("{\"Date\":\"2026-08-18\"}", 2026, 8, 18)]
    [InlineData("{\"Date\":\"2026-08-18T00:00:00Z\"}", 2026, 8, 18)]
    [InlineData("{\"Date\":\"2026-08-18T14:30:00+08:00\"}", 2026, 8, 18)]
    [InlineData("{\"Date\":\"2026-08-18T23:59:59.999Z\"}", 2026, 8, 18)]
    [InlineData("{\"Date\":\"2026/08/18\"}", 2026, 8, 18)]
    [InlineData("{\"Date\":\"\"}", 1, 1, 1)]
    [InlineData("{\"Date\":null}", 1, 1, 1)]
    public void Deserializes_DateOnly_Correctly(string json, int expectedYear, int expectedMonth, int expectedDay)
    {
        var model = JsonSerializer.Deserialize<TestModel>(json, _options);

        Assert.NotNull(model);
        Assert.Equal(new DateOnly(expectedYear, expectedMonth, expectedDay), model.Date);
    }

    [Theory]
    [InlineData("{\"NullableDate\":\"2026-08-18\"}", 2026, 8, 18)]
    [InlineData("{\"NullableDate\":\"2026-08-18T00:00:00Z\"}", 2026, 8, 18)]
    [InlineData("{\"NullableDate\":\"2026-08-18T08:00:00+08:00\"}", 2026, 8, 18)]
    public void Deserializes_NullableDateOnly_Correctly(string json, int expectedYear, int expectedMonth, int expectedDay)
    {
        var model = JsonSerializer.Deserialize<TestModel>(json, _options);

        Assert.NotNull(model);
        Assert.NotNull(model.NullableDate);
        Assert.Equal(new DateOnly(expectedYear, expectedMonth, expectedDay), model.NullableDate.Value);
    }

    [Fact]
    public void Deserializes_Null_And_Empty_NullableDateOnly_As_Null()
    {
        var jsonNull = "{\"NullableDate\":null}";
        var modelNull = JsonSerializer.Deserialize<TestModel>(jsonNull, _options);
        Assert.NotNull(modelNull);
        Assert.Null(modelNull.NullableDate);

        var jsonEmpty = "{\"NullableDate\":\"\"}";
        var modelEmpty = JsonSerializer.Deserialize<TestModel>(jsonEmpty, _options);
        Assert.NotNull(modelEmpty);
        Assert.Null(modelEmpty.NullableDate);
    }
}
