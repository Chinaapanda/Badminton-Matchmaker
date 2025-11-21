"use client";

import { useState } from "react";

interface SessionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, courts: number, randomness: number) => void;
  onImportFromLocalStorage?: () => void;
  hasLocalStorageData?: boolean;
}

export default function SessionCreateModal({
  isOpen,
  onClose,
  onCreate,
  onImportFromLocalStorage,
  hasLocalStorageData = false,
}: SessionCreateModalProps) {
  const [sessionName, setSessionName] = useState("");
  const [courts, setCourts] = useState(1);
  const [randomness, setRandomness] = useState(0.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate(sessionName.trim(), courts, randomness);
      // Reset form
      setSessionName("");
      setCourts(1);
      setRandomness(0.5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (onImportFromLocalStorage) {
      setIsSubmitting(true);
      try {
        await onImportFromLocalStorage();
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Create New Session</h2>
          <button onClick={onClose} className="close-button" disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Session Name */}
          <div className="form-group">
            <label htmlFor="sessionName">
              Session Name <span className="required">*</span>
            </label>
            <input
              id="sessionName"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Friday Night Games"
              className="input"
              required
              disabled={isSubmitting}
              autoFocus
            />
            <div className="input-hint">Give your session a memorable name</div>
          </div>

          {/* Number of Courts */}
          <div className="form-group">
            <label htmlFor="courts">Number of Courts</label>
            <div className="court-selector">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCourts(num)}
                  className={`court-button ${courts === num ? "active" : ""}`}
                  disabled={isSubmitting}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="input-hint">
              {courts} court{courts > 1 ? "s" : ""} = {courts * 4} players per round
            </div>
          </div>

          {/* Randomness Level */}
          <div className="form-group">
            <label htmlFor="randomness">
              Randomness Level
              <span className="randomness-value">{(randomness * 100).toFixed(0)}%</span>
            </label>
            <input
              id="randomness"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={randomness}
              onChange={(e) => setRandomness(parseFloat(e.target.value))}
              className="slider"
              disabled={isSubmitting}
            />
            <div className="slider-labels">
              <span>Fair</span>
              <span>Balanced</span>
              <span>Random</span>
            </div>
            <div className="input-hint">
              {randomness < 0.3 && "Prioritizes fairness and balance"}
              {randomness >= 0.3 && randomness <= 0.7 && "Balanced mix of fair and varied matches"}
              {randomness > 0.7 && "More variety, less predictable matchups"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="button button-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting || !sessionName.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Session"}
            </button>
          </div>

          {/* Import from localStorage option */}
          {hasLocalStorageData && onImportFromLocalStorage && (
            <>
              <div className="divider">
                <span>OR</span>
              </div>
              <button
                type="button"
                onClick={handleImport}
                className="button button-import"
                disabled={isSubmitting}
              >
                📥 Import from Browser Storage
              </button>
              <div className="input-hint center">
                Import your current localStorage data as a new session
              </div>
            </>
          )}
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 2rem;
          line-height: 1;
          color: white;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .close-button:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2d3748;
          font-size: 0.9375rem;
        }

        .required {
          color: #e53e3e;
        }

        .input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input:disabled {
          background-color: #f7fafc;
          cursor: not-allowed;
        }

        .input-hint {
          margin-top: 0.375rem;
          font-size: 0.8125rem;
          color: #718096;
        }

        .input-hint.center {
          text-align: center;
        }

        .court-selector {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .court-button {
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-weight: 600;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .court-button:hover:not(:disabled) {
          border-color: #667eea;
          background-color: #f7faff;
        }

        .court-button.active {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .court-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .randomness-value {
          float: right;
          color: #667eea;
          font-weight: 700;
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(
            to right,
            #48bb78 0%,
            #4299e1 50%,
            #ed8936 100%
          );
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #667eea;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #667eea;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #a0aec0;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .button {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-secondary {
          background: #edf2f7;
          color: #4a5568;
        }

        .button-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .button-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .button-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .button-import {
          width: 100%;
          background: #ed8936;
          color: white;
          box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
        }

        .button-import:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(237, 137, 54, 0.4);
        }

        .divider {
          text-align: center;
          margin: 1.5rem 0;
          position: relative;
        }

        .divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
        }

        .divider span {
          background: white;
          padding: 0 1rem;
          position: relative;
          font-size: 0.875rem;
          color: #a0aec0;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
