import React from 'react';

const Rotations: React.FC = () => {
    return (
        <section className="rotations-container rotations-coming-soon">
            <div className="rotations-coming-soon-card">
                <div className="rotations-coming-soon-badge">Coming Soon</div>
                <h1 className="rotations-coming-soon-title">Rotations</h1>
                <p className="rotations-coming-soon-lead">
                    This page will give you the ability to create an in-game floating window with custom operator combos to hone your skills.
                </p>
                <ul className="rotations-coming-soon-features">
                    <li>Build and save custom operator combinations</li>
                    <li>Display your combos in an in-game overlay</li>
                </ul>
                <p className="rotations-coming-soon-hint">
                    We&apos;re working on it - check back later for updates.
                </p>
            </div>
        </section>
    );
};

export default Rotations;
