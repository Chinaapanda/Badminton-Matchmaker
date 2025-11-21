"use client";

import type { SessionWithDetails } from "@/lib/api/sessions";
import { useState } from "react";

interface SessionSelectorProps {
  currentSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  onCreateNew: () => void;
  sessions: SessionWithDetails[];
  isLoading?: boolean;
}

export default function SessionSelector({
  currentSessionId,
  onSessionChange,
  onCreateNew,
  sessions,
  isLoading = false,
}: SessionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="session-selector">
      <div className="session-selector-container">
        {/* Current Session Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="session-selector-button"
          disabled={isLoading}
        >
          <div className="session-info">
            <span className="session-icon">🎯</span>
            <div className="session-details">
              {currentSession ? (
                <>
                  <div className="session-name">{currentSession.name}</div>
                  <div className="session-meta">
                    Round {currentSession.current_round} •{" "}
                    {currentSession.player_count || 0} players
                  </div>
                </>
              ) : (
                <>
                  <div className="session-name">No Active Session</div>
                  <div className="session-meta">Select or create a session</div>
                </>
              )}
            </div>
          </div>
          <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="session-dropdown">
            {/* localStorage Mode Option */}
            <button
              onClick={() => {
                onSessionChange(null);
                setIsOpen(false);
              }}
              className={`session-option ${!currentSessionId ? "active" : ""}`}
            >
              <div className="option-content">
                <span className="option-icon">💾</span>
                <div>
                  <div className="option-name">Legacy Mode</div>
                  <div className="option-description">
                    Use browser storage (local only)
                  </div>
                </div>
              </div>
              {!currentSessionId && <span className="checkmark">✓</span>}
            </button>

            <div className="dropdown-divider"></div>

            {/* Active Sessions */}
            {sessions.filter((s) => s.status === "active").length > 0 && (
              <>
                <div className="dropdown-section-title">Active Sessions</div>
                {sessions
                  .filter((s) => s.status === "active")
                  .map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        onSessionChange(session.id);
                        setIsOpen(false);
                      }}
                      className={`session-option ${session.id === currentSessionId ? "active" : ""}`}
                    >
                      <div className="option-content">
                        <span className="option-icon">🏸</span>
                        <div>
                          <div className="option-name">{session.name}</div>
                          <div className="option-description">
                            Round {session.current_round} •{" "}
                            {session.player_count || 0} players •{" "}
                            {new Date(session.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {session.id === currentSessionId && (
                        <span className="checkmark">✓</span>
                      )}
                    </button>
                  ))}
              </>
            )}

            {/* Paused Sessions */}
            {sessions.filter((s) => s.status === "paused").length > 0 && (
              <>
                <div className="dropdown-divider"></div>
                <div className="dropdown-section-title">Paused Sessions</div>
                {sessions
                  .filter((s) => s.status === "paused")
                  .map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        onSessionChange(session.id);
                        setIsOpen(false);
                      }}
                      className={`session-option ${session.id === currentSessionId ? "active" : ""}`}
                    >
                      <div className="option-content">
                        <span className="option-icon">⏸️</span>
                        <div>
                          <div className="option-name">{session.name}</div>
                          <div className="option-description">
                            Round {session.current_round} •{" "}
                            {new Date(session.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {session.id === currentSessionId && (
                        <span className="checkmark">✓</span>
                      )}
                    </button>
                  ))}
              </>
            )}

            <div className="dropdown-divider"></div>

            {/* Create New Session Button */}
            <button
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="session-option create-new"
            >
              <div className="option-content">
                <span className="option-icon">➕</span>
                <div>
                  <div className="option-name">Create New Session</div>
                  <div className="option-description">
                    Start a new game session
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <style jsx>{`
        .session-selector {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .session-selector-container {
          position: relative;
        }

        .session-selector-button {
          width: 100%;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .session-selector-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .session-selector-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .session-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
        }

        .session-icon {
          font-size: 1.5rem;
        }

        .session-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .session-name {
          font-weight: 600;
          font-size: 1rem;
        }

        .session-meta {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .dropdown-arrow {
          font-size: 0.75rem;
          transition: transform 0.3s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .session-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .session-option {
          width: 100%;
          padding: 0.875rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          text-align: left;
        }

        .session-option:hover {
          background-color: #f7fafc;
        }

        .session-option.active {
          background-color: #edf2f7;
        }

        .session-option.create-new {
          color: #667eea;
          font-weight: 600;
        }

        .session-option.create-new:hover {
          background-color: #e6efff;
        }

        .option-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .option-icon {
          font-size: 1.25rem;
        }

        .option-name {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.15rem;
        }

        .option-description {
          font-size: 0.8125rem;
          color: #718096;
        }

        .checkmark {
          color: #48bb78;
          font-weight: bold;
        }

        .dropdown-divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 0.5rem 0;
        }

        .dropdown-section-title {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #a0aec0;
          letter-spacing: 0.05em;
        }

        .dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        /* Scrollbar styling */
        .session-dropdown::-webkit-scrollbar {
          width: 8px;
        }

        .session-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 0 12px 12px 0;
        }

        .session-dropdown::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }

        .session-dropdown::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
}
