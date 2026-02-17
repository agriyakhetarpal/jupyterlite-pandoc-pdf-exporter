# Jupyterlite Pandoc PDF Exporter

[![Github Actions build status](https://github.com/agriyakhetarpal/jupyterlite-pandoc-pdf-exporter/workflows/Build/badge.svg)](https://github.com/agriyakhetarpal/jupyterlite-pandoc-pdf-exporter/actions/workflows/build.yml)
[![Try PDF exporter in JupyterLite](https://jupyterlite.rtfd.io/en/latest/_static/badge.svg)](https://agriyakhetarp.al/jupyterlite-pandoc-pdf-exporter/)

A serverless PDF exporter for JupyterLite based on WebAssembly distributions of Pandoc and Typst. This mono-plugin extension registers a
PDF exporter with [JupyterLite's `INbConvertExporters` interface](https://jupyterlite.readthedocs.io/en/stable/howto/extensions/custom-exporters.html).

## Usage

- Install this extension in your JupyterLite deployment via `pip install jupyterlite-pandoc-pdf-exporter` and rebuild your JupyterLite distribution.
- Open a notebook in JupyterLite, click on the "File" menu, and select "Save and Export Notebook As" > "PDF (via Pandoc)". The PDF file will be downloaded to your local machine at a location of your choice.

## Requirements

- JupyterLite 0.7.0 and later
- A modern web browser with support for WebAssembly and Web Workers (e.g., Chrome, Firefox, Safari, Edge, and so on). All browsers supported by JupyterLite should work with this extension.
- The extension relies on WebAssembly distributions of Pandoc and Typst. These distributions are quite large (over 50 MiB) and may take some time to download and initialise when the extension is first used. For a better user experience, it is recommended to use this extension in an environment with a stable and reasonably fast internet connection.

## Installation

To install the extension into your JupyterLite deployment, execute:

```bash
pip install jupyterlite-pandoc-pdf-exporter
```

and rebuild your JupyterLite distribution.

## Uninstalling the extension

To remove the extension from your JupyterLite deployment, execute:

```bash
pip uninstall jupyterlite-pandoc-pdf-exporter
```

and rebuild your JupyterLite distribution.

## License

The source code of this JupyterLite extension is licensed under the terms of the BSD-3-Clause "New" or "Revised" License (`BSD-3-Clause`; see the [LICENSE](LICENSE) file for details).

The distributions of this JupyterLite extension on the `npm` and `PyPI` package registries are licensed under the terms of the GNU General Public License version 2.0 (GPL-2.0) or later (`GPL-2.0-or-later`). Please see the [LICENSE.pandoc](LICENSE.pandoc) file for details.

The WebAssembly/JavaScript distribution of Typst, `@myriaddreamin/typst-all-in-one`, is licensed under the terms of the Apache License 2.0 (`Apache-2.0`). Please see the [LICENSE.typst](LICENSE.typst) file for details.

### Why?

The WebAssembly distribution of Pandoc, through its dependency on the `pandoc-wasm` project on the `npm` package registry, is licensed under the terms of the GNU General Public License version 2.0 (`GPL-2.0-or-later`). Binary distributions of this extension bundle the `pandoc.wasm` file, and as a result, are regarded as derivative works of the WebAssembly distribution of Pandoc.

### More details

For an overview of the licenses of all the JavaScript dependencies of this extension at runtime, please navigate to your JupyterLite deployment > "Help" menu > > "Licenses" after installing and rebuilding it.

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlite_pandoc_pdf_exporter directory

# Set up a virtual environment and install package in development mode
python -m venv .venv
source .venv/bin/activate
pip install --editable "."

# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite

# Rebuild extension Typescript source after making changes
# IMPORTANT: Unlike the steps above which are performed only once, do this step
# every time you make a change.
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlite-pandoc-pdf-exporter
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlite-pandoc-pdf-exporter` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
