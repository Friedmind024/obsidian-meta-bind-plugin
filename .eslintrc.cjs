/** @type {import('eslint').Linter.Config} */
const config = {
	root: true,
	parser: '@typescript-eslint/parser',
	env: {
		node: true,
	},
	plugins: ['isaacscript', 'import', 'only-warn', 'no-relative-import-paths'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
	],
	parserOptions: {
		sourceType: 'module',
		tsconfigRootDir: __dirname,
		ecmaVersion: 'latest',
		project: ['./tsconfig.json', './packages/*/tsconfig.json'],
	},
	rules: {
		'@typescript-eslint/no-explicit-any': ['warn'],

		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
		],
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{ prefer: 'type-imports', fixStyle: 'inline-type-imports' },
		],

		'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
		'@typescript-eslint/restrict-template-expressions': 'off',

		'no-relative-import-paths/no-relative-import-paths': 'error',

		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/explicit-function-return-type': ['warn'],
		'@typescript-eslint/require-await': 'off',
	},
	overrides: [
		{
			files: ['packages/core/src/**/*.ts'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								group: ['packages/obsidian/*'],
								message: 'Core should not import from the Obsidian Adapter.',
							},
							{
								group: ['packages/publish/*'],
								message: 'Core should not import from the Obsidian Publish Adapter.',
							},
						],
					},
				],
			},
		},
	],
};

module.exports = config;
