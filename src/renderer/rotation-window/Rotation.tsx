import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/index.css';
import { useCurrentRotationFromStorage } from '../main-window/views/Rotations/hooks/useCurrentRotationFromStorage';
import { ACTION_TYPE_CONFIG } from '../main-window/views/Rotations/consts/rotations.consts';
import type { RotationStep } from '../main-window/views/Rotations/types/rotations.types';
import { HotkeysAPI } from '../../shared/services/hotkeys';
import { kHotkeys } from '../../shared/consts';

function RotationStepNodeReadOnly({ step, index }: { step: RotationStep; index: number }) {
    const hasAction = step.action != null;
    const typeConfig = step.action ? ACTION_TYPE_CONFIG[step.action.type] : null;
    return (
        <div className="rotation-step-node">
            <div className="rotation-step-node-circle">
                <div className={`rotation-step-node-circle-button rotation-step-node-circle-button--readonly ${!hasAction ? 'rotation-step-node-circle-button--empty' : ''}`}>
                    {!hasAction ? (
                        <span className="rotation-step-node-circle-empty">?</span>
                    ) : (
                        <>
                            <div className="rotation-step-node-ability">{step.character?.name ?? '—'}</div>
                            <div className="rotation-step-node-action-type">{typeConfig?.shortLabel ?? step.action?.name ?? '—'}</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function displayHotkey(binding: string | undefined, isUnassigned: boolean): string {
    if (isUnassigned || !binding || binding === 'Unassigned' || binding.trim() === '') {
        return 'Set in Settings';
    }
    return binding;
}

const RotationWindow: React.FC = () => {
    const currentRotation = useCurrentRotationFromStorage();
    const isEmpty = !currentRotation || currentRotation.steps.length === 0;
    const steps = currentRotation?.steps ?? [];
    const [hotkeyText, setHotkeyText] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const hotkeysMap = await HotkeysAPI.fetchAll();
                const rotationHotkey = hotkeysMap.get(kHotkeys.toggleRotationIngameWindow);
                const text = displayHotkey(rotationHotkey?.binding, rotationHotkey?.IsUnassigned ?? true);
                if (!cancelled) setHotkeyText(text);
            } catch {
                if (!cancelled) setHotkeyText('Set in Settings');
            }
        };
        load();
        const onChanged = () => load();
        overwolf.settings.hotkeys.onChanged.addListener(onChanged);
        return () => {
            cancelled = true;
            overwolf.settings.hotkeys.onChanged.removeListener(onChanged);
        };
    }, []);

    return (
        <div className="rotation-window">
            <div className="rotation-window-content">
                <div className="rotation-window-timeline">
                    <div className="rotation-window-buttons">
                        <div className="rotation-window-drag-handle" title="Drag to move window" aria-label="Drag to move window" />
                        <span className="rotation-window-hotkey-reminder" title="Toggle window visibility">
                            {hotkeyText}
                        </span>
                    </div>
                    {isEmpty ? (
                        <div className="rotation-window-empty">
                            <p>No rotation loaded. Select a preset in the companion app.</p>
                        </div>
                    ) : (
                        <>
                            {steps.map((step, index) => (
                                <div key={step.id} className="rotation-window-step-wrapper">
                                    <div className="rotation-window-step">
                                        <RotationStepNodeReadOnly step={step} index={index} />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <span className="rotation-window-arrow">&#8594;</span>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const mountRotation = () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error('Rotation root element not found');
        return;
    }

    const root = createRoot(container);
    root.render(<RotationWindow />);
};

const bootstrap = async () => {
    mountRotation();
};

bootstrap().catch((error) => {
    console.error('Failed to bootstrap rotation window', error);
});