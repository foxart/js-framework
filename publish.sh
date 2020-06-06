#!/usr/bin/env bash

BRANCH=$(git branch | grep "\*" | cut -d ' ' -f2)
MESSAGE=$(git log -1 --oneline)
VERSION=$(node -p "require('./package.json').version")

if [[ "${BRANCH}" != "master" ]]; then
  printf "branch <\x1b[31m%s\x1b[0m> cannot be published\n" "$BRANCH"
elif [[ "$MESSAGE" == *$VERSION* ]]; then
  printf "version <\x1b[31m%s\x1b[0m> already published\n" "$VERSION"
else
  #    ~/disconnect_cisco.sh
  npm version patch
  NEW=$(node -p "require('./package.json').version")
  git commit -a -m "update to <$NEW>"
  git push
  npm publish
  printf "<\x1b[32m%s\x1b[0m>\n" "$NEW"
fi
