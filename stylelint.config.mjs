/** @type {import('stylelint').Config} */
import stylelint from 'stylelint';
export default {
  extends: ['stylelint-config-standard-scss'],
  overrides: [
    {
      files: ['src/app/**/*.scss'],
      customSyntax: 'postcss-scss'
    }
  ],
  rules: {
    'scss/dollar-variable-empty-line-before': null,
    'scss/at-mixin-argumentless-call-parentheses': null,
    'rule-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'color-hex-length': null,
    'declaration-empty-line-before': null,
    'no-descending-specificity': null,
    'custom-property-pattern': null,
    'property-disallowed-list': [
      'margin-left',
      'margin-right',
      'margin-top',
      'margin-bottom',
      'padding-left',
      'padding-right',
      'padding-top',
      'padding-bottom',
      'top',
      'bottom',
      'left',
      'right'
    ],
    'plugin/value-no-px': true
  },
  plugins: [
    {
      ruleName: 'plugin/value-no-px',
      messages: stylelint.utils.ruleMessages('value-no-px', {
        rejected: 'Use fn.calc-unit() instead of px/rem (only 1px is allowed)'
      }),
      rule: () => {
        return (root, result) => {
          root.walkDecls(decl => {
            const regex = /(?<![\w.$-])((?:\d*\.)?\d+(?:px|rem))\b/g;
            let match;
            while ((match = regex.exec(decl.value)) !== null) {
              if (match[1] !== '1px') {
                stylelint.utils.report({
                  message: 'Use fn.calc-unit() instead of px/rem (only 1px is allowed)',
                  node: decl,
                  result,
                  ruleName: 'plugin/value-no-px',
                  severity: 'error'
                });
              }
            }
          });
        };
      }
    }
  ]
};
