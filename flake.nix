{
  description = "Development environment for yukiotechblog";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems =
        f:
        nixpkgs.lib.genAttrs systems (
          system:
          f {
            pkgs = import nixpkgs { inherit system; };
          }
        );

    in
    {
      devShells = forAllSystems (
        { pkgs }:
        {
          default = pkgs.mkShellNoCC {
            packages = [
              pkgs.nodejs_24
              pkgs.pnpm_10
              pkgs.svelte-language-server
              pkgs.typos
              pkgs.typescript-language-server
            ];

            shellHook = ''
              echo "yukiotechblog dev shell: node $(node --version), pnpm $(pnpm --version)"

              if [ -f package.json ] && [ -f pnpm-lock.yaml ]; then
                if [ ! -f node_modules/.pnpm/lock.yaml ] || [ pnpm-lock.yaml -nt node_modules/.pnpm/lock.yaml ]; then
                  echo "Installing dependencies..."
                  pnpm install --frozen-lockfile
                fi
              fi
            '';
          };
        }
      );
    };
}
