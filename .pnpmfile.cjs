// typescript-eslint needs the TypeScript 6 compiler API. TypeScript 7 does not ship one.
const typescriptApiPackages = new Set([
  "typescript-eslint",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "@typescript-eslint/typescript-estree",
  "@typescript-eslint/utils",
  "@typescript-eslint/type-utils",
  "@typescript-eslint/project-service",
  "@typescript-eslint/tsconfig-utils",
  "ts-api-utils",
  "eslint-import-resolver-typescript",
]);

function readPackage(pkg) {
  if (!typescriptApiPackages.has(pkg.name)) {
    return pkg;
  }

  pkg.dependencies = pkg.dependencies ?? {};
  pkg.dependencies.typescript = "6.0.3";

  if (pkg.peerDependencies) {
    delete pkg.peerDependencies.typescript;
  }
  if (pkg.peerDependenciesMeta) {
    delete pkg.peerDependenciesMeta.typescript;
  }

  return pkg;
}

module.exports = {
  hooks: { readPackage },
};
