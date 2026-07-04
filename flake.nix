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
              pkgs.just
              pkgs.nodejs_24
              pkgs.pnpm_10
              pkgs.svelte-language-server
              pkgs.typos
              pkgs.typescript-language-server
            ] ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
              pkgs.patchelf
            ];

            shellHook = ''
              echo "yukiotechblog dev shell: node $(node --version), pnpm $(pnpm --version)"

              ${pkgs.lib.optionalString pkgs.stdenv.isLinux ''
                # Wrangler launches npm's workerd binary, which needs an explicit
                # dynamic linker path on NixOS.
                export NIX_LD="${pkgs.stdenv.cc.bintools.dynamicLinker}"
                export NIX_LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc ]}"
              ''}

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
