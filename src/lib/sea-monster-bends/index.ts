import Base from "./base";
import getOutages, { Outage } from "./get-outages";

interface SeaMonsterBends {
    getOutages(this: Base): Promise<Outage[]>
}

class SeaMonsterBends extends Base { }

SeaMonsterBends.prototype.getOutages = getOutages;

export default SeaMonsterBends;