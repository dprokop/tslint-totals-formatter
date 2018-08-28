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

export class Formatter extends Lint.Formatters.AbstractFormatter {
  public format(failures: Lint.RuleFailure[]): string {
    const failuresJSON = failures.map((failure: Lint.RuleFailure) =>
      failure.toJson()
    );

    const summary = this.getSummary(failuresJSON);

    if(failures.length === 0) {
      return '\n';
    }

    return '\n' + this.formatSummary(summary, failures.length);
  }

  private getSummary(failures: Lint.IRuleFailureJson[]) {
    const failuresSummary = this.getFailuresSummary(failures);
    const fixableFailuresSummary = this.getFixableFailuresSummary(failures);

    return failuresSummary.map(value => {
      const fixableEntry = find(fixableFailuresSummary, f => {
        return f.ruleName === value.ruleName;
      });

      return {
        ...value,
        fixableCount: fixableEntry ? fixableEntry.fixableCount : 0
      };
    });
  }

  private getFailuresSummary(failures: Lint.IRuleFailureJson[]) {
    const severities = mapValues(groupBy(failures, 'ruleName'), (v, k) => {
      return v[0].ruleSeverity;
    })

    return chain(
      countBy(failures, f => {
        return f.ruleName;
      })
    )
      .map((val, key) => {
        return {
          ruleName: key,
          count: val,
          ruleSeverity: severities[key],
        };
      })
      .sortBy("count")
      .reverse()
      .toJSON();
  }

  private getFixableFailuresSummary(failures: Lint.IRuleFailureJson[]) {
    return chain(
      countBy(
        filter(failures, f => {
          return f.fix !== undefined;
        }),
        f => {
          return f.ruleName;
        }
      )
    )
      .map((val, key) => {
        return { ruleName: key, fixableCount: val };
      })
      .sortBy("fixableCount")
      .reverse()
      .toJSON();
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
        `${chalk.magenta.bold("Count")} (${numberOfFailures} total)`,
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

    return table(summaryTable, tableConfig);
  }
}
