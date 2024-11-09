import { transformAsync } from "@babel/core";
import type { Plugin, TransformResult } from "vite";
import chya from "@chya/babel-plugin-chya";

export default function chyaPlugin(
  options: Partial<{ hot?: boolean; dev?: boolean }> = {}
): Plugin {
  let needHmr = false;
  let projectRoot = process.cwd();

  return {
    name: "chya",
    enforce: "pre",
    configResolved(config) {
      needHmr =
        config.command === "serve" &&
        config.mode !== "production" &&
        options.hot !== false;
    },
    async config(userConfig) {
      if (userConfig.root) {
        projectRoot = userConfig.root;
      }
    },

    async transform(code, id): Promise<TransformResult | null> {
      // Process only JavaScript/TypeScript files
      if (/\.(jsx|tsx)$/.test(id)) {
        const inNodeModules = /node_modules/.test(id);

        id = id.replace(/\?.+$/, "");

        // We need to know if the current file extension has a typescript options tied to it
        const shouldBeProcessedWithTypescript = /\.[mc]?tsx$/i.test(id);
        const plugins: NonNullable<
          NonNullable<babel.TransformOptions["parserOpts"]>["plugins"]
        > = ["jsx"];

        if (shouldBeProcessedWithTypescript) {
          plugins.push("typescript");
        }

        const opts: babel.TransformOptions = {
          root: projectRoot,
          filename: id,
          sourceFileName: id,
          presets: [
            ["@babel/preset-env", { modules: false }],
            ["@babel/preset-react", { throwIfNamespace: false }]
          ],
          plugins:
            needHmr && !inNodeModules ? [[chya, { bundler: "vite" }]] : [chya],
          ast: false,
          sourceMaps: true,
          configFile: false,
          babelrc: false,
          parserOpts: {
            plugins
          }
        };

        console.log("APPLIED========================");

        // Transform code using Babel with the specified config
        const result = await transformAsync(code, opts);

        return result
          ? ({ code: result.code, map: result.map } as TransformResult)
          : null;
      }

      return null; // Do not transform files that don't match the extensions
    }
  };
}
