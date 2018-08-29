import * as Lint from "tslint";
import {
  countBy,
  chain,
  filter,
  find,
  groupBy,
  mapValues
} from "lodash";
import { table, TableUserConfig, getBorderCharacters } from "table";
import chalk from "chalk";
import { getSummary } from "./utils";

export class Formatter extends Lint.Formatters.AbstractFormatter {
  public format(failures: Lint.RuleFailure[]): string {
    const failuresJSON = failures.map((failure: Lint.RuleFailure) =>
      failure.toJson()
    );

    const summary = getSummary(failuresJSON);

    if(failures.length === 0) {
      return '\n';
    }

    return '\n' + this.formatSummary(summary, failures.length);
  }

  private formatSummary(failuresTotals: Array<{
    ruleName: string,
    ruleSeverity: string,
    count: number,
    fixableCount: number
  }>, numberOfFailures: number): string {
    let summaryTable: Array<Array<string>> = [
      [
        chalk.magenta.bold("Rule"),
        `${chalk.magenta.bold("Count")} (${numberOfFailures})`,
        `${chalk.magenta.bold("Fixable")} (% issue / % total)`
      ]
    ];

    let tableConfig = <TableUserConfig>{
      border: getBorderCharacters("ramac"),
      columns: {
        0: {
          alignment: "left",
        },
        1: {
          alignment: "left",
        },
        2: {
          alignment: "left",
        }
      }
    };

    failuresTotals.forEach(element => {
      const percOfIssues = chalk.yellow(`${(100 * element.count/numberOfFailures).toFixed(2)}%`);
      const percOfFixableIssues = chalk.yellow(`${(100 * element.fixableCount/element.count).toFixed(2)}%`);
      const percOfFixableIssuesVsTotalIssue = chalk.yellow(`${(100 * element.fixableCount/numberOfFailures).toFixed(2)}%`);
      const severityIcon = element.ruleSeverity === 'WARNING' ? chalk.yellow('⚠') : chalk.red('✖')
      summaryTable.push([
        `${severityIcon}  ${element.ruleName}`,
        `${element.count} (${percOfIssues})`,
        `${element.fixableCount} (${percOfFixableIssues} / ${percOfFixableIssuesVsTotalIssue})`
      ]);
    });

    const summary =
      `\n ${chalk.red('✖')} Found ${chalk.bold(numberOfFailures.toString())} issues\n` +
      `   ${chalk.cyan('For issues distribution across files use issuesDistribution formatter')}\n\n`;

    return summary + table(summaryTable, tableConfig);
  }
}
