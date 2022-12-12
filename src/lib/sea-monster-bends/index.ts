import Base from "./base";
import getOutages, { Outage } from "./get-outages";
import getSiteInfo, { SiteInfo } from "./get-site-info";

interface SeaMonsterBends {
    getOutages(this: Base): Promise<Outage[]>
    getSiteInfo(this: Base, id: string): Promise<SiteInfo>
}

class SeaMonsterBends extends Base { }

SeaMonsterBends.prototype.getOutages = getOutages;
SeaMonsterBends.prototype.getSiteInfo = getSiteInfo;

export default SeaMonsterBends;