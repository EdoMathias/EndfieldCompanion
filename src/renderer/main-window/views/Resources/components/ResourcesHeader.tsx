import React, { useEffect, useMemo, useState } from 'react';
import { ServerRegion } from '../types/resources.types';
import { formatCountdown, getNextResetUtc } from '../utils/resetTime';

interface ResourcesHeaderProps {
    serverRegion: ServerRegion;
    onServerRegionChange: (region: ServerRegion) => void;
}

const ResourcesHeader: React.FC<ResourcesHeaderProps> = ({ serverRegion, onServerRegionChange }) => {

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const nextReset = useMemo(() => getNextResetUtc(new Date(now), serverRegion), [now, serverRegion]);
    const msLeft = nextReset.getTime() - now;

    return (
        <div className="resources-header">
            <div className="resources-header-main">
                <h1 className="resources-header-title">Resources</h1>
                <div className="resources-header-reset">
                    Daily Reset in: <span className="resources-header-countdown">{formatCountdown(msLeft)}</span>
                </div>
            </div>

            <div className="resources-header-controls">
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
    );
}

export default ResourcesHeader;