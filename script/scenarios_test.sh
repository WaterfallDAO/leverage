#!/bin/bash

set -eo pipefail

dir=`dirname $0`
proj_root="$dir/.."
network=${NETWORK:-test}
verbose=${verbose:-}

total_runner=$1
current_runner=$2


debug_args="-n --inspect" #add "debugger" statements to javascript and interact with running code in repl found at chrome://inspect
[[ -z $DEBUG ]] && debug_args=""

# Compile scenario runner
[[ -z $NO_TSC ]] && "$proj_root/scenario/script/tsc"

# Build scenario stubs
[[ -z $NO_BUILD_STUB ]] && "$proj_root/script/compile"

# Build scenario stubs
[[ -z $NO_BUILD_SCEN ]] && "$proj_root/script/build_scenarios" $total_runner $current_runner

[[ -n $NO_RUN ]] && exit 0

args=()
for arg in "$@"; do
  mapped=`node -e "console.log(\"$arg\".replace(/spec\/scenario\/(.*).scen/i, \"tests/Scenarios/\\$1ScenTest.js\"))"`
  args+=("$mapped")
done

proj_root="$proj_root" verbose="$verbose" NODE_OPTIONS="--max-old-space-size=4096" npx $debug_args saddle test tests/Scenarios/*
