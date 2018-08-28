# TSLint totals formatter

A TSLint formatter that displays short overview of lint issues' scale in your project.

<img width="469" alt="tslint totals formatter" src="docs/screenshot.png">

## Usage

From command line:

```
tslint -c tslint.json --project tsconfig.json -s node_modules/tslint-totals-formatter/formatters -t totals
```

or from `npm scripts`
```
{
  "lint:totals": "tslint -c tslint.json --project tsconfig.json -s node_modules/tslint-totals-formatter/formatters -t totals"
}
```



