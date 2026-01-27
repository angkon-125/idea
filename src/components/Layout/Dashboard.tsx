import { useGravity } from '../../context/GravityContext';
import { Header } from './Header';

import { AuraAssistant } from '../Voice/AuraAssistant';
import { SpectrumAnalyzer } from '../Audio/SpectrumAnalyzer';
import { DiagnosticPanel } from '../Agent/DiagnosticPanel';
import { RadioTuner } from '../Radio/RadioTuner';
import { AetherSphere } from '../Radio/AetherSphere';
import './Dashboard.css';

export function Dashboard() {
    const { state } = useGravity();
    const { system } = state;

    return (
        <div className={`dashboard ${system.internetStatus !== 'stable' ? 'animate-flicker' : ''}`}>
            <div className="holographic-overlay" />
            <Header />

            <main className="dashboard-main radio-mode">
                <aside className="dashboard-sidebar left holographic">
                    <RadioTuner />
                    <AuraAssistant />
                </aside>

                <section className="dashboard-center">
                    <AetherSphere />
                    <SpectrumAnalyzer />
                </section>

                <aside className="dashboard-sidebar right holographic">
                    <DiagnosticPanel />
                </aside>
            </main>

            <footer className="dashboard-footer">
                <div className="footer-left">
                    <span className="footer-brand">ThunderStrike™ Anti-Gravity Radio System</span>
                    <span className="footer-version">v3.0.0-crypto-radio</span>
                </div>
                <div className="footer-center">
                    <span className="footer-status">
                        <span className="status-dot animate-pulse" />
                        Gemini-Integrated Comms-Link • Active
                    </span>
                </div>
                <div className="footer-right">
                    <span className="footer-time">{new Date().toLocaleTimeString()}</span>
                </div>
            </footer>
        </div>
    );
}
