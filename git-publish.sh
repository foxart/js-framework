#!/usr/bin/env bash

for git_cache in $(git ls-files -i --exclude-standard)
do echo "$git_cache" && git rm -f --cached "$git_cache"
done

VERSION=`npm view fa-nodejs version`
git add -A
git commit -a -m "$VERSION"
git push
