import Base from "./base";
import getOutages, { Outage } from "./get-outages";
import getSiteInfo, { SiteInfo } from "./get-site-info";
import postSiteOutage, { SiteOutageDetails } from "./post-site-outage";

interface SeaMonsterBends {
    getOutages(this: Base): Promise<Outage[]>
    getSiteInfo(this: Base, id: string): Promise<SiteInfo>
    postSiteOutage(this: Base, siteId: string, siteOutageDetails: SiteOutageDetails): Promise<void>
}

class SeaMonsterBends extends Base { }

SeaMonsterBends.prototype.getOutages = getOutages;
SeaMonsterBends.prototype.getSiteInfo = getSiteInfo;
SeaMonsterBends.prototype.postSiteOutage = postSiteOutage;

export default SeaMonsterBends;