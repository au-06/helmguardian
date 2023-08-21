const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    // Get input values from GitHub Actions inputs
    const chartDirectory = core.getInput('chart-directory');
    const chartYaml = core.getInput('chart-yaml');
    const chartmuseumUrl = core.getInput('chartmuseum-url');
    const chartRepo = core.getInput('chart-repo');
    const chartName = core.getInput('chart-name');

    // Check current chart version
    let currentChartVersion = '';
    await exec.exec(`grep -E '^version:' ${chartYaml} | awk '{print $2}'`, [], {
      silent: true,
      listeners: {
        stdout: (data) => {
          currentChartVersion += data.toString();
        },
      },
    });
    core.exportVariable('CURRENT_CHART_VERSION', currentChartVersion.trim());

    // Add ChartMuseum repository
    await exec.exec('helm', ['repo', 'add', chartRepo, chartmuseumUrl]);

    // Update helm repository
    await exec.exec('helm', ['repo', 'update']);

    // Search existing chart on ChartMuseum
    let chartSearchResult = '';
    await exec.exec(`helm search repo ${chartRepo}/${chartName} --versions -o json`, [], {
      silent: true,
      listeners: {
        stdout: (data) => {
          chartSearchResult += data.toString();
        },
      },
    });

    if (!chartSearchResult.trim()) {
      core.info(`Chart version ${currentChartVersion.trim()} does not exist on ChartMuseum.`);
    } else {
      core.info(`Chart version ${currentChartVersion.trim()} already exists on ChartMuseum. Exiting...`);
      core.setFailed('Chart version already exists on ChartMuseum.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
