const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["./src/index.tsx"],
  bundle: true,
  platform: "browser",
  target: "es6",
  tsconfig: "./tsconfig.json",
  outdir: "./public/js",
  watch: process.argv.some((arg) => arg.toString().indexOf("watch") !== -1),
  jsx: "automatic",
});
