#!/bin/bash
# --------------------------------------------------------------------------------------------------
#
# This script is intended to be used in our master pipeline as a way of incrementing the version number
# so that it doesnt colide with any published version. This is needed because our integration tests launch
# a verdaccio instance that serves local tarballs, and if those tarballs have the same version as
# already published modules, it messes things up.
#
# It does so by using a pre-release "build" tag, making it so that locally packed versions will always be
# suffixed with '-build', distinguishing it from publisehd modules.
#
# If you need to run integration tests locally against the distribution tarballs, you should run this
# script locally as well before building and packing the repository.
#
# This script only increments the version number in the version files, it does not generate a changelog.
#
# --------------------------------------------------------------------------------------------------
set -euo pipefail
scriptdir=$(cd $(dirname $0) && pwd)

version=${1:-minor}
export BUMP_CANDIDATE=true
${scriptdir}/bump-version.js ${version}
