import { calculateRequestFee } from "./requestFeeCalculator";

describe("RequestFeeCalculator (Statutory Formulas & Spreadsheet gid=1451706480)", () => {
  it("computes Requests for Blocking of IMEI and SIM as free of charge (TOTAL = 0)", () => {
    const res = calculateRequestFee({
      serviceName: "Requests and Complaints of Consumers/Subscribers",
      applicationType: "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone",
    });

    expect(res.subTotal).toBe(0);
    expect(res.taxAmount).toBe(0);
    expect(res.surchargeAmount).toBe(0);
    expect(res.totalAmount).toBe(0);
    expect(res.formulaApplied).toBe("TOTAL = 0");
    expect(res.isFree).toBe(true);
    expect(res.lineItems).toHaveLength(1);
    expect(res.lineItems[0].feeRate).toBe(0);
    expect(res.lineItems[0].amount).toBe(0);
  });

  it("computes Requests for Unblocking of IMEI and SIM as free of charge", () => {
    const res = calculateRequestFee({
      serviceName: "Requests and Complaints of Consumers/Subscribers",
      applicationType: "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone",
    });

    expect(res.totalAmount).toBe(0);
    expect(res.subTotal).toBe(0);
    expect(res.isFree).toBe(true);
    expect(res.formulaApplied).toBe("TOTAL = 0");
  });

  it("computes Complaints on Text Spam / Scam as free of charge", () => {
    const res = calculateRequestFee({
      serviceName: "Requests and Complaints of Consumers/Subscribers",
      applicationType: "Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages",
    });

    expect(res.totalAmount).toBe(0);
    expect(res.taxAmount).toBe(0);
    expect(res.isFree).toBe(true);
    expect(res.formulaApplied).toBe("TOTAL = 0");
  });

  it("computes Complaints on Telco/Broadcast Service Providers as free of charge", () => {
    const res = calculateRequestFee({
      serviceName: "Requests and Complaints of Consumers/Subscribers",
      applicationType: "Complaints on Services Offered by Telecommunications or Broadcast Service Providers",
    });

    expect(res.totalAmount).toBe(0);
    expect(res.subTotal).toBe(0);
    expect(res.isFree).toBe(true);
    expect(res.formulaApplied).toBe("TOTAL = 0");
  });

  it("computes Request for Mandatory Tape Preservation as free of charge", () => {
    const res = calculateRequestFee({
      serviceName: "Requests and Complaints of Consumers/Subscribers",
      applicationType: "Request for Mandatory Tape Preservation",
    });

    expect(res.totalAmount).toBe(0);
    expect(res.taxAmount).toBe(0);
    expect(res.isFree).toBe(true);
    expect(res.formulaApplied).toBe("TOTAL = 0");
  });
});
