import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the jupyterlite-pandoc-pdf-exporter extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlite-pandoc-pdf-exporter:plugin',
  description: 'A PDF exporter for JupyterLite based on a WebAssembly distribution of Pandoc',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension jupyterlite-pandoc-pdf-exporter is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterlite-pandoc-pdf-exporter settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlite-pandoc-pdf-exporter.', reason);
        });
    }
  }
};

export default plugin;
