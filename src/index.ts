// Copyright (c) Agriya Khetarpal
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { exportNotebookAsPdf } from './pdf';

const COMMAND_ID = 'jupyterlite-pandoc-pdf-exporter:export';

/**
 * A JupyterFrontEndPlugin that adds a "PDF via Pandoc" export
 * command to the File menu.
 * TODO: this is only temporary until I can figure out how to add
 * a proper exporter to the notebook's export menu under the File
 * menu tab, which is not working due to some mis-interaction with
 * the Pyodide kernel.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlite-pandoc-pdf-exporter:plugin',
  description:
    'A PDF exporter for JupyterLite based on a WebAssembly distribution of Pandoc',
  autoStart: true,
  requires: [INotebookTracker, IMainMenu],
  activate: (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    mainMenu: IMainMenu
  ): void => {
    app.commands.addCommand(COMMAND_ID, {
      label: 'Export Notebook to PDF via Pandoc',
      isEnabled: () => tracker.currentWidget !== null,
      execute: async () => {
        const panel = tracker.currentWidget;
        if (!panel) {
          return;
        }
        await panel.context.save();
        const model = panel.context.contentsModel;
        if (!model) {
          return;
        }
        try {
          await exportNotebookAsPdf(panel.context.model.toJSON(), model.path);
        } catch (error: any) {
          console.error('PDF export failed:', error);
          await app.commands.execute('apputils:notify', {
            message: `PDF export failed: ${error.message}`,
            type: 'error'
          });
        }
      }
    });

    mainMenu.fileMenu.addItem({
      command: COMMAND_ID,
      rank: 70
    });

    console.log(
      'jupyterlite-pandoc-pdf-exporter: PDF via Pandoc command has been registered'
    );
  }
};

export default plugin;
