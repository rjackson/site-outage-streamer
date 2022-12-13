import outageWithinDates from "../../src/predicates/outage-within-dates";
import outagesValid from "../fixtures/outages/valid.json";

test("all outages pass if no dates are given", () => {
    outagesValid.forEach(outage => {
        const passed = outageWithinDates(outage);
        expect(passed).toEqual(true);
    });
});

test("outage within dates passes", () => {
    const from = "2022-12-01T00:00:00.000Z";
    const to = "2022-12-05:23:59:59.123Z";

    const [outage1, outage2, outage3] = outagesValid;
    expect(outageWithinDates(outage1, from, to)).toEqual(true);
    expect(outageWithinDates(outage2, from, to)).toEqual(true);
    expect(outageWithinDates(outage3, from, to)).toEqual(true);
});

test("outage before from date is rejected", () => {
    const from = "2022-12-02T01:02:03.123Z";

    const [outage1, outage2, outage3] = outagesValid;
    expect(outageWithinDates(outage1, from)).toEqual(false);
    expect(outageWithinDates(outage2, from)).toEqual(true);
    expect(outageWithinDates(outage3, from)).toEqual(true);
});

test("outage after to date is rejected", () => {
    const to = "2022-12-02T23:59:59.123Z";

    const [outage1, outage2, outage3] = outagesValid;
    expect(outageWithinDates(outage1, undefined, to)).toEqual(true);
    expect(outageWithinDates(outage2, undefined, to)).toEqual(true);
    expect(outageWithinDates(outage3, undefined, to)).toEqual(false);
});
