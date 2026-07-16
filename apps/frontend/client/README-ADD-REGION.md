# Setup Guide

This guide helps you configure your application with region-based options.

## Region Configuration

Each region is defined using an object with the following properties:
- `label`: A readable name for the region.
- `value`: A system identifier, typically used in the backend or frontend routing.
- `key`: A shorthand key, usually a number as a string.

### Example: Adding Region 9

To add Region 9 to your configuration, insert the following object in your regions list:

```js
{ label: "Region 9", value: "ntc-region9", key: "9" }
 const nonYetRegions = ["I", "II", "III", "IV-A", "IV-B", "V", "VI", "VII", "VIII", "NCR", "XIV"].includes(region?.value);
