export class Graphics {
    constructor() {
        this.depthStat = document.getElementById('depthStat');
        this.batteryStat = document.getElementById('batteryStat');
        this.drillPowerStat = document.getElementById('drillPowerStat');
    }

    updateStats(ship) {
        const depth = Math.abs(ship.getZ()) * 10;
        this.depthStat.textContent = `Depth in meters: ${depth}`;

        const battery = 1000;
        this.batteryStat.textContent = `Battery remaining: ${battery}`;

        this.drillPowerStat.textContent = `Drill power: ${ship.getDrillPower()}`;
    }

}