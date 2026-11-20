import eslint from '@eslint/js';
import angular from 'angular-eslint';
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['playwright-report/**', 'test-results/**', 'coverage/**', 'dist/**', '.angular/**']
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: {
      boundaries
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true
        }
      },

      'boundaries/elements': [
        {
          type: 'pages',
          pattern: 'src/app/pages/*',
          capture: ['pageName'],
          partialMatch: false
        },
        {
          type: 'interfaces',
          pattern: 'src/app/interfaces',
          partialMatch: false
        },
        {
          type: 'utils',
          pattern: 'src/app/utils',
          partialMatch: false
        },
        {
          type: 'common',
          pattern: 'src/app/common',
          partialMatch: false
        }
      ]
    },

    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
      // `_`-prefixed args are required by a signature but unused (e.g. Angular `ngTemplateContextGuard`).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: {
                element: {
                  type: 'pages'
                }
              },
              disallow: {
                to: {
                  element: {
                    type: 'pages',
                    captured: {
                      pageName: '!{{from.element.captured.pageName}}'
                    }
                  }
                }
              },
              message: 'The page {{from.element.captured.pageName}} cannot import {{to.element.captured.pageName}}.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility]
  }
);
