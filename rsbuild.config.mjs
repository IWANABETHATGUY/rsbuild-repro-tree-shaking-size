import { defineConfig } from "@rsbuild/core";

export default defineConfig({
  tools: {
    rspack: {
      optimization: {
        splitChunks: false,
				// mangleExports: false,
				// concatenateModules: false,
        // moduleIds: 'named',
        // minimize: false,
      },
      experiments: {
        rspackFuture: {
          newTreeshaking: true,
        },
      },
    },
  },
});
