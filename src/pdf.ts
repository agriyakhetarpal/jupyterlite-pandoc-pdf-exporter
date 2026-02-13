// Copyright (c) Agriya Khetarpal
// SPDX-License-Identifier: BSD-3-Clause

import type { Contents } from '@jupyterlab/services';

import { BaseExporter } from '@jupyterlite/services';

// Typst compiler creates a global $typst
declare const $typst: {
  resetShadow: () => void;
  mapShadow: (path: string, data: Uint8Array) => void;
  pdf: (options: { mainFilePath: string }) => Promise<Uint8Array>;
};

let pandocConvert:
  | ((
      options: Record<string, unknown>,
      stdin: string | null,
      files: Record<string, string | Blob>
    ) => Promise<{
      stdout: string;
      stderr: string;
      mediaFiles?: Record<string, string | Blob>;
    }>)
  | null = null;
let pandocLoadingPromise: Promise<void> | null = null;
let typstLoaded = false;
let typstLoadingPromise: Promise<void> | null = null;

/**
 * A PDF exporter for JupyterLite notebooks using pandoc-wasm and Typst.
 *
 * The pipeline is as follows:
 * Notebook JSON ➡️ pandoc (ipynb ➡️ typst) ➡️ Typst markup ➡️ typst-ts ➡️ PDF
 */
export class PdfExporter extends BaseExporter {
  /**
   * The MIME type of the exported format.
   */
  readonly mimeType = 'application/pdf';

  /**
   * Export a notebook to PDF format.
   *
   * @param model The notebook model to export
   * @param path The path to the notebook
   */
  async export(model: Contents.IModel, path: string): Promise<void> {
    const notebook = model.content;

    // Load both pandoc and typst in parallel on first use
    await Promise.all([loadPandoc(), loadTypst()]);

    // step 1: convert notebook to Typst via pandoc-wasm
    const notebookJson = JSON.stringify(notebook);
    const files: Record<string, string | Blob> = {
      'notebook.ipynb': notebookJson
    };

    const result = await pandocConvert!(
      {
        from: 'ipynb',
        to: 'typst',
        standalone: true,
        'extract-media': '.',
        'input-files': ['notebook.ipynb']
      },
      null,
      files
    );

    if (result.stderr && result.stderr.includes('ERROR')) {
      throw new Error(`Pandoc conversion failed: ${result.stderr}`);
    }

    const typstContent = result.stdout;

    // step 2: compile the Typst to a PDF
    $typst.resetShadow();
    const typstBytes = new TextEncoder().encode(typstContent);
    $typst.mapShadow('/main.typ', typstBytes);

    // We also need to map extracted media files (e.g., matplotlib plots) into Typst's filesystem
    // TODO investigate if there's a more efficient way to pass these through without needing to go
    // through JS memory, especially for large files
    // TODO investigate if ipywidgets and other sorts of media work or if we need special handling for them
    if (result.mediaFiles) {
      for (const [filename, content] of Object.entries(result.mediaFiles)) {
        let bytes: Uint8Array;
        if (content instanceof Blob) {
          bytes = new Uint8Array(await content.arrayBuffer());
        } else if (typeof content === 'string') {
          bytes = new TextEncoder().encode(content);
        } else {
          continue;
        }
        $typst.mapShadow('/' + filename, bytes);
      }
    }

    const pdfData = await $typst.pdf({ mainFilePath: '/main.typ' });

    // This should not really happen since we'll at least have the PDF header
    // and at least one cell in the notebook (even if it's empty)
    if (!pdfData || pdfData.length === 0) {
      throw new Error('Typst produced empty PDF output');
    }

    // step 3: download the PDF in the browser
    const pdfBlob = new Blob([pdfData.buffer as ArrayBuffer], {
      type: 'application/pdf'
    });
    const filename = path.replace(/\.ipynb$/, '.pdf');
    triggerBlobDownload(pdfBlob, filename);
  }
}

/**
 * Lazy load the pandoc-wasm module. This is a large dependency, so
 * we only want to load it when the user actually tries to export a
 * notebook as PDF for the first time. Subsequent calls should reuse
 * the loaded module.
 * @returns – a promise that resolves when the pandoc-wasm module is loaded.
 */
async function loadPandoc(): Promise<void> {
  if (pandocConvert) {
    return;
  }
  if (pandocLoadingPromise) {
    return pandocLoadingPromise;
  }

  pandocLoadingPromise = (async () => {
    const pandocModule = await import('pandoc-wasm');
    pandocConvert = pandocModule.convert;
  })();

  return pandocLoadingPromise;
}

/**
 * Lazy load the Typst compiler module. This package sets the global
 * $typst when imported as a side effect.
 * @returns – a promise that resolves when the Typst compiler is loaded.
 */
async function loadTypst(): Promise<void> {
  if (typstLoaded && typeof $typst !== 'undefined') {
    return;
  }
  if (typstLoadingPromise) {
    return typstLoadingPromise;
  }

  typstLoadingPromise = (async () => {
    await import('@myriaddreamin/typst-all-in-one.ts');

    // The module sets the global $typst asynchronously, so poll until ready
    await new Promise<void>(resolve => {
      const checkTypst = (): void => {
        if (typeof $typst !== 'undefined') {
          typstLoaded = true;
          resolve();
        } else {
          setTimeout(checkTypst, 100);
        }
      };
      checkTypst();
    });
  })();

  return typstLoadingPromise;
}

/**
 * Trigger a download of a Blob in the browser with the specified filename.
 * @param blob – the Blob to download
 * @param filename – the desired filename for the downloaded file
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = url;
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}
