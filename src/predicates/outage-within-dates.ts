import { Outage } from "../lib/sea-monster-bends/get-outages";

const outageWithinDates: (outage: Outage, from?: string, to?: string) => boolean = (outage, from, to) => {
    if (from && new Date(outage.begin) < new Date(from)) {
        return false;
    }

    if (to && new Date(outage.begin) > new Date(to)) {
        return false;
    }

    return true;
};

export default outageWithinDates;