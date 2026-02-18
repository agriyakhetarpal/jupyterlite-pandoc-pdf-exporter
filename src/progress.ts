// Copyright (c) Agriya Khetarpal
// SPDX-License-Identifier: BSD-3-Clause

import { ISignal, Signal } from '@lumino/signaling';

/**
 * This is a singleton class that manages the state of PDF export progress,
 * which we use to communicate progress updates from the PdfExporter to the
 * status bar widget.
 */
class PdfExportProgress {
  get progressChanged(): ISignal<this, string> {
    return this._progressChanged;
  }

  get activeStateChanged(): ISignal<this, void> {
    return this._activeStateChanged;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get message(): string {
    return this._message;
  }

  start(message: string): void {
    if (this._hideTimeout !== null) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
    this._isActive = true;
    this._message = message;
    this._activeStateChanged.emit(void 0);
    this._progressChanged.emit(message);
  }

  update(message: string): void {
    this._message = message;
    this._progressChanged.emit(message);
  }

  finish(message: string, hideDelayMs = 3000): void {
    this._message = message;
    this._progressChanged.emit(message);

    this._hideTimeout = window.setTimeout(() => {
      this._isActive = false;
      this._message = '';
      this._hideTimeout = null;
      this._activeStateChanged.emit(void 0);
    }, hideDelayMs);
  }

  private _isActive = false;
  private _message = '';
  private _hideTimeout: number | null = null;
  private _progressChanged = new Signal<this, string>(this);
  private _activeStateChanged = new Signal<this, void>(this);
}

export const pdfExportProgress = new PdfExportProgress();
