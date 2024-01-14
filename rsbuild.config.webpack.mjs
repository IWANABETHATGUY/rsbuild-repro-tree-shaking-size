import { defineConfig } from "@rsbuild/core";
import { webpackProvider } from "@rsbuild/webpack";
import { pluginSwc } from "@rsbuild/plugin-swc";
import TerserPlugin from "terser-webpack-plugin";
import * as path from "path";

export default defineConfig({
	provider: webpackProvider,
	plugins: [pluginSwc()],
	tools: {
		webpack: {
			output: {
				// path: path.resolve(__dirname, "webpack-dist"),
				// env: {
				// 	arrowFunction: false,
				// },
			},

			// return this.outputOptions.environment.arrowFunction;
			optimization: {
        splitChunks: false,
				// mangleExports: false,
				concatenateModules: false,
        // moduleIds: 'named',
        // minimize: false,
				minimizer: [
					new TerserPlugin({
						minify: TerserPlugin.swcMinify,
						// `terserOptions` options will be passed to `uglify-js`
						// Link to options - https://github.com/mishoo/UglifyJS#minify-options
						terserOptions: {},
					}),
				],
			},
		},
	},
});
