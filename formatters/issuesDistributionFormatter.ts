import * as Lint from "tslint";
import { map } from "lodash";
import { table, TableUserConfig, getBorderCharacters } from "table";
import chalk from "chalk";
import { getFailuresSummaryByFile } from "./utils";

export class Formatter extends Lint.Formatters.AbstractFormatter {
  public format(failures: Lint.RuleFailure[]): string {
    const failuresJSON = failures.map((failure: Lint.RuleFailure) =>
      failure.toJson()
    );

    const summary = getFailuresSummaryByFile(failures)

    if (failures.length === 0) {
      return '\n';
    }

    return '\n' + this.formatSummary(summary, failures.length);
  }

  private formatSummary(failuresTotals: Array<{
    count: number,
    fixableCount: number,
    filename: string,
  }>, numberOfFailures: number): string {

    let tableConfig = <TableUserConfig>{
      border: getBorderCharacters("ramac"),
      columns: {
        0: {
          alignment: "left",
          width: 30
        },
        1: {
          alignment: "left",
        },
        2: {
          alignment: "left",
        },
        3: {
          alignment: "left",
        }
      }
    };

    const summaryTable: Array<Array<string>> = [[
      chalk.magenta.bold("Source"),
      `${chalk.magenta.bold("Issues")}`,
      `${chalk.magenta.bold("Fixable")}`,
      `${chalk.magenta.bold("Impact (Autofix impact)")}`,
    ]]

    const result = map(failuresTotals.slice(0, 30), (issuesSummary) => {
      const { filename, count, fixableCount } = issuesSummary
      summaryTable.push([
        filename,
        count.toString(),
        fixableCount.toString(),
        `${chalk.green((count / numberOfFailures).toPrecision(2))} (${chalk.green((-1 * fixableCount / numberOfFailures).toPrecision(2))})`,
      ]);
    });

    const summary =
      `\n ${chalk.red('✖')} Found ${chalk.bold(numberOfFailures.toString())} issues` +
      ` in ${chalk.bold(failuresTotals.length.toString())} files\n ` +
      `  ${chalk.cyan('Showing first 30 files with highest number of issues')}\n\n`;

    return summary + table(summaryTable, tableConfig);
  }
}
