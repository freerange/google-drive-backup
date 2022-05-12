{ pkgs ? import <nixpkgs> {} }:
with pkgs;

stdenv.mkDerivation {
  buildInputs = [ nodejs-14_x ];
  name = "google-drive-backup";
}
