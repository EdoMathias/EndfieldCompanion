import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/index.css';
import { useCurrentRotationFromStorage } from '../main-window/views/Rotations/hooks/useCurrentRotationFromStorage';
import { useSquadFromStorage } from '../main-window/views/Rotations/hooks/useSquadFromStorage';
import { ACTION_TYPE_CONFIG } from '../main-window/views/Rotations/consts/rotations.consts';
import type { RotationStep } from '../main-window/views/Rotations/types/rotations.types';
import { HotkeysAPI } from '../../shared/services/hotkeys';
import { kHotkeys, kWindowNames } from '../../shared/consts';
import { ROTATION_WINDOW_SETTINGS_KEY } from '../main-window/views/Rotations/consts/rotations.consts';
const DEFAULT_STEP_SIZE = 1;
const DEFAULT_OPACITY = 1;
const DEFAULT_SHOW_SQUAD_INDEX = false;

export type RotationWindowSettings = { stepSize: number; opacity: number; showSquadIndex: boolean };

function loadRotationWindowSettings(): RotationWindowSettings {
    try {
        const raw = localStorage.getItem(ROTATION_WINDOW_SETTINGS_KEY);
        if (!raw) return { stepSize: DEFAULT_STEP_SIZE, opacity: DEFAULT_OPACITY, showSquadIndex: DEFAULT_SHOW_SQUAD_INDEX };
        const parsed = JSON.parse(raw) as { stepSize?: number; opacity?: number; showSquadIndex?: boolean };
        return {
            stepSize: typeof parsed.stepSize === 'number' ? Math.max(0.6, Math.min(1.4, parsed.stepSize)) : DEFAULT_STEP_SIZE,
            opacity: typeof parsed.opacity === 'number' ? Math.max(0.2, Math.min(1, parsed.opacity)) : DEFAULT_OPACITY,
            showSquadIndex: typeof parsed.showSquadIndex === 'boolean' ? parsed.showSquadIndex : DEFAULT_SHOW_SQUAD_INDEX,
        };
    } catch {
        return { stepSize: DEFAULT_STEP_SIZE, opacity: DEFAULT_OPACITY, showSquadIndex: DEFAULT_SHOW_SQUAD_INDEX };
    }
}

function saveRotationWindowSettings(settings: RotationWindowSettings) {
    try {
        localStorage.setItem(ROTATION_WINDOW_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save rotation window settings', e);
    }
}

function RotationStepNodeReadOnly({ step, index, characterLabel }: { step: RotationStep; index: number; characterLabel?: string }) {
    const hasAction = step.action != null;
    const typeConfig = step.action ? ACTION_TYPE_CONFIG[step.action.type] : null;
    const borderColor = hasAction && typeConfig ? typeConfig.color : undefined;
    const nameOrIndex = characterLabel ?? step.character?.name ?? '—';
    return (
        <div className="rotation-step-node">
            <div className="rotation-step-node-circle">
                <div
                    className={`rotation-step-node-circle-button rotation-step-node-circle-button--readonly ${!hasAction ? 'rotation-step-node-circle-button--empty' : ''}`}
                    style={borderColor != null ? { borderColor } : undefined}
                >
                    {!hasAction ? (
                        <span className="rotation-step-node-circle-empty">?</span>
                    ) : (
                        <>
                            <div className="rotation-step-node-ability">{nameOrIndex}</div>
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
    const squad = useSquadFromStorage();
    const isEmpty = !currentRotation || currentRotation.steps.length === 0;
    const steps = currentRotation?.steps ?? [];
    const [hotkeyText, setHotkeyText] = useState<string>('');
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState(loadRotationWindowSettings);

    const getCharacterLabel = useCallback(
        (characterId: string | undefined) => {
            if (!settings.showSquadIndex || !characterId) return undefined;
            const idx = squad.findIndex((c) => c.id === characterId);
            return idx >= 0 ? String(idx + 1) : undefined;
        },
        [squad, settings.showSquadIndex]
    );

    const applySettings = useCallback((next: RotationWindowSettings) => {
        saveRotationWindowSettings(next);
        setSettings(next);
    }, []);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key !== ROTATION_WINDOW_SETTINGS_KEY) return;
            const loaded = loadRotationWindowSettings();
            setSettings(loaded);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

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
                <div className="rotation-window-controls">
                    <div className="rotation-window-drag-handle"/>
                    <span className="rotation-window-hotkey-reminder">
                        {hotkeyText}
                    </span>
                    <button
                        type="button"
                        className="rotation-window-settings-button"
                        onClick={() => setShowSettings((v) => !v)}
                    >
                        &#9881;
                    </button>
                </div>
                <div
                    className="rotation-window-steps-outer"
                    style={{ minHeight: 88 * settings.stepSize }}
                >
                    <div
                        className="rotation-window-steps"
                        style={{
                            opacity: settings.opacity,
                            transform: `scale(${settings.stepSize})`,
                        }}
                    >
                        {isEmpty ? (
                            <div className="rotation-window-empty">
                                <p>No rotation loaded. Select a preset in the companion app.</p>
                            </div>
                        ) : (
                            <div className="rotation-window-timeline">
                            {steps.map((step, index) => (
                                <div key={step.id} className="rotation-window-step-wrapper">
                                    <div className="rotation-window-step">
                                        <RotationStepNodeReadOnly
                                            step={step}
                                            index={index}
                                            characterLabel={getCharacterLabel(step.character?.id)}
                                        />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <span className="rotation-window-arrow">&#8594;</span>
                                    )}
                                </div>
                            ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showSettings && (
                <div className="rotation-window-settings-panel">
                    <div className="rotation-window-settings-panel-inner">
                        <h4 className="rotation-window-settings-title">Rotation steps</h4>
                        <label className="rotation-window-settings-label">
                            Step size {Math.round(settings.stepSize * 100)}%
                            <input
                                type="range"
                                min={60}
                                max={140}
                                value={Math.round(settings.stepSize * 100)}
                                onChange={(e) => {
                                    const stepSize = Math.max(0.6, Math.min(1.4, Number(e.target.value) / 100));
                                    applySettings({ ...settings, stepSize });
                                }}
                                className="rotation-window-settings-slider"
                            />
                        </label>
                        <label className="rotation-window-settings-label">
                            Steps opacity {Math.round(settings.opacity * 100)}%
                            <input
                                type="range"
                                min={20}
                                max={100}
                                value={Math.round(settings.opacity * 100)}
                                onChange={(e) => {
                                    const opacity = Math.max(0.2, Math.min(1, Number(e.target.value) / 100));
                                    applySettings({ ...settings, opacity });
                                }}
                                className="rotation-window-settings-slider"
                            />
                        </label>
                        <label className="rotation-window-settings-label rotation-window-settings-label--checkbox">
                            <input
                                type="checkbox"
                                checked={settings.showSquadIndex}
                                onChange={(e) => applySettings({ ...settings, showSquadIndex: e.target.checked })}
                                className="rotation-window-settings-checkbox"
                            />
                            <span>Show squad index instead of name</span>
                        </label>
                        <button type="button" className="rotation-window-settings-close" onClick={() => setShowSettings(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
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