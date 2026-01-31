import React, { useEffect, useMemo, useState } from 'react';
import { ServerRegion } from '../types/resources.types';
import { formatCountdown, getNextResetUtc } from '../utils/resetTime';

interface ResourcesHeaderProps {
    serverRegion: ServerRegion;
    onServerRegionChange: (region: ServerRegion) => void;
    selectedMap: string;
    onMapChange: (map: string) => void;
    maxedNodes: number;
    totalGatherables: number;
}

const ResourcesHeader: React.FC<ResourcesHeaderProps> = ({ serverRegion, onServerRegionChange, selectedMap, onMapChange, maxedNodes, totalGatherables }) => {

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const nextReset = useMemo(() => getNextResetUtc(new Date(now), serverRegion), [now, serverRegion]);
    const msLeft = nextReset.getTime() - now;

    return (
        <div className="resources-header">
            {/* Row 1: Page name */}
            <div className="resources-header-row-1">
                <h1 className="resources-header-title">Resources</h1>
            </div>

            {/* Row 2: Daily reset, Map, Server */}
            <div className="resources-header-row-2">
                <div className="resources-header-reset">
                    <span className="resources-header-reset-label">Daily Reset in:</span>
                    <span className="resources-header-countdown">{formatCountdown(msLeft)}</span>
                </div>
                <div className="resources-header-map">
                    <label className="resources-header-label">
                        Map
                        <select 
                            className="resources-header-select"
                            value={selectedMap} 
                            onChange={(e) => onMapChange(e.target.value)}
                        >
                            <option value="Valley IV">Valley IV</option>
                            <option value="Wuling">Wuling</option>
                        </select>
                    </label>
                </div>
                <div className="resources-header-server">
                    <label className="resources-header-label">
                        Server
                        <select 
                            className="resources-header-select"
                            value={serverRegion} 
                            onChange={(e) => onServerRegionChange(e.target.value as ServerRegion)}
                        >
                            <option value="ASIA_UTC8">Asia (UTC+8)</option>
                            <option value="AMER_EU_UTC_MINUS_5">America/Europe (UTC-5)</option>
                        </select>
                    </label>
                </div>
            </div>

            {/* Row 3: Chips */}
            <div className="resources-header-row-3">
                <div className="resources-header-chip">
                    <span className="resources-header-chip-label">Maxed Nodes:</span>
                    <span className="resources-header-chip-value">{maxedNodes}</span>
                </div>
                <div className="resources-header-chip">
                    <span className="resources-header-chip-label">Total Gatherables:</span>
                    <span className="resources-header-chip-value">{totalGatherables}</span>
                </div>
            </div>
        </div>
    );
}

export default ResourcesHeader;