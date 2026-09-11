#!/usr/bin/env bash
# Dispatches test file args to the matching jest config: *.e2e-spec.ts files run under
# test/jest-e2e.json (rootDir "."), everything else (src/*.spec.ts) under the default
# package.json jest config (rootDir "src"). A single `test_cmd` can't point at both at
# once since the two configs use different rootDir/testRegex. Called with no args (a
# whole-suite run, e.g. `lane review`), run both configs in full rather than nothing.
set -e
if [ "$#" -eq 0 ]; then
  status=0
  npx jest || status=$?
  npx jest --config ./test/jest-e2e.json || status=$?
  exit $status
fi
e2e=()
unit=()
for f in "$@"; do
  case "$f" in
    *e2e-spec.ts) e2e+=("$f") ;;
    *) unit+=("$f") ;;
  esac
done
status=0
if [ ${#unit[@]} -gt 0 ]; then
  npx jest "${unit[@]}" || status=$?
fi
if [ ${#e2e[@]} -gt 0 ]; then
  npx jest --config ./test/jest-e2e.json "${e2e[@]}" || status=$?
fi
exit $status
