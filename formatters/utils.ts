import * as Lint from "tslint";
import { find, reverse, sortBy, map, groupBy, mapValues, chain, countBy, filter } from "lodash";
import { RuleFailure } from "tslint";

export const getSummary = (failures: Lint.IRuleFailureJson[]) => {
  const failuresSummary = getFailuresSummary(failures);
  const fixableFailuresSummary = getFixableFailuresSummary(failures);

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

export const getFailuresSummaryByFile = (failures: Lint.RuleFailure[]): Array<{
  count: number,
  fixableCount: number,
  filename: string
}> => {
  return reverse(sortBy(
    map(
      groupBy(failures, (f) => {
        return (f as RuleFailure).getFileName();
      }),
      (failuresForFile, filename) => {
        return getSummary(failuresForFile.map(f => f.toJson())).reduce((acc, current) => {
          return {
            ...acc,
            count: acc.count + current.count,
            fixableCount: acc.fixableCount + current.fixableCount,
          }
        }, {
            count: 0,
            fixableCount: 0,
            filename: [...filename.split('/')].pop() as string
          });
      }
    ),
    (o) => o.count
  ));
}

export const getFailuresSummary = (failures: Lint.IRuleFailureJson[]) => {
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

export const getFixableFailuresSummary = (failures: Lint.IRuleFailureJson[]) => {
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
